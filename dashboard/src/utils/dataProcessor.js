/**
 * データ処理ユーティリティ関数
 */

/**
 * 店舗の表示順序（固定）
 * この順序でグラフ・テーブルを表示する
 */
export const STORE_ORDER = ['奈良', '天理', '生駒', 'villa'];

/**
 * 店舗リストを固定順序でソートする
 */
export const sortStoresByOrder = (stores) => {
    return [...stores].sort((a, b) => {
        const ai = STORE_ORDER.findIndex(s => a.includes(s));
        const bi = STORE_ORDER.findIndex(s => b.includes(s));
        if (ai === -1 && bi === -1) return a.localeCompare(b);
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
    });
};

/**
 * 数値に変換（文字列の場合も対応）
 */
export const toNumber = (value) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const num = parseFloat(value.replace(/,/g, ''));
        return isNaN(num) ? 0 : num;
    }
    return 0;
    return 0;
};

/**
 * 金額フォーマット（日本円、小数なし）
 */
export const formatCurrency = (value) => {
    return new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 0 }).format(toNumber(value));
};

/**
 * 文字列から一意の画像インデックスを生成 (1-12)
 */
export const getPersonImageIndex = (name) => {
    if (!name) return 1;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    // 負の数を避ける
    hash = Math.abs(hash);
    // 画像は1-32まで存在
    return (hash % 32) + 1;
};

/**
 * 有効なデータ行かどうかを判定
 * 店舗名やスタッフ名が不明・エラーのデータを除外するために使用
 */
export const isValidRow = (row) => {
    // 店舗チェック
    const store = row['店舗CD'] || row['storeCode'] || row['店舗'];
    // 店舗名が存在しない、または無効な値をチェック
    if (!store || store === '不明' || store === '#N/A' || store.toString().includes('ERROR')) return false;

    return true;
};

/**
 * 無効なデータ行を取得（確認用）
 */
export const getInvalidRawData = (data) => {
    if (!data || data.length === 0) return [];
    return data.filter(row => !isValidRow(row));
};

/**
 * 年・月でデータをフィルタリング
 */
export const filterByPeriod = (data, year, month) => {
    if (!data || data.length === 0) return [];

    return data.filter(row => {
        const rowYear = row['年'] || row['year'];
        const rowMonth = row['月'] || row['month'];

        if (year && rowYear && toNumber(rowYear) !== toNumber(year)) return false;
        if (month && rowMonth && toNumber(rowMonth) !== toNumber(month)) return false;

        return true;
    });
};

/**
 * データから利用可能な年のリストを取得
 */
export const getAvailableYears = (data) => {
    if (!data || data.length === 0) return [];

    const years = new Set();
    data.forEach(row => {
        // 年取得は有効データチェック前に行う（データ構造確認のため）
        const year = row['年'] || row['year'];
        if (year) years.add(toNumber(year));
    });

    return Array.from(years).sort((a, b) => b - a); // 降順
};

/**
 * データから利用可能な月のリストを取得
 */
export const getAvailableMonths = (data, year) => {
    if (!data || data.length === 0) return [];

    const filteredData = year ? filterByPeriod(data, year, null) : data;
    const months = new Set();

    filteredData.forEach(row => {
        const month = row['月'] || row['month'];
        if (month) months.add(toNumber(month));
    });

    return Array.from(months).sort((a, b) => a - b); // 昇順
};

/**
 * 店舗別にデータをグループ化
 */
export const groupByStore = (data) => {
    if (!data || data.length === 0) return {};

    const grouped = {};
    data.forEach(row => {
        if (!isValidRow(row)) return; // 無効データ除外

        const storeCode = row['店舗CD'] || row['storeCode'] || row['店舗'];
        if (!grouped[storeCode]) {
            grouped[storeCode] = [];
        }
        grouped[storeCode].push(row);
    });

    return grouped;
};

/**
 * スタッフ別に年間データを集計
 */
