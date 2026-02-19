import React from 'react';

const Header = ({ totals, onReset }) => {
    const formatCurrency = (value) => {
        if (!value && value !== 0) return '¥0';
        return `¥${new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 0 }).format(Math.round(value))}`;
    };

    const formatNumber = (value) => {
        if (!value && value !== 0) return '0';
        return new Intl.NumberFormat('ja-JP').format(Math.round(value));
    };

    return (
        <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* ヘッダータイトル */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">
                            売上管理ダッシュボード
                        </h1>
                    </div>

                    {onReset && (
                        <button
                            onClick={onReset}
                            className="text-sm bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-medium px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            データをリセット
                        </button>
                    )}
                </div>

                {/* KPIカード */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 総売上 */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-card hover:shadow-md transition-shadow">
                        <div className="text-sm font-medium text-gray-500 mb-1">
                            総売上
                        </div>
                        <div className="text-3xl font-bold text-gray-900 tabular-nums">
                            {formatCurrency(totals?.総売上)}
                        </div>
                    </div>

                    {/* 総客数 */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-card hover:shadow-md transition-shadow">
                        <div className="text-sm font-medium text-gray-500 mb-1">
                            総客数
                        </div>
                        <div className="text-3xl font-bold text-gray-900 tabular-nums">
                            {formatNumber(totals?.総客数)}
                            <span className="text-lg text-gray-500 ml-1">人</span>
                        </div>
                    </div>

                    {/* 平均客単価 */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-card hover:shadow-md transition-shadow">
                        <div className="text-sm font-medium text-gray-500 mb-1">
                            平均客単価
                        </div>
                        <div className="text-3xl font-bold text-gray-900 tabular-nums">
                            {formatCurrency(totals?.平均客単価)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
