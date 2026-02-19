import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Filters from './components/Filters';
import Tab1_IndividualMonthly from './components/Tab1_IndividualMonthly';
import Tab2_StoreMonthly from './components/Tab2_StoreMonthly';
import Tab3_IndividualAnnual from './components/Tab3_IndividualAnnual';
import Tab4_StoreAnnual from './components/Tab4_StoreAnnual';
import { readExcelFile } from './utils/excelReader';
import {
    getAvailableYears,
    getAvailableMonths,
    filterByPeriod,
    calculateTotals
} from './utils/dataProcessor';

function App() {
    const [rawData, setRawData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [activeTab, setActiveTab] = useState(0);

    // Excelファイル読み込み
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const result = await readExcelFile('/全店舗売上.xlsx');

                if (result && result.data) {
                    setRawData(result.data);

                    // 初期値として最新の年を設定
                    const years = getAvailableYears(result.data);
                    if (years.length > 0) {
                        setSelectedYear(years[0]);
                    }
                } else {
                    setError('データの読み込みに失敗しました');
                }
            } catch (err) {
                console.error('データ読み込みエラー:', err);
                setError(`エラー: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">⏳</div>
                    <div className="text-2xl font-bold text-gray-700">データ読み込み中...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
                    <div className="text-6xl mb-4 text-center">❌</div>
                    <div className="text-xl font-bold text-red-600 text-center mb-2">エラー</div>
                    <div className="text-gray-700 text-center">{error}</div>
                </div>
            </div>
        );
    }

    if (!rawData || rawData.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">📭</div>
                    <div className="text-2xl font-bold text-gray-700">データがありません</div>
                </div>
            </div>
        );
    }

    // データフィルタリング
    const years = getAvailableYears(rawData);
    const months = getAvailableMonths(rawData, selectedYear);
    const filteredData = filterByPeriod(rawData, selectedYear, selectedMonth);
    const totals = calculateTotals(filteredData);

    // タブ定義
    const tabs = [
        { id: 0, label: '個別売上（月間）', icon: '👤' },
        { id: 1, label: '店舗別個別売上（月間）', icon: '🏪' },
        { id: 2, label: '個別売上（年間）', icon: '📅' },
        { id: 3, label: '店舗別年間売上', icon: '📊' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
            {/* ヘッダー */}
            <Header totals={totals} />

            {/* フィルター */}
            <Filters
                years={years}
                months={months}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                onYearChange={setSelectedYear}
                onMonthChange={setSelectedMonth}
            />

            {/* タブナビゲーション */}
            <div className="max-w-7xl mx-auto px-6 mb-6">
                <div className="bg-white rounded-xl shadow-lg p-2 flex flex-wrap gap-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 min-w-[200px] px-6 py-3 rounded-lg font-medium transition-all ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md transform scale-105'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* タブコンテンツ */}
            <div className="pb-12">
                {activeTab === 0 && <Tab1_IndividualMonthly data={filteredData} />}
                {activeTab === 1 && <Tab2_StoreMonthly data={filteredData} />}
                {activeTab === 2 && <Tab3_IndividualAnnual data={rawData} year={selectedYear} onTabChange={setActiveTab} />}
                {activeTab === 3 && <Tab4_StoreAnnual data={rawData} year={selectedYear} />}
            </div>
        </div>
    );
}

export default App;
