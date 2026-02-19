import React, { useState } from 'react';

/**
 * ファイル名から年を推測する
 */
const guessYearFromFilename = (filename) => {
    const match = filename.match(/(20\d{2}|19\d{2})/);
    return match ? parseInt(match[1], 10) : null;
};

/**
 * ファイル年度確認ダイアログ
 * 各ファイルに年度を割り当てて読み込む
 * onConfirm(files, years) を呼び出す
 */
const FileOrderConfirmDialog = ({ files, onConfirm, onCancel, initialYears = null }) => {
    // ファイル名でソートした初期順序
    const sortedFiles = [...files].sort((a, b) => a.name.localeCompare(b.name));

    const [years, setYears] = useState(
        sortedFiles.map((f, i) => {
            if (initialYears && initialYears[i] != null) return initialYears[i];
            return guessYearFromFilename(f.name) ?? '';
        })
    );

    const handleYearChange = (index, value) => {
        setYears(prev => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
    };

    const allYearsValid = years.every(y => {
        const n = parseInt(y, 10);
        return !isNaN(n) && n >= 1900 && n <= 2100;
    });

    const handleConfirm = () => {
        const parsedYears = years.map(y => {
            const n = parseInt(y, 10);
            return isNaN(n) ? null : n;
        });
        onConfirm(sortedFiles, parsedYears);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
                {/* ヘッダー */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-5 text-white">
                    <h2 className="text-lg font-bold">ファイルの年度確認</h2>
                    <p className="text-indigo-100 text-sm mt-1">
                        各ファイルの年度を確認・修正してください
                    </p>
                </div>

                {/* ファイルリスト */}
                <div className="px-6 py-4 space-y-3 max-h-96 overflow-y-auto">
                    {sortedFiles.map((file, index) => (
                        <div
                            key={file.name}
                            className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50"
                        >
                            <span className="text-xl shrink-0">📄</span>
                            <span className="text-sm text-gray-700 font-medium flex-1 truncate" title={file.name}>
                                {file.name}
                            </span>
                            <input
                                type="number"
                                value={years[index]}
                                onChange={(e) => handleYearChange(index, e.target.value)}
                                placeholder="例: 2024"
                                min="1900"
                                max="2100"
                                className={`
                                    w-24 px-2 py-1.5 text-sm border rounded-lg text-center font-semibold
                                    focus:outline-none focus:ring-2 focus:ring-indigo-400
                                    ${years[index] !== '' && !isNaN(parseInt(years[index], 10))
                                        ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                                        : 'border-red-300 bg-red-50 text-red-500'
                                    }
                                `}
                            />
                            <span className="text-xs text-gray-400 shrink-0">年</span>
                        </div>
                    ))}
                </div>

                {/* 警告 */}
                {!allYearsValid && (
                    <div className="mx-6 mb-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs text-amber-700">⚠️ 年度が未入力または無効なファイルがあります</p>
                    </div>
                )}

                {/* フッター */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!allYearsValid}
                        className={`px-5 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-sm
                            ${allYearsValid
                                ? 'bg-indigo-600 hover:bg-indigo-700'
                                : 'bg-gray-300 cursor-not-allowed'
                            }`}
                    >
                        この内容で読み込む
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FileOrderConfirmDialog;
