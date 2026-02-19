import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { aggregateAnnual, toNumber } from '../utils/dataProcessor';

const Tab3_IndividualAnnual = ({ data, year, onTabChange }) => {
    if (!data || data.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                データがありません
            </div>
        );
    }

    const annualData = aggregateAnnual(data, year);

    // 報酬合計でソート（上位15名）
    const top15 = annualData
        .sort((a, b) => toNumber(b['報酬合計']) - toNumber(a['報酬合計']))
        .slice(0, 15);

    // グラフ用データ
    const chartData = top15.map(item => ({
        name: item['スタッフ名'],
        value: toNumber(item['報酬合計']),
    }));

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('ja-JP').format(toNumber(value));
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-6">
            {/* 年間ランキンググラフ */}
            <div
                onClick={() => onTabChange && onTabChange(2)}
                className="bg-white rounded-lg shadow-card border border-gray-200 p-6 mb-8 cursor-pointer group"
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">年間報酬ランキング（TOP15）</h2>
                    <div className="text-sm text-primary-500 group-hover:text-primary-600 flex items-center gap-1">
                        <span>詳細ランキングを見る</span>
                        <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={500}>
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis type="number" tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`} />
                        <YAxis type="category" dataKey="name" />
                        <Tooltip formatter={(value) => `¥${formatCurrency(value)}`} />
                        <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* 年間データテーブル */}
            <div className="bg-white rounded-lg shadow-card border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">年間集計データ</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                {[
                                    'スタッフ名',
                                    'スタッフCD',
                                    '総売上',
                                    '指名売上',
                                    'フリー売上',
                                    '商品売上',
                                    '指名報酬',
                                    'フリー報酬',
                                    '商品報酬',
                                    '報酬合計',
                                ].map(header => (
                                    <th
                                        key={header}
                                        className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {annualData.map((row, index) => (
                                <tr
                                    key={index}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{row['スタッフ名']}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{row['スタッフCD']}</td>
                                    <td className="px-4 py-3 text-sm text-right tabular-nums">{formatCurrency(row['総売上'])}</td>
                                    <td className="px-4 py-3 text-sm text-right tabular-nums">{formatCurrency(row['指名売上'])}</td>
                                    <td className="px-4 py-3 text-sm text-right tabular-nums">{formatCurrency(row['フリー売上'])}</td>
                                    <td className="px-4 py-3 text-sm text-right tabular-nums">{formatCurrency(row['商品売上'])}</td>
                                    <td className="px-4 py-3 text-sm text-right tabular-nums">{formatCurrency(row['指名報酬'])}</td>
                                    <td className="px-4 py-3 text-sm text-right tabular-nums">{formatCurrency(row['フリー報酬'])}</td>
                                    <td className="px-4 py-3 text-sm text-right tabular-nums">{formatCurrency(row['商品報酬'])}</td>
                                    <td className="px-4 py-3 text-sm text-right font-semibold text-primary-600 tabular-nums">{formatCurrency(row['報酬合計'])}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Tab3_IndividualAnnual;
