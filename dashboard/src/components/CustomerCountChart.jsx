import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
                        総客数: {new Intl.NumberFormat('ja-JP').format(data.総客数)}人
                    </div>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                            <span className="text-gray-600">{entry.name}:</span>
                            <span className="font-medium ml-auto">
                                {new Intl.NumberFormat('ja-JP').format(entry.value)}人
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

/**
 * 客数グラフ（総客数・店舗別積み上げ）
 * Props:
 *   chartData: [{ month, 総客数, [store]_客数, ... }]
 *   stores: string[]
 *   showPerStore: bool - 店舗別に分けるか
 *   extraKeys: [{ key, label, color }] - 追加系列（指名数、新規客数など）
 */
const CustomerCountChart = ({ chartData, stores, title = '月別客数推移', showPerStore = false, extraKeys = [] }) => {
    if (!chartData || chartData.length === 0) {
        return (
            <div className="bg-white rounded-lg p-6 shadow-card border border-gray-200 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
                <div className="text-center text-gray-400 py-12">データがありません</div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-6 shadow-card border border-gray-200 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tickFormatter={(v) => `${v}月`} />
                    <YAxis tickFormatter={(v) => `${v}人`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {showPerStore ? (
                        stores.map((store, i) => (
                            <Bar
                                key={store}
                                dataKey={`${store}_客数`}
                                stackId="customers"
                                fill={STORE_COLORS[i % STORE_COLORS.length]}
                                name={store}
                            />
                        ))
                    ) : (
                        <Bar dataKey="総客数" fill="#6366F1" name="総客数" radius={[4, 4, 0, 0]} />
                    )}
                    {extraKeys.map(({ key, label, color }) => (
                        <Bar key={key} dataKey={key} fill={color} name={label} radius={[4, 4, 0, 0]} />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CustomerCountChart;
