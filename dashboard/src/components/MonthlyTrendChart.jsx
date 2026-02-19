import React from 'react';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// 店舗ごとの色パレット
const STORE_COLORS = [
    '#6366F1', '#EC4899', '#F59E0B', '#10B981',
    '#3B82F6', '#EF4444', '#8B5CF6', '#14B8A6',
    '#F97316', '#84CC16', '#06B6D4', '#A855F7',
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-3 border border-gray-200 shadow-lg rounded opacity-95">
                <p className="font-bold mb-2 text-gray-700">{`${label}月`}</p>
                <div className="text-sm">
                    <div className="mb-2 font-bold text-gray-900 border-b border-gray-200 pb-1">
                        合計売上: {new Intl.NumberFormat('ja-JP').format(data.合計売上)}円
                    </div>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                            <span className="text-gray-600">{entry.name}:</span>
                            <span className="font-medium ml-auto">
                                {new Intl.NumberFormat('ja-JP').format(entry.value)}円
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

const MonthlyTrendChart = ({ chartData, stores }) => {
    if (!chartData || chartData.length === 0) {
        return (
            <div className="bg-white rounded-lg p-6 shadow-card border border-gray-200 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">月別売上推移（店舗別）</h2>
                <div className="text-center text-gray-400 py-12">データがありません</div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-6 shadow-card border border-gray-200 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">月別売上推移（店舗別）</h2>

            <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                        dataKey="month"
                        tickFormatter={(v) => `${v}月`}
                    />
                    <YAxis
                        yAxisId="left"
                        tickFormatter={(value) => `${(value / 10000).toFixed(0)}万`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {/* 店舗別積み上げ棒グラフ（固定順序） */}
                    {stores.map((store, i) => (
                        <Bar
                            key={store}
                            yAxisId="left"
                            dataKey={store}
                            stackId="sales"
                            fill={STORE_COLORS[i % STORE_COLORS.length]}
                            name={store}
                        />
                    ))}
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MonthlyTrendChart;
