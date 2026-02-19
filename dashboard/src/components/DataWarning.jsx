import React, { useState } from 'react';
import { toNumber } from '../utils/dataProcessor';

const DataWarning = ({ warnings, invalidData }) => {
    const [isOpen, setIsOpen] = useState(false);

    if ((!warnings || warnings.length === 0) && (!invalidData || invalidData.length === 0)) return null;

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('ja-JP').format(toNumber(value));
    };

    return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-md shadow-sm">
            <div className="flex">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3 flex-1">
                    <h3 className="text-sm leading-5 font-medium text-yellow-800">
                        データの確認が必要です
                    </h3>
                    <div className="mt-2 text-sm leading-5 text-yellow-700">
                        <ul className="list-disc pl-5 space-y-1">
                            {warnings.map((warning, index) => (
                                <li key={index}>{warning}</li>
                            ))}
                        </ul>
                    </div>

                    {invalidData && invalidData.length > 0 && (
                        <div className="mt-4">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline focus:outline-none"
                            >
                                {isOpen ? '詳細を隠す' : `除外されたデータ (${invalidData.length}件) を表示`}
                            </button>

                            {isOpen && (
                                <div className="mt-3 bg-white rounded-md border border-yellow-200 overflow-hidden shadow-sm">
                                    <div className="overflow-x-auto max-h-60">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-yellow-50">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ファイル名</th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">シート名</th>
                                                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">行番号</th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">店舗</th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">スタッフ</th>
                                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">総売上</th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">理由</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {invalidData.map((row, index) => {
                                                    const store = row['店舗CD'] || row['storeCode'] || row['店舗'];
                                                    const staff = row['スタッフ名'] || row['staffName'];
                                                    const isStoreError = !store || store === '不明' || store === '#N/A' || store.toString().includes('ERROR');
                                                    const isStaffError = !staff || staff === '不明' || staff === '#N/A';

                                                    let reason = '';
                                                    if (isStoreError) reason = '店舗不明/エラー';
                                                    else if (isStaffError) reason = 'スタッフ名不明';
                                                    else reason = 'データ形式エラー';

                                                    return (
                                                        <tr key={index} className="hover:bg-yellow-50">
                                                            <td className="px-3 py-2 text-xs text-gray-500 max-w-[160px] truncate" title={row['_sourceFile']}>
                                                                {row['_sourceFile'] || '-'}
                                                            </td>
                                                            <td className="px-3 py-2 text-xs text-gray-500">
                                                                {row['_sourceSheet'] || '-'}
                                                            </td>
                                                            <td className="px-3 py-2 text-xs text-center text-gray-500 font-mono">
                                                                {row['_rowIndex'] != null ? `${row['_rowIndex']}行` : '-'}
                                                            </td>
                                                            <td className="px-3 py-2 text-xs text-gray-900">{store || '-'}</td>
                                                            <td className="px-3 py-2 text-xs text-gray-900">{staff || '-'}</td>
                                                            <td className="px-3 py-2 text-xs text-right tabular-nums">{formatCurrency(row['総売上'] || 0)}</td>
                                                            <td className="px-3 py-2 text-xs text-red-600 font-medium">{reason}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DataWarning;
