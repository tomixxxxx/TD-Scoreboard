import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getMonthlyTrends, groupByStore, toNumber } from '../utils/dataProcessor';

const Tab4_StoreAnnual = ({ data, year }) => {
    const [selectedMetric, setSelectedMetric] = useState('総売上');

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                データがありません
            </div>
        );
    }

    const monthlyTrendsObj = getMonthlyTrends(data, year);
    const storeGroups = groupByStore(data.filter(row => !year || toNumber(row['年']) === year));

    // 月次推移データを配列形式に変換
    const chartData = [];
    const allMonths = new Set();

    // すべての月を収集
    Object.keys(monthlyTrendsObj).forEach(storeCode => {
        monthlyTrendsObj[storeCode].forEach(item => {
            allMonths.add(item.month);
        });
    });

    // 月ごとにデータを整形
    Array.from(allMonths).sort((a, b) => a - b).forEach(month => {
        const monthData = { month };
        Object.keys(monthlyTrendsObj).forEach(storeCode => {
            const storeMonthData = monthlyTrendsObj[storeCode].find(item => item.month === month);
            if (storeMonthData) {
                monthData[`${storeCode}_総売上`] = storeMonthData.総売上;
                monthData[`${storeCode}_指名売上`] = storeMonthData.指名売上;
                monthData[`${storeCode}_フリー売上`] = storeMonthData.フリー売上;
                monthData[`${storeCode}_商品売上`] = storeMonthData.商品売上;
            }
        });
        chartData.push(monthData);
    });

    // 店舗別年間合計
    const storeTotals = Object.keys(storeGroups).map(storeCode => {
        const storeData = storeGroups[storeCode];
        return {
            店舗: storeCode,
            総売上: storeData.reduce((sum, row) => sum + toNumber(row['総売上']), 0),
            指名売上: storeData.reduce((sum, row) => sum + toNumber(row['指名売上']), 0),
            フリー売上: storeData.reduce((sum, row) => sum + toNumber(row['フリー売上']), 0),
            商品売上: storeData.reduce((sum, row) => sum + toNumber(row['商品売上']), 0),
        };
    });

    // 店舗ごとの色（ブルー系グラデーション）
    const STORE_COLORS = ['#3B82F6', '#60A5FA', '#93C5FD', '#2563EB', '#1D4ED8', '#1E40AF'];

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('ja-JP').format(toNumber(value));
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-6">
            {/* 月次推移グラフ */}
            <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">月次推移</h2>
                    <div className="flex gap-2">
                        {['総売上', '指名売上', 'フリー売上', '商品売上'].map(metric => (
                            <button
                                key={metric}
                                onClick={() => setSelectedMetric(metric)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedMetric === metric
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {metric}
                            </button>
                        ))}
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" label={{ value: '月', position: 'insideBottomRight', offset: -5 }} />
                        <YAxis tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`} />
                        <Tooltip formatter={(value) => `¥${formatCurrency(value)}`} />
                        <Legend />
                        {Object.keys(storeGroups).map((storeCode, index) => (
                            <Line
                                key={storeCode}
                                type="monotone"
                                dataKey={`${storeCode}_${selectedMetric}`}
                                name={storeCode}
                                stroke={STORE_COLORS[index % STORE_COLORS.length]}
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* 店舗別年間合計テーブル */}
            <div className="bg-white rounded-lg shadow-card border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">店舗別年間合計</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                {[
                                    '店舗',
                                    '総売上',
                                    '指名売上',
                                    'フリー売上',
                                    '商品売上',
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
                            {storeTotals.map((row, index) => (
                                <tr
                                    key={index}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{row['店舗']}</td>
                                    <td className="px-4 py-3 text-sm text-right font-semibold text-primary-600 tabular-nums">{formatCurrency(row['総売上'])}</td>
                                    <td className="px-4 py-3 text-sm text-right tabular-nums">{formatCurrency(row['指名売上'])}</td>
                                    <td className="px-4 py-3 text-sm text-right tabular-nums">{formatCurrency(row['フリー売上'])}</td>
                                    <td className="px-4 py-3 text-sm text-right tabular-nums">{formatCurrency(row['商品売上'])}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Tab4_StoreAnnual;
