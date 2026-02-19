import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toNumber } from '../utils/dataProcessor';

const StoreRankingChart = ({ data }) => {
    const formatCurrency = (value) => {
        return `¥${new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 0 }).format(toNumber(value))}`;
    };

    return (
        <div className="bg-white rounded-lg p-6 shadow-card border border-gray-200 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">店舗別売上ランキング</h2>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                        type="number"
                        tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`}
                    />
                    <YAxis type="category" dataKey="店舗" width={80} />
                    <Tooltip formatter={(value) => `${formatCurrency(value)}円`} />
                    <Bar
                        dataKey="総売上"
                        fill="#3B82F6"
                        radius={[0, 4, 4, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StoreRankingChart;
