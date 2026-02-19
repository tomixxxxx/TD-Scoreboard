const XLSX = require('xlsx');

// Excelファイルを読み込む
const workbook = XLSX.readFile('public/全店舗売上.xlsx');

console.log('=== シート一覧 ===');
console.log(workbook.SheetNames.join(', '));
console.log('');

// CSV計算シートのヘッダーを確認
if (workbook.SheetNames.includes('CSV計算')) {
    const csvSheet = workbook.Sheets['CSV計算'];
    const csvData = XLSX.utils.sheet_to_json(csvSheet, { header: 1 });
    console.log('=== CSV計算シート ヘッダー ===');
    console.log(csvData[0]);
    console.log('');
    console.log('=== CSV計算シート サンプルデータ（1行目） ===');
    console.log(csvData[1]);
    console.log('');
}

// スタッフシートのヘッダーを確認
if (workbook.SheetNames.includes('スタッフ')) {
    const staffSheet = workbook.Sheets['スタッフ'];
    const staffData = XLSX.utils.sheet_to_json(staffSheet, { header: 1 });
    console.log('=== スタッフシート ヘッダー ===');
    console.log(staffData[0]);
    console.log('');
    console.log('=== スタッフシート サンプルデータ（最初の3行） ===');
    for (let i = 1; i <= Math.min(3, staffData.length - 1); i++) {
        console.log(`Row ${i}:`, staffData[i]);
    }
}
