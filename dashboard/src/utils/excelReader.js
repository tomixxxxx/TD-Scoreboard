import * as XLSX from 'xlsx';

/**
 * ファイル名から年を抽出する（例: "2024年度売上.xlsx" → 2024）
 * 見つからない場合は null を返す
 */
const extractYearFromFilename = (filename) => {
    const match = filename.match(/(20\d{2}|19\d{2})/);
    return match ? parseInt(match[1], 10) : null;
};

/**
 * Excelファイルを読み込んで「CSV計算」シートのデータと「スタッフデータ」シートのマッピングを返す
 * @param {File|string} input - ExcelファイルまたはファイルパスURL
 * @param {number|null} explicitYear - 明示的に指定する年（nullの場合はファイル名から推測）
 * @returns {Promise<{headers: Array, data: Array, staffMap: Object, year: number|null}>}
 */
export const readExcelFile = async (input, explicitYear = null) => {
    try {
        let arrayBuffer;

        if (typeof input === 'string') {
            const response = await fetch(input);
            if (!response.ok) {
                throw new Error(`ファイルの読み込みに失敗しました: ${input}`);
            }
            arrayBuffer = await response.arrayBuffer();
        } else if (input instanceof File) {
            arrayBuffer = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = (e) => reject(new Error('ファイルの読み込みに失敗しました'));
                reader.readAsArrayBuffer(input);
            });
        } else {
            throw new Error('無効な入力です。ファイルパスまたはFileオブジェクトを指定してください。');
        }

        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        // スタッフデータシートを読み込んでマッピングを作成
        const staffMap = {};
        const staffSheetName = workbook.SheetNames.find(name => name.includes('スタッフデータ') || name.includes('スタッフ'));

        if (staffSheetName) {
            const staffSheet = workbook.Sheets[staffSheetName];
            const staffData = XLSX.utils.sheet_to_json(staffSheet, { header: 1, defval: '' });

            // ヘッダー: [登録名, スタッフCD, ...]
            // データ行から スタッフCD -> 登録名 のマッピングを作成
            for (let i = 1; i < staffData.length; i++) {
                const row = staffData[i];
                const staffName = row[0]; // 登録名（1列目）
                const staffCode = row[1]; // スタッフCD（2列目）

                if (staffCode && staffName) {
                    staffMap[staffCode] = staffName;
                }
            }

            console.log(`スタッフマッピング読み込み成功: ${Object.keys(staffMap).length}件`);
        } else {
            console.warn('スタッフデータシートが見つかりません');
        }

        // 店舗順序を取得（表シート）
        const storeOrder = [];
        const tableSheetName = workbook.SheetNames.find(name => name === '表' || name === '店舗リスト');
        if (tableSheetName) {
            const tableSheet = workbook.Sheets[tableSheetName];
            // ヘッダーなしで取得して自身で解析
            const tableData = XLSX.utils.sheet_to_json(tableSheet, { header: 1, defval: '' });

            // 2行目以降のA列(index 0)を取得
            for (let i = 1; i < tableData.length; i++) {
                const row = tableData[i];
                if (row && row[0]) {
                    const storeName = String(row[0]).trim();
                    if (storeName && storeName !== '店舗リスト') {
                        storeOrder.push(storeName);
                    }
                }
            }
            console.log(`店舗順序読み込み成功: ${storeOrder.join(', ')}`);
        } else {
            console.warn('表シートが見つかりません');
        }

        // CSV計算シートを読み込む
        const sheetName = 'CSV計算';
        if (!workbook.SheetNames.includes(sheetName)) {
            alert(`シート「${sheetName}」が見つかりません。利用可能なシート: ${workbook.SheetNames.join(', ')}`);
            return null;
        }

        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (jsonData.length === 0) {
            alert('データが空です');
            return null;
        }

        // ヘッダー行を取得
        const headers = jsonData[0];

        // 列名のエイリアスマッピング（Excelの列名を統一的な名前に変換）
        const columnAliases = {
            '商品': '商品売上', // Excelでは「商品」だが、UIでは「商品売上」として扱う
        };

        // データ行をオブジェクト配列に変換
        // ファイル名または明示的な年指定から年を取得
        const filename = input instanceof File ? input.name : (typeof input === 'string' ? input : '');
        const year = explicitYear !== null ? explicitYear : extractYearFromFilename(filename);

        const data = jsonData.slice(1).map((row, rowIndex) => {
            const obj = {};
            headers.forEach((header, index) => {
                // エイリアスがあればそれを使用、なければ元のヘッダー名を使用
                const columnName = columnAliases[header] || header;
                obj[columnName] = row[index];

                // 元の列名でもアクセスできるようにする（後方互換性のため）
                if (columnAliases[header]) {
                    obj[header] = row[index];
                }
            });

            // スタッフCDから登録名を取得して「スタッフ名」として追加
            const staffCode = obj['スタッフCD'];
            if (staffCode && staffMap[staffCode]) {
                obj['スタッフ名'] = staffMap[staffCode];
            } else {
                // マッピングがない場合は元のスタッフ列の値を使用
                obj['スタッフ名'] = obj['スタッフ'] || staffCode || '不明';
            }

            // 年フィールドを付与（CSV計算シートには年列がないため）
            if (year !== null) {
                obj['年'] = year;
            }

            // トレーサビリティ用メタデータ（DataWarningで使用）
            obj['_sourceFile'] = filename || '不明';
            obj['_sourceSheet'] = sheetName;
            obj['_rowIndex'] = rowIndex + 2; // ヘッダー行(1行目)の次から始まるExcel行番号

            return obj;
        }).filter(row => {
            // 空行をフィルタリング（すべての値が空の行を除外）
            return Object.values(row).some(val => val !== '' && val !== null && val !== undefined);
        });

        console.log(`読み込み成功: ${data.length}行のデータ`);
        return { headers, data, staffMap, storeOrder };
    } catch (error) {
        console.error('Excelファイル読み込みエラー:', error);
        alert(`Excelファイルの読み込みに失敗しました: ${error.message}`);
        return null;
    }
};

/**
 * 複数のExcelファイルを読み込んでデータをマージする
 * @param {File[]} files - Excelファイルの配列
 * @param {(number|null)[]} [fileYears] - 各ファイルに対応する年の配列（省略時はファイル名から推測）
 * @returns {Promise<{headers: Array, data: Array, staffMap: Object, fileNames: string[]}>}
 */
export const readMultipleExcelFiles = async (files, fileYears = null) => {
    const results = await Promise.all(
        files.map((file, i) => {
            const year = fileYears ? fileYears[i] : null;
            return readExcelFile(file, year);
        })
    );

    // 読み込み失敗したファイルを除外
    const validResults = results.filter(r => r !== null);

    if (validResults.length === 0) {
        return null;
    }

    // データをマージ
    const mergedData = validResults.flatMap(r => r.data);

    // staffMapをマージ（後のファイルが優先）
    const mergedStaffMap = validResults.reduce((acc, r) => ({ ...acc, ...r.staffMap }), {});

    // ヘッダーと店舗順序は最初のファイルのものを使用（またはマージ）
    const headers = validResults[0].headers;

    // 店舗順序: 有効な最初の順序を採用
    const storeOrder = validResults.find(r => r.storeOrder && r.storeOrder.length > 0)?.storeOrder || [];

    const fileNames = files.map(f => f.name);

    console.log(`複数ファイル読み込み完了: ${fileNames.join(', ')} / 合計 ${mergedData.length}行`);

    return { headers, data: mergedData, staffMap: mergedStaffMap, fileNames, storeOrder };
};
