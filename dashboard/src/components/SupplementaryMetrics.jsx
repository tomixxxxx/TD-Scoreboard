import React from 'react';
import { toNumber } from '../utils/dataProcessor';

const SupplementaryMetrics = ({ data }) => {
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 0 }).format(toNumber(value));
    };

    const metrics = [
        {
            title: '総客数',
            value: `${data.総客数}人`,
            icon: '👥',
            color: 'text-blue-600'
        },
        {
            title: '平均客単価',
            value: `¥${formatCurrency(data.平均客単価)}`,
            icon: '💰',
            color: 'text-green-600'
        },
        {
            title: '平均指名率',
            value: `${data.平均指名率.toFixed(1)}%`,
            icon: '⭐',
            color: 'text-yellow-600'
        }
    ];

    return (
        <div className="bg-white rounded-lg p-6 shadow-card border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">補助指標</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {metrics.map((metric, index) => (
                    <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-4 text-center"
                    >
                        <div className="text-3xl mb-2">{metric.icon}</div>
                        <div className="text-sm font-medium text-gray-500 mb-1">
                            {metric.title}
                        </div>
                        <div className={`text-2xl font-bold tabular-nums ${metric.color}`}>
                            {metric.value}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SupplementaryMetrics;