export const aggregateAnnual = (data, year) => {
    if (!data || data.length === 0) return [];

    const yearData = filterByPeriod(data, year, null);
    const staffMap = {};

    yearData.forEach(row => {
        if (!isValidRow(row)) return; // 無効データ除外

        const staffCode = row['スタッフCD'] || row['staffCode'];
        const staffName = row['スタッフ名'] || row['staffName'];

        if (!staffCode && !staffName) return;

        // スタッフ名が不明の場合も除外
        if (staffName === '不明' || staffName === '#N/A') return;

        const id = staffCode || staffName;

        if (!staffMap[id]) {
            staffMap[id] = {
                スタッフCD: staffCode,
                スタッフ名: staffName,
                総売上: 0,
                指名売上: 0,
                フリー売上: 0,
                商品売上: 0,
                指名報酬: 0,
                フリー報酬: 0,
                商品報酬: 0,
                商品報酬: 0,
                報酬合計: 0,
                指名数: 0,
            };
        }

        const staff = staffMap[id];
        staff.総売上 += toNumber(row['総売上'] || row['totalSales']);
        staff.指名売上 += toNumber(row['指名売上'] || row['nominatedSales']);
        staff.フリー売上 += toNumber(row['フリー売上'] || row['freeSales']);
        staff.商品売上 += toNumber(row['商品売上'] || row['productSales']);
        staff.指名報酬 += toNumber(row['指名報酬'] || row['nominatedReward']);
        staff.フリー報酬 += toNumber(row['フリー報酬'] || row['freeReward']);
        staff.商品報酬 += toNumber(row['商品報酬'] || row['productReward']);
        staff.報酬合計 += toNumber(row['報酬合計'] || row['totalReward']);
        staff.指名数 += toNumber(row['指名数'] || row['nominatedCount']);
    });

    return Object.values(staffMap).map(staff => ({
        ...staff,
        客単価: staff.指名数 > 0 ? staff.総売上 / staff.指名数 : 0,
        指名率: staff.総売上 > 0 ? (staff.指名売上 / staff.総売上) * 100 : 0
    }));
};

/**
 * TOP3ランキングを取得（集計機能付き）
 */
export const getTop3 = (data, key) => {
    if (!data || data.length === 0) return [];

    // スタッフごとに集計
    const aggregated = {};
    data.forEach(row => {
        if (!isValidRow(row)) return; // 無効データ除外

        const staffCode = row['スタッフCD'] || row['staffCode'];
        const staffName = row['スタッフ名'] || row['staffName'] || staffCode || '不明';

        // スタッフコードがない行はスキップ（店舗行など）
        if (!staffCode && !row['スタッフ名']) return;
        if (staffName === '不明' || staffName === '#N/A') return;

        const id = staffCode || staffName; // 一意のキー

        if (!aggregated[id]) {
            aggregated[id] = { ...row, [key]: 0 }; // 初期化
            // 数値項目を0リセット（加算するため）
            aggregated[id][key] = 0;
        }

        aggregated[id][key] += toNumber(row[key]);
        if (staffName !== '不明') aggregated[id]['スタッフ名'] = staffName;
    });

    const sorted = Object.values(aggregated).sort((a, b) => {
        return b[key] - a[key];
    });

    return sorted.slice(0, 3);
};

/**
 * 全店舗の合計を計算
 * ※KPI計算用：不正データも含むか議論があるが、整合性のためここでも除外する
 */
export const calculateTotals = (data) => {
    if (!data || data.length === 0) {
        return {
            総売上: 0,
            総客数: 0,
            平均客単価: 0,
        };
    }

    let 総売上 = 0;
    let 総客数 = 0;

    data.forEach(row => {
        if (!isValidRow(row)) return; // 無効データ除外

        総売上 += toNumber(row['総売上'] || row['totalSales']);
        総客数 += toNumber(row['指名数'] || row['nominatedCount'] || 0);
    });

    const 平均客単価 = 総客数 > 0 ? 総売上 / 総客数 : 0;

    return {
        総売上,
        総客数,
        平均客単価,
    };
};

/**
 * 店舗別の月次推移データを作成
 */
