import React, { useState } from 'react';
import { toNumber, isValidRow } from '../utils/dataProcessor';

const Tab1_IndividualMonthly = ({ data }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'desc' });

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                データがありません
            </div>
        );
    }

    // 有効なデータのみをフィルタリング
    const validData = data.filter(row => {
        const staffName = row['スタッフ名'] || row['staffName'];
        // isValidRowに加えて、スタッフ名が不明・エラーでないことを確認
        return isValidRow(row) && staffName && staffName !== '不明' && staffName !== '#N/A' && !staffName.toString().includes('ERROR');
    });

    // ソート機能（有効データのみ）
    const handleSort = (key) => {
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = [...validData].sort((a, b) => {
        if (!sortConfig.key) return 0;

        const aVal = toNumber(a[sortConfig.key]);
        const bVal = toNumber(b[sortConfig.key]);

        if (sortConfig.direction === 'asc') {
            return aVal - bVal;
        }
        return bVal - aVal;
    });

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('ja-JP').format(toNumber(value));
    };

    const formatPercent = (value) => {
        return `${toNumber(value).toFixed(1)}%`;
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-6">

            {/* 詳細データテーブル */}
            <div className="bg-white rounded-lg shadow-card border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">詳細データ</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                {[
                                    { key: 'スタッフCD', label: 'スタッフCD' },
                                    { key: 'スタッフ名', label: 'スタッフ名' },
                                    { key: '総売上', label: '総売上' },
                                    { key: '指名売上', label: '指名売上' },
                                    { key: 'フリー売上', label: 'フリー売上' },
                                    { key: '商品売上', label: '商品売上' },
                                    { key: '客単価', label: '客単価' },
                                    { key: '指名数', label: '指名数' },
                                    { key: '指名歩合率', label: '指名歩合率' },
                                    { key: '指名報酬', label: '指名報酬' },
                                    { key: 'フリー歩合率', label: 'フリー歩合率' },
                                    { key: 'フリー報酬', label: 'フリー報酬' },
                                    { key: '商品報酬', label: '商品報酬' },
                                    { key: '報酬合計', label: '報酬合計' },
                                    { key: '出勤日数', label: '出勤日数' },
                                    { key: '1日平均売上', label: '1日平均売上' },
                                ].map(({ key, label }) => (
                                    <th
                                        key={key}
                                        onClick={() => handleSort(key)}
                                        className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-1">
                                            {label}
                                            {sortConfig.key === key && (
                                                <span className="text-primary-500">
                                                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {sortedData.map((row, index) => (
                                <tr
                                    key={index}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-4 py-3 text-sm text-gray-500">{row['スタッフCD']}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{row['スタッフ名']}</td>
                                    <td className="px-4 py-3 text-sm text-right tabular-nums">{formatCurrency(row['総売上'])}</td>
                                    <td className="px-4 py-3 text-sm text-right tabular-nums">{formatCurrency(row['指名売上'])}</td>
                                    <td className="px-4 py-3 text-sm text-right tabular-nums">{formatCurrency(row['フリー売上'])}</td>
                                    <td className="px-4 py-3 text-sm text-right tabular-nums">{formatCurrency(row['商品売上'])}</td>
                                    <td className="px-4 py-3 text-sm text-right tabular-nums">{formatCurrency(row['客単価'])}</td>
                                    <td className="px-4 py-3 text-sm text-right tabular-nums">{formatCurrency(row['指名数'])}</td>
                                    <td className="px-4 py-3 text-sm text-right tabular-nums">{formatPercent(row['指名歩合率'])}</td>
                                    <td className="px-4 py-3 text-sm text-right tabular-nums">{formatCurrency(row['指名報酬'])}</td>
                                    <td className="px-4 py-3 text-sm text-right tabular-nums">{formatPercent(row['フリー歩合率'])}</td>
                                    <td className="px-4 py-3 text-sm text-right tabular-nums">{formatCurrency(row['フリー報酬'])}</td>
                                    <td className="px-4 py-3 text-sm text-right tabular-nums">{formatCurrency(row['商品報酬'])}</td>
                                    <td className="px-4 py-3 text-sm text-right font-semibold text-primary-600 tabular-nums">{formatCurrency(row['報酬合計'])}</td>
                                    <td className="px-4 py-3 text-sm text-right tabular-nums">{formatCurrency(row['出勤日数'])}</td>
                                    <td className="px-4 py-3 text-sm text-right tabular-nums">{formatCurrency(row['1日平均売上'])}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Tab1_IndividualMonthly;
