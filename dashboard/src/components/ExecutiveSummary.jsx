import React, { useState } from 'react';

const ExecutiveSummary = ({ data, year, month }) => {
    const [editingTarget, setEditingTarget] = useState(false);
    const [annualInput, setAnnualInput] = useState('');
    const [monthlyInput, setMonthlyInput] = useState('');

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 0 }).format(Math.round(value));
    };

    const formatPercent = (value) => {
        return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
    };

    const handleOpenEdit = () => {
        setAnnualInput(String(data.targetAnnual));
        setMonthlyInput(String(data.targetMonthly));
        setEditingTarget(true);
    };

    const handleSave = () => {
        const annual = parseInt(annualInput.replace(/,/g, ''), 10);
        const monthly = parseInt(monthlyInput.replace(/,/g, ''), 10);
        if (!isNaN(annual) && annual > 0) data.setTargetAnnual(annual);
        if (!isNaN(monthly) && monthly > 0) data.setTargetMonthly(monthly);
        setEditingTarget(false);
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {/* 年間総売上 */}
                <div className="bg-white rounded-lg p-6 shadow-card border border-gray-200">
                    <div className="text-sm font-medium text-gray-500 mb-2">
                        年間総売上
                    </div>
                    <div className="text-4xl font-bold text-gray-900 tabular-nums">
                        ¥{formatCurrency(data.annualTotal)}
                    </div>
                </div>

                {/* 今月売上 */}
                <div className="bg-white rounded-lg p-6 shadow-card border border-gray-200">
                    <div className="text-sm font-medium text-gray-500 mb-2">
                        今月売上
                    </div>
                    {data.selectedMonth ? (
                        <>
                            <div className="text-4xl font-bold text-gray-900 tabular-nums">
                                ¥{formatCurrency(data.monthlyTotal)}
                            </div>
                            {data.momComparison && (
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-gray-400">前月比</span>
                                    <span className={`text-sm font-medium ${data.momComparison.isPositive ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {formatPercent(data.momComparison.momRate)}
                                    </span>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-2">
                            <div className="text-4xl font-bold text-gray-900">-</div>
                            <div className="text-sm text-gray-400">前月比 -</div>
                        </div>
                    )}
                </div>

                {/* 前年比 */}
                <div className="bg-white rounded-lg p-6 shadow-card border border-gray-200">
                    <div className="text-sm font-medium text-gray-500 mb-2">
                        前年比{data.selectedMonth ? '' : '（年間）'}
                    </div>
                    {data.yoyComparison && data.yoyComparison.previousTotal > 0 ? (
                        <>
                            <div className={`text-4xl font-bold tabular-nums ${data.yoyComparison.isPositive ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {formatPercent(data.yoyComparison.yoyRate)}
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                                前年: ¥{formatCurrency(data.yoyComparison.previousTotal)}
                            </div>
                        </>
                    ) : (
                        <div className="text-2xl text-gray-400">
                            データなし
                        </div>
                    )}
                </div>

                {/* 目標達成率 */}
                <div className="bg-white rounded-lg p-6 shadow-card border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-gray-500">目標達成率</div>
                        <button
                            onClick={handleOpenEdit}
                            className="text-xs text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 px-2 py-0.5 rounded-md transition-colors font-medium"
                            title="目標金額を設定"
                        >
                            ⚙️ 設定
                        </button>
                    </div>
                    <div className="text-4xl font-bold text-primary-600 tabular-nums">
                        {data.targetAchievement.toFixed(1)}%
                    </div>
                    <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-primary-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(data.targetAchievement, 100)}%` }}
                            />
                        </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                        目標: ¥{formatCurrency(data.target)}
                    </div>
                </div>
            </div>

            {/* 目標金額設定モーダル */}
            {editingTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-4 text-white">
                            <h2 className="text-base font-bold">目標金額の設定</h2>
                            <p className="text-indigo-100 text-xs mt-1">設定はブラウザに保存されます</p>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">年間目標売上（円）</label>
                                <input
                                    type="number"
                                    value={annualInput}
                                    onChange={e => setAnnualInput(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    placeholder="例: 60000000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">月次目標売上（円）</label>
                                <input
                                    type="number"
                                    value={monthlyInput}
                                    onChange={e => setMonthlyInput(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    placeholder="例: 6000000"
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
                            <button
                                onClick={() => setEditingTarget(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                保存
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ExecutiveSummary;