export const getMonthlyTrends = (data, year) => {
    if (!data || data.length === 0) return {};

    const yearData = filterByPeriod(data, year, null);
    const storeMonthMap = {};

    yearData.forEach(row => {
        if (!isValidRow(row)) return; // 無効データ除外

        const storeCode = row['店舗CD'] || row['storeCode'] || row['店舗'];
        const month = toNumber(row['月'] || row['month']);

        if (!storeMonthMap[storeCode]) {
            storeMonthMap[storeCode] = {};
        }

        if (!storeMonthMap[storeCode][month]) {
            storeMonthMap[storeCode][month] = {
                month,
                総売上: 0,
                指名売上: 0,
                フリー売上: 0,
                商品売上: 0,
            };
        }

        const entry = storeMonthMap[storeCode][month];
        entry.総売上 += toNumber(row['総売上'] || row['totalSales']);
        entry.指名売上 += toNumber(row['指名売上'] || row['nominatedSales']);
        entry.フリー売上 += toNumber(row['フリー売上'] || row['freeSales']);
        entry.商品売上 += toNumber(row['商品売上'] || row['productSales']);
    });

    const result = {};
    Object.keys(storeMonthMap).forEach(storeCode => {
        result[storeCode] = Object.values(storeMonthMap[storeCode]).sort((a, b) => a.month - b.month);
    });

    return result;
};

/**
 * 年間総売上を計算
 */
export const calculateAnnualTotal = (data, year) => {
    const yearData = filterByPeriod(data, year, null);
    return calculateTotals(yearData).総売上;
};

/**
 * 月間総売上を計算
 */
export const calculateMonthlyTotal = (data, year, month) => {
    const monthData = filterByPeriod(data, year, month);
    return calculateTotals(monthData).総売上;
};

/**
 * 前年比を計算
 */
export const calculateYoYComparison = (data, year, month) => {
    const currentData = filterByPeriod(data, year, month);
    const previousData = filterByPeriod(data, year - 1, month);

    const currentTotal = calculateTotals(currentData).総売上;
    const previousTotal = calculateTotals(previousData).総売上;

    const yoyRate = previousTotal > 0
        ? ((currentTotal - previousTotal) / previousTotal) * 100
        : 0;

    return {
        currentYear: year,
        currentTotal,
        previousYear: year - 1,
        previousTotal,
        yoyRate,
        isPositive: yoyRate >= 0
    };
};

/**
 * 前月比を計算
 */
export const calculateMoMComparison = (data, year, month) => {
    if (!month) return null; // 月未指定時は計算不可

    const currentTotal = calculateMonthlyTotal(data, year, month);

    // 前月の計算（1月の場合は前年の12月）
    let prevYear = year;
    let prevMonth = month - 1;
    if (prevMonth === 0) {
        prevYear = year - 1;
        prevMonth = 12;
    }

    const previousTotal = calculateMonthlyTotal(data, prevYear, prevMonth);

    const momRate = previousTotal > 0
        ? ((currentTotal - previousTotal) / previousTotal) * 100
        : 0;

    return {
        currentMonth: month,
        currentTotal,
        prevMonth,
        previousTotal,
        momRate,
        isPositive: momRate >= 0
    };
};

/**
 * 目標達成率を計算
 */
export const calculateTargetAchievement = (actual, target) => {
    if (!target || target === 0) return 0;
    return (actual / target) * 100;
};

/**
 * 月別総売上の配列を取得（グラフ用）
 */
export const getMonthlyTotals = (data, year) => {
    if (!data || data.length === 0) return [];

    const yearData = filterByPeriod(data, year, null);
    const monthMap = {};

    yearData.forEach(row => {
        if (!isValidRow(row)) return; // 無効データ除外

        const month = toNumber(row['月'] || row['month']);

        if (!monthMap[month]) {
            monthMap[month] = {
                month,
                総売上: 0,
                客数: 0,
            };
        }

        monthMap[month].総売上 += toNumber(row['総売上'] || row['totalSales']);
        monthMap[month].客数 += toNumber(row['指名数'] || row['nominatedCount'] || 0);
    });

    const result = Object.values(monthMap).map(item => ({
        ...item,
        客単価: item.客数 > 0 ? item.総売上 / item.客数 : 0
    }));

    return result.sort((a, b) => a.month - b.month);
};

/**
 * 店舗別月別売上を取得（積み上げ棒グラフ用）
 * 合計売上ライン・客数も含む
 */
