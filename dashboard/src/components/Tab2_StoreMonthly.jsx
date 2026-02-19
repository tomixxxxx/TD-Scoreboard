import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ComposedChart, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { groupByStore, toNumber, getMonthlyTotalsByStore, sortStoresByOrder } from '../utils/dataProcessor';

const COLORS = ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#14B8A6'];

const formatCurrency = (value) =>
    new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 0 }).format(toNumber(value));

// ソート可能なテーブルヘッダー
const SortableHeader = ({ label, sortKey, sortConfig, onSort, align = 'left' }) => {
    const isActive = sortConfig.key === sortKey;
    const icon = isActive ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : ' ⇅';
    return (
        <th
            onClick={() => onSort(sortKey)}
            className={`px-4 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none ${align === 'right' ? 'text-right' : 'text-left'}`}
        >
            {label}<span className="text-gray-400 text-xs">{icon}</span>
        </th>
    );
};

// カスタムツールチップ
const CustomTooltip = ({ active, payload, label, type }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const total = type === 'sales' ? data.dynamicSalesTotal : data.dynamicCustomerTotal;
        const unit = type === 'sales' ? '円' : '人';
        return (
            <div className="bg-white p-3 border border-gray-200 shadow-lg rounded opacity-95">
                <p className="font-bold mb-2 text-gray-700">{`${label}月`}</p>
                <div className="text-sm">
                    <div className="mb-2 font-bold text-gray-900 border-b border-gray-200 pb-1">
                        合計: {new Intl.NumberFormat('ja-JP').format(total)}{unit}
                    </div>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                            <span className="text-gray-600">{entry.name}:</span>
                            <span className="font-medium ml-auto">
                                {new Intl.NumberFormat('ja-JP').format(entry.value)}{unit}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

const Tab2_StoreMonthly = ({ data, rawData, year, selectedMonth }) => {
    const [sortConfigs, setSortConfigs] = useState({});
    const [selectedStores, setSelectedStores] = useState([]);

    const periodLabel = selectedMonth ? `${selectedMonth}月` : '年間';

    // 月次推移データ（年間rawDataから）- 固定順序
    // データがない場合でも空配列を返してフックの順序を守る
    const { chartData: monthlyChartData, stores } = rawData
        ? getMonthlyTotalsByStore(rawData, year)
        : { chartData: [], stores: [] };

    // selectedStoresの初期化
    useEffect(() => {
        if (stores.length > 0 && selectedStores.length === 0) {
            setSelectedStores(stores);
        }
    }, [stores, selectedStores.length]);

    if (!data || data.length === 0) {
        return <div className="text-center py-12 text-gray-500">データがありません</div>;
    }

    // 店舗グループ（フィルタ済みデータ）- 固定順序でソート
    const rawStoreGroups = groupByStore(data);
    const sortedStoreCodes = sortStoresByOrder(Object.keys(rawStoreGroups));

    // 店舗別総売上（ドーナツグラフ用）- 固定順序
    const storeTotals = sortedStoreCodes.map(storeCode => {
        const storeData = rawStoreGroups[storeCode];
        const total = storeData.reduce((sum, row) => sum + toNumber(row['総売上']), 0);
        return { name: storeCode, value: total };
    });

    // 店舗フィルタリングハンドラ
    const handleStoreToggle = (store) => {
        setSelectedStores(prev => {
            const newSelection = prev.includes(store)
                ? prev.filter(s => s !== store)
                : [...prev, store];
            return sortStoresByOrder(newSelection);
        });
    };

    // 動的データ計算（選択された店舗のみの合計）
    const dynamicChartData = monthlyChartData.map(row => {
        let salesTotal = 0;
        let customerTotal = 0;
        selectedStores.forEach(store => {
            salesTotal += (row[store] || 0);
            customerTotal += (row[`${store}_客数`] || 0);
        });
        return {
            ...row,
            dynamicSalesTotal: salesTotal,
            dynamicCustomerTotal: customerTotal
        };
    });

    // ソートハンドラ
    const handleSort = (storeCode, key) => {
        setSortConfigs(prev => {
            const current = prev[storeCode] || { key: null, direction: 'desc' };
            const direction = current.key === key && current.direction === 'desc' ? 'asc' : 'desc';
            return { ...prev, [storeCode]: { key, direction } };
        });
    };

    const getSortedData = (storeCode, storeData) => {
        const config = sortConfigs[storeCode];
        if (!config || !config.key) return storeData;
        return [...storeData].sort((a, b) => {
            const aVal = toNumber(a[config.key]);
            const bVal = toNumber(b[config.key]);
            return config.direction === 'asc' ? aVal - bVal : bVal - aVal;
        });
    };

    const numericColumns = ['総売上', '指名売上', 'フリー売上', '商品売上', '客単価', '指名数', '指名報酬', 'フリー報酬', '商品報酬', '報酬合計'];

    // カスタム凡例のペイロード生成（売上）
    // 店舗のみ（選択順）
    const salesLegendPayload = [
        ...selectedStores.map((store) => {
            const i = stores.indexOf(store);
            return { value: store, type: 'rect', color: COLORS[i % COLORS.length], id: store };
        })
    ];

    // カスタム凡例のペイロード生成（客数）
    const customerLegendPayload = selectedStores.map((store) => {
        const i = stores.indexOf(store);
        return { value: store, type: 'rect', color: COLORS[i % COLORS.length], id: store };
    });


    // 店舗フィルタチェックボックス
    const StoreFilter = () => (
        <div className="flex flex-wrap gap-4 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-sm font-medium text-gray-700 py-1">表示店舗:</span>
            {stores.map((store, index) => (
                <label key={store} className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                    <input
                        type="checkbox"
                        checked={selectedStores.includes(store)}
                        onChange={() => handleStoreToggle(store)}
                        className="rounded text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-600" style={{ color: COLORS[index % COLORS.length] }}>
                        {store}
                    </span>
                </label>
            ))}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">

            {/* 1. 店舗別売上シェア（ドーナツ） */}
            <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">
                    店舗別売上シェア（{periodLabel}）
                </h2>
                <ResponsiveContainer width="100%" height={380}>
                    <PieChart>
                        <Pie
                            data={storeTotals}
                            cx="50%" cy="50%"
                            innerRadius={80} outerRadius={140}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                        >
                            {storeTotals.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${formatCurrency(value)}円`} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* 2. 月次推移（売上） */}
            <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
                <div className="flex flex-col gap-4 mb-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">月次推移（売上）</h2>
                    </div>
                    <StoreFilter />
                </div>
                {dynamicChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                        <ComposedChart data={dynamicChartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="month" tickFormatter={(v) => `${v}月`} />
                            <YAxis tickFormatter={(value) => `${(value / 10000).toFixed(0)}万`} />

                            <Tooltip content={<CustomTooltip type="sales" />} />

                            {/* payload プロパティで凡例順序を強制 */}
                            <Legend payload={salesLegendPayload} />

                            {/* 合計売上ラインは削除されました */}

                            {/* 店舗別積み上げバー */}
                            {selectedStores.map((store, i) => {
                                const originalIndex = stores.indexOf(store);
                                return (
                                    <Bar key={store} dataKey={store} stackId="sales"
                                        fill={COLORS[originalIndex % COLORS.length]} name={store} />
                                );
                            })}
                        </ComposedChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-center text-gray-400 py-8">データがありません</div>
                )}
            </div>

            {/* 3. 月次推移（客数） */}
            <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
                <div className="flex flex-col gap-4 mb-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">月次推移（客数）</h2>
                    </div>
                    <StoreFilter />
                </div>
                {dynamicChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dynamicChartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="month" tickFormatter={(v) => `${v}月`} />
                            <YAxis tickFormatter={(v) => `${v}人`} />

                            <Tooltip content={<CustomTooltip type="customers" />} />

                            {/* payload プロパティで凡例順序を強制 */}
                            <Legend payload={customerLegendPayload} />

                            {selectedStores.map((store, i) => {
                                const originalIndex = stores.indexOf(store);
                                return (
                                    <Bar key={store} dataKey={`${store}_客数`} stackId="customers"
                                        fill={COLORS[originalIndex % COLORS.length]} name={store} />
                                );
                            })}
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-center text-gray-400 py-8">データがありません</div>
                )}
            </div>

            {/* 4. 店舗別スタッフテーブル（ソート対応・固定順序） */}
            <div className="space-y-6">
                {sortedStoreCodes.map((storeCode) => {
                    const storeData = rawStoreGroups[storeCode];
                    const validStoreData = storeData.filter(row => {
                        const staffName = row['スタッフ名'] || row['staffName'];
                        return staffName && staffName !== '不明' && staffName !== '#N/A' && !staffName.toString().includes('ERROR');
                    });
                    const sortedData = getSortedData(storeCode, validStoreData);
                    const storeTotal = validStoreData.reduce((sum, row) => sum + toNumber(row['総売上']), 0);
                    const config = sortConfigs[storeCode] || { key: null, direction: 'desc' };

                    return (
                        <div key={storeCode} className="bg-white rounded-lg shadow-card border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    店舗: {storeCode}
                                    <span className="text-sm font-normal text-gray-500 ml-2">
                                        （総売上: {formatCurrency(storeTotal)}円）
                                    </span>
                                </h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">スタッフCD</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">スタッフ名</th>
                                            {numericColumns.map(col => (
                                                <SortableHeader
                                                    key={col}
                                                    label={col}
                                                    sortKey={col}
                                                    sortConfig={config}
                                                    onSort={(key) => handleSort(storeCode, key)}
                                                    align="right"
                                                />
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {sortedData.map((row, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 text-sm text-gray-500">{row['スタッフCD']}</td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{row['スタッフ名']}</td>
                                                <td className="px-4 py-3 text-sm text-right tabular-nums font-semibold text-primary-600">{formatCurrency(row['総売上'])}</td>
                                                <td className="px-4 py-3 text-sm text-right tabular-nums">{formatCurrency(row['指名売上'])}</td>
                                                <td className="px-4 py-3 text-sm text-right tabular-nums">{formatCurrency(row['フリー売上'])}</td>
                                                <td className="px-4 py-3 text-sm text-right tabular-nums">{formatCurrency(row['商品売上'])}</td>
                                                <td className="px-4 py-3 text-sm text-right tabular-nums">{formatCurrency(row['客単価'])}</td>
                                                <td className="px-4 py-3 text-sm text-right tabular-nums">{formatCurrency(row['指名数'])}</td>
                                                <td className="px-4 py-3 text-sm text-right tabular-nums">{formatCurrency(row['指名報酬'])}</td>
                                                <td className="px-4 py-3 text-sm text-right tabular-nums">{formatCurrency(row['フリー報酬'])}</td>
                                                <td className="px-4 py-3 text-sm text-right tabular-nums">{formatCurrency(row['商品報酬'])}</td>
                                                <td className="px-4 py-3 text-sm text-right tabular-nums font-semibold text-primary-600">{formatCurrency(row['報酬合計'])}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Tab2_StoreMonthly;
