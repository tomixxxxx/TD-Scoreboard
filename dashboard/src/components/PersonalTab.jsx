import React, { useState, useEffect } from 'react';
import {
    getIndividualRankings,
    getIndividualTrend,
    aggregateAnnual,
    toNumber,
    groupByStore
} from '../utils/dataProcessor';
import IndividualRankingList from './IndividualRankingList';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Tab1_IndividualMonthly from './Tab1_IndividualMonthly';

const PersonalTab = ({ data, year, month, initialMetric }) => {
    // Ranking State
    const [rankingMetric, setRankingMetric] = useState(initialMetric || '総売上'); // '総売上', '客単価', '指名売上', '商品売上'
    const [selectedStore, setSelectedStore] = useState('all'); // '全店舗' or store code

    // initialMetric変更時にメトリクスを更新
    useEffect(() => {
        if (initialMetric) {
            setRankingMetric(initialMetric);
        }
    }, [initialMetric]);

    // Analytics State
    const [selectedStaff, setSelectedStaff] = useState('');
    const [trendData, setTrendData] = useState([]);
    const [staffList, setStaffList] = useState([]);

    // 初期化：スタッフリスト作成とデフォルト選択
    useEffect(() => {
        if (data && data.length > 0) {
            // 全スタッフのリストを作成（年間データから取得）
            const annualData = aggregateAnnual(data, year);
            const sortedStaff = annualData.sort((a, b) => b.総売上 - a.総売上);
            setStaffList(sortedStaff);

            // デフォルトでTOP1を選択
            if (sortedStaff.length > 0 && !selectedStaff) {
                setSelectedStaff(sortedStaff[0]['スタッフ名']);
            }
        }
    }, [data, year]);

    // スタッフ選択変更時のトレンドデータ更新
    useEffect(() => {
        if (selectedStaff && data) {
            const trends = getIndividualTrend(data, selectedStaff, year);
            setTrendData(trends);
        }
    }, [selectedStaff, data, year]);

    // 店舗リスト取得
    const storeGroups = groupByStore(data || []);
    const storeList = ['all', ...Object.keys(storeGroups)];

    // ランキングデータ取得（店舗フィルタ適用）
    const filteredDataForRanking = selectedStore === 'all'
        ? data
        : (storeGroups[selectedStore] || []);
    const rankings = getIndividualRankings(filteredDataForRanking, rankingMetric, year, month);

    const formatCurrency = (value) => new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 0 }).format(toNumber(value));

    const metrics = [
        { key: '総売上', label: '総売上TOP10' },
        { key: '客単価', label: '客単価TOP10' },
        { key: '指名売上', label: '指名売上TOP10' },
        { key: '商品売上', label: '商品売上TOP10' }
    ];

    // 選択中スタッフの基本情報（年間）
    const selectedStaffInfo = staffList.find(s => s['スタッフ名'] === selectedStaff);

    // Scroll Ref
    const analyticsRef = React.useRef(null);

    // スタッフ選択ハンドラ（ランキングクリック時など）
    const handleStaffSelect = (staffName) => {
        setSelectedStaff(staffName);
        // 少し遅延させてスクロール（状態更新とレンダリングを待つ）
        setTimeout(() => {
            if (analyticsRef.current) {
                analyticsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* 1. ランキングセクション */}
            <section>
                {/* 店舗フィルタ */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">店舗で絞り込み</label>
                    <select
                        value={selectedStore}
                        onChange={(e) => setSelectedStore(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                        <option value="all">全店舗</option>
                        {storeList.filter(s => s !== 'all').map(store => (
                            <option key={store} value={store}>{store}</option>
                        ))}
                    </select>
                </div>

                {/* 指標選択 */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {metrics.map(m => (
                        <button
                            key={m.key}
                            onClick={() => setRankingMetric(m.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${rankingMetric === m.key
                                ? 'bg-primary-500 text-white shadow-sm'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
                <IndividualRankingList
                    data={rankings}
                    title={`${metrics.find(m => m.key === rankingMetric).label} (${month ? `${month}月` : '年間'})`}
                    valueKey="value"
                    formatFn={formatCurrency}
                    onStaffSelect={handleStaffSelect}
                />
            </section>

            {/* 2. 個人分析セクション */}
            <section ref={analyticsRef} className="bg-white rounded-lg p-6 shadow-card border border-gray-200 scroll-mt-24">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">個人分析</h2>
                    <select
                        value={selectedStaff}
                        onChange={(e) => setSelectedStaff(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    >
                        {staffList.map(staff => (
                            <option key={staff['スタッフ名']} value={staff['スタッフ名']}>
                                {staff['スタッフ名']}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedStaffInfo && (
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">年間総売上</div>
                            <div className="text-lg font-bold text-gray-900 border-l-4 border-primary-500 pl-3">
                                ¥{formatCurrency(selectedStaffInfo.総売上)}
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">指名売上</div>
                            <div className="text-lg font-bold text-gray-900 border-l-4 border-blue-400 pl-3">
                                ¥{formatCurrency(selectedStaffInfo.指名売上)}
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">商品売上</div>
                            <div className="text-lg font-bold text-gray-900 border-l-4 border-teal-400 pl-3">
                                ¥{formatCurrency(selectedStaffInfo.商品売上)}
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">指名率</div>
                            <div className="text-lg font-bold text-gray-900 border-l-4 border-purple-400 pl-3">
                                {selectedStaffInfo.指名率 ? selectedStaffInfo.指名率.toFixed(1) : 0}%
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">客単価</div>
                            <div className="text-lg font-bold text-gray-900 border-l-4 border-pink-400 pl-3">
                                ¥{formatCurrency(selectedStaffInfo.客単価)}
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-500 mb-1">報酬合計</div>
                            <div className="text-lg font-bold text-gray-900 border-l-4 border-yellow-400 pl-3">
                                ¥{formatCurrency(selectedStaffInfo.報酬合計)}
                            </div>
                        </div>
                    </div>
                )}

                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="month" label={{ value: '月', position: 'insideBottomRight', offset: -5 }} />
                            <YAxis yAxisId="left" tickFormatter={(v) => `¥${v / 10000}万`} />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip
                                labelFormatter={(label) => `${label}月`}
                                formatter={(value, name) => {
                                    const numValue = toNumber(value);
                                    const formatted = new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 0 }).format(numValue);
                                    if (name.includes('売上') || name.includes('単価') || name.includes('報酬')) return [`${formatted}円`, name];
                                    if (name.includes('率')) return [`${value.toFixed(1)}%`, name];
                                    if (name.includes('数')) return [`${formatted}人`, name];
                                    return [formatted, name];
                                }}
                            />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="総売上" name="総売上" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} />
                            <Line yAxisId="left" type="monotone" dataKey="指名売上" name="指名売上" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
                            <Line yAxisId="right" type="monotone" dataKey="指名数" name="指名数" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
                            <Line yAxisId="right" type="monotone" dataKey="指名率" name="指名率 (%)" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* 3. 詳細リスト（既存コンポーネント再利用） */}
            <section>
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">詳細データリスト</h2>
                </div>
                <Tab1_IndividualMonthly data={data} filteredByPeriod={true} />
                {/* Note: Tab1は内部でgetTop3などを使っているが、リスト表示用としてそのまま使えるか確認が必要。
                    ここではとりあえずリストとして配置。Tab1の実装によってはPropsの渡し方に工夫が必要。
                */}
            </section>
        </div>
    );
};

export default PersonalTab;