export const getMonthlyTotalsByStore = (data, year) => {
    if (!data || data.length === 0) return { chartData: [], stores: [] };

    const yearData = filterByPeriod(data, year, null);
    const monthMap = {};
    const storeSet = new Set();

    yearData.forEach(row => {
        if (!isValidRow(row)) return;

        const month = toNumber(row['月'] || row['month']);
        const store = row['店舗CD'] || row['storeCode'] || row['店舗'] || '不明';

        if (!month) return;

        storeSet.add(store);

        if (!monthMap[month]) {
            monthMap[month] = { month, 合計売上: 0, 総客数: 0 };
        }

        const sales = toNumber(row['総売上'] || row['totalSales']);
        const customers = toNumber(row['指名数'] || row['nominatedCount'] || 0);

        if (!monthMap[month][store]) {
            monthMap[month][store] = 0;
            monthMap[month][`${store}_客数`] = 0;
        }

        monthMap[month][store] += sales;
        monthMap[month][`${store}_客数`] += customers;
        monthMap[month].合計売上 += sales;
        monthMap[month].総客数 += customers;
    });

    const stores = sortStoresByOrder(Array.from(storeSet));
    const chartData = Object.values(monthMap).sort((a, b) => a.month - b.month);

    return { chartData, stores };
};

/**
 * 店舗別売上ランキングを取得
 */
export const getStoreRankings = (data, year, month) => {
    if (!data || data.length === 0) return [];

    const yearData = filterByPeriod(data, year, month);
    const storeGroups = groupByStore(yearData); // 内部でisValidRowを使用

    const rankings = sortStoresByOrder(Object.keys(storeGroups))
        .map(storeCode => {
            const storeData = storeGroups[storeCode];
            const 総売上 = storeData.reduce((sum, row) => sum + toNumber(row['総売上']), 0);
            const 客数 = storeData.reduce((sum, row) => sum + toNumber(row['指名数'] || 0), 0);

            return {
                店舗: storeCode,
                総売上,
                客数,
                客単価: 客数 > 0 ? 総売上 / 客数 : 0
            };
        });

    return rankings.sort((a, b) => b.総売上 - a.総売上);
};

/**
 * 個人売上TOP10を取得
 */
export const getIndividualTop10 = (data, year, month) => {
    if (!data || data.length === 0) return [];

    const filteredData = filterByPeriod(data, year, month);

    const staffMap = {};
    filteredData.forEach(row => {
        if (!isValidRow(row)) return; // 無効データ除外

        const staffCode = row['スタッフCD'] || row['staffCode'];
        const staffName = row['スタッフ名'] || row['staffName'];

        if (!staffCode && !staffName) return;
        if (staffName === '不明' || staffName === '#N/A') return;

        const id = staffCode || staffName;

        if (!staffMap[id]) {
            staffMap[id] = {
                スタッフCD: staffCode,
                スタッフ名: staffName,
                総売上: 0,
                指名数: 0,
                指名売上: 0,
            };
        }

        const staff = staffMap[id];
        staff.総売上 += toNumber(row['総売上'] || row['totalSales']);
        staff.指名数 += toNumber(row['指名数'] || row['nominatedCount'] || 0);
        staff.指名売上 += toNumber(row['指名売上'] || row['nominatedSales']);
    });

    const staffList = Object.values(staffMap).map(staff => ({
        ...staff,
        客単価: staff.指名数 > 0 ? staff.総売上 / staff.指名数 : 0,
        指名率: staff.総売上 > 0 ? (staff.指名売上 / staff.総売上) * 100 : 0
    }));

    return staffList
        .sort((a, b) => b.総売上 - a.総売上)
        .slice(0, 10)
        .map((staff, index) => ({
            ...staff,
            rank: index + 1
        }));
};

/**
 * 補助指標を計算
 */
export const calculateSupplementaryMetrics = (data, year, month) => {
    const filteredData = filterByPeriod(data, year, month);

    if (filteredData.length === 0) {
        return {
            総客数: 0,
            平均客単価: 0,
            平均指名率: 0
        };
    }

    let 総売上 = 0;
    let 総客数 = 0;
    let 総指名売上 = 0;

    filteredData.forEach(row => {
        if (!isValidRow(row)) return; // 無効データ除外

        総売上 += toNumber(row['総売上'] || row['totalSales']);
        総客数 += toNumber(row['指名数'] || row['nominatedCount'] || 0);
        総指名売上 += toNumber(row['指名売上'] || row['nominatedSales']);
    });

    return {
        総客数,
        平均客単価: 総客数 > 0 ? 総売上 / 総客数 : 0,
        平均指名率: 総売上 > 0 ? (総指名売上 / 総売上) * 100 : 0
    };
};

/**
 * データの品質チェック（警告メッセージ生成）
 * CHECK: 既にisValidRowで除外されているため、ここでは除外数を数えるだけ
 */
export const checkDataQuality = (data) => {
    if (!data || data.length === 0) return [];

    const warnings = [];
    let unknownStoreCount = 0;
    let errorValueCount = 0;

    data.forEach(row => {
        const store = row['店舗CD'] || row['storeCode'] || row['店舗'];
        // isValidRow と似ているが、数え上げるためにそのまま
        if (!store || store === '不明' || store === '#N/A' || store.toString().includes('ERROR')) {
            unknownStoreCount++;
        }

        const sales = row['総売上'];
        if (typeof sales === 'string' && (sales.includes('ERROR') || sales.includes('#'))) {
            errorValueCount++;
        }
    });

    if (unknownStoreCount > 0) {
        warnings.push(`無効なデータ（店舗不明/ERROR）が ${unknownStoreCount} 件含まれています。これらはグラフ・集計から自動的に除外されています。下の「除外データ」で詳細を確認できます。`);
    }
    if (errorValueCount > 0) {
        warnings.push(`数値エラーを含むデータが ${errorValueCount} 件検出されました。`);
    }

    return warnings;
};

/**
 * 個人の月次推移データを取得
 */
export const getIndividualTrend = (data, staffName, year) => {
    if (!data || !staffName) return [];

    const yearData = filterByPeriod(data, year, null);
    const monthMap = {};

    // 1-12月の枠を作る
    for (let i = 1; i <= 12; i++) {
        monthMap[i] = {
            month: i,
            総売上: 0,
            指名売上: 0,
            指名数: 0,
        };
    }

    yearData.forEach(row => {
        if (!isValidRow(row)) return;

        const rowStaffName = row['スタッフ名'] || row['staffName'];
        if (rowStaffName !== staffName) return;

        const month = toNumber(row['月'] || row['month']);
        if (month >= 1 && month <= 12) {
            monthMap[month].総売上 += toNumber(row['総売上'] || row['totalSales']);
            monthMap[month].指名売上 += toNumber(row['指名売上'] || row['nominatedSales']);
            monthMap[month].指名数 += toNumber(row['指名数'] || row['nominatedCount']);
        }
    });

    return Object.values(monthMap).map(item => ({
        ...item,
        指名率: item.総売上 > 0 ? (item.指名売上 / item.総売上) * 100 : 0
    }));
};

/**
 * 指定指標での個人ランキングを取得
 */
export const getIndividualRankings = (data, metric, year, month) => {
    // metric: '総売上', '客単価', '指名売上', '商品売上'
    if (!data || data.length === 0) return [];

    const filteredData = filterByPeriod(data, year, month);
    const staffMap = {};

    filteredData.forEach(row => {
        if (!isValidRow(row)) return;

        const staffCode = row['スタッフCD'] || row['staffCode'];
        const staffName = row['スタッフ名'] || row['staffName'];

        if (!staffCode && !staffName) return;
        if (staffName === '不明' || staffName === '#N/A') return;

        const id = staffCode || staffName;

        if (!staffMap[id]) {
            staffMap[id] = {
                スタッフCD: staffCode,
                スタッフ名: staffName,
                総売上: 0,
                指名売上: 0,
                商品売上: 0,
                指名数: 0,
            };
        }

        const staff = staffMap[id];
        staff.総売上 += toNumber(row['総売上'] || row['totalSales']);
        staff.指名売上 += toNumber(row['指名売上'] || row['nominatedSales']);
        staff.商品売上 += toNumber(row['商品売上'] || row['productSales']);
        staff.指名数 += toNumber(row['指名数'] || row['nominatedCount']);
    });

    const rankList = Object.values(staffMap).map(staff => ({
        ...staff,
        客単価: staff.指名数 > 0 ? staff.総売上 / staff.指名数 : 0
    }));

    // ソート
    rankList.sort((a, b) => b[metric] - a[metric]);

    return rankList.slice(0, 10).map((item, index) => ({
        ...item,
        rank: index + 1,
        value: item[metric] // 表示用共通プロパティ
    }));
};

