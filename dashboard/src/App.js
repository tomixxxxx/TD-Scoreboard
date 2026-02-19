import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Filters from './components/Filters';
import ExecutiveSummary from './components/ExecutiveSummary';
import MonthlyTrendChart from './components/MonthlyTrendChart';
import CustomerCountChart from './components/CustomerCountChart';
import StoreRankingChart from './components/StoreRankingChart';
import Tab2_StoreMonthly from './components/Tab2_StoreMonthly';
import RankingCard from './components/RankingCard';
import DataWarning from './components/DataWarning';
import PersonalTab from './components/PersonalTab';
import Login from './components/Login';
import { readMultipleExcelFiles } from './utils/excelReader';
import {
  getAvailableYears,
  getAvailableMonths,
  filterByPeriod,
  calculateTotals,
  calculateAnnualTotal,
  calculateMonthlyTotal,
  calculateYoYComparison,
  calculateTargetAchievement,
  getMonthlyTotalsByStore,
  getStoreRankings,
  getTop3,
  checkDataQuality,
  getInvalidRawData,
  calculateMoMComparison
} from './utils/dataProcessor';

import FileUpload from './components/FileUpload';
import FileOrderConfirmDialog from './components/FileOrderConfirmDialog';

// localStorageのキー
const LS_TARGET_ANNUAL = 'td_target_annual';
const LS_TARGET_MONTHLY = 'td_target_monthly';

const loadFromLS = (key, defaultVal) => {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? Number(v) : defaultVal;
  } catch { return defaultVal; }
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('td_auth') === 'true';
  });

  const handleLogin = () => {
    sessionStorage.setItem('td_auth', 'true');
    setIsAuthenticated(true);
  };
  const [rawData, setRawData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [loadedFileYears, setLoadedFileYears] = useState([]); // [{name, year}]
  const [showYearEdit, setShowYearEdit] = useState(false); // 年度編集ダイアログ
  // 確認ダイアログ用：ファイル選択待機中のファイル配列
  const [pendingFiles, setPendingFiles] = useState(null);

  // 目標金額（localStorageで永続化）
  const [targetAnnual, setTargetAnnualState] = useState(() => loadFromLS(LS_TARGET_ANNUAL, 60000000));
  const [targetMonthly, setTargetMonthlyState] = useState(() => loadFromLS(LS_TARGET_MONTHLY, 6000000));

  const setTargetAnnual = (v) => { setTargetAnnualState(v); try { localStorage.setItem(LS_TARGET_ANNUAL, v); } catch { } };
  const setTargetMonthly = (v) => { setTargetMonthlyState(v); try { localStorage.setItem(LS_TARGET_MONTHLY, v); } catch { } };

  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  // Tab State: 'main', 'personal', 'store'
  const [activeTab, setActiveTab] = useState('main');
  const [personalInitialMetric, setPersonalInitialMetric] = useState('総売上');

  // カードクリック時: personalタブへ遷移し、指定メトリクスを表示
  const navigateToPersonalWithMetric = (metric) => {
    setPersonalInitialMetric(metric);
    setActiveTab('personal');
  };

  // Sub-view States
  const [personalViewMode, setPersonalViewMode] = useState('monthly'); // 'monthly' or 'annual'

  // ファイル選択後：確認ダイアログを表示
  const handleFileUpload = (files) => {
    setPendingFiles(files);
  };

  // 確認ダイアログで「OK」を押した時：確定した順序でデータを読み込む
  const handleConfirmFileOrder = async (orderedFiles, years) => {
    setPendingFiles(null);
    try {
      setLoading(true);
      setError(null);
      const result = await readMultipleExcelFiles(orderedFiles, years);

      if (result && result.data) {
        setRawData(result.data);
        setLoadedFileYears(
          orderedFiles.map((f, i) => ({ name: f.name, year: years[i] }))
        );
        const availYears = getAvailableYears(result.data);
        if (availYears.length > 0) {
          setSelectedYear(availYears[0]);
        }
        setIsDataLoaded(true);
      } else {
        setError('データの読み込みに失敗しました。ファイル形式を確認してください。');
      }
    } catch (err) {
      console.error('データ読み込みエラー:', err);
      setError(`エラー: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 確認ダイアログで「キャンセル」を押した時
  const handleCancelFileOrder = () => {
    setPendingFiles(null);
  };

  // リセット処理
  const handleReset = () => {
    setRawData(null);
    setIsDataLoaded(false);
    setError(null);
    setLoadedFileYears([]);
    setActiveTab('main');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary-500 mb-4"></div>
          <div className="text-lg font-medium text-gray-700">ファイルを処理中...</div>
        </div>
      </div>
    );
  }

  // データ未ロード時はアップロード画面を表示
  if (!isDataLoaded) {
    return (
      <>
        {error && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg flex items-center gap-2">
              <span>⚠️ {error}</span>
              <button onClick={() => setError(null)} className="font-bold">×</button>
            </div>
          </div>
        )}
        <FileUpload onFileUpload={handleFileUpload} />
        {/* ファイル順序確認ダイアログ */}
        {pendingFiles && (
          <FileOrderConfirmDialog
            files={pendingFiles}
            onConfirm={handleConfirmFileOrder}
            onCancel={handleCancelFileOrder}
          />
        )}
      </>
    );
  }

  // データ処理
  const years = getAvailableYears(rawData);
  const months = getAvailableMonths(rawData, selectedYear);
  const filteredData = filterByPeriod(rawData, selectedYear, selectedMonth);
  const totals = calculateTotals(filteredData);
  const warnings = checkDataQuality(filteredData); // 表示中のデータに対する警告
  const invalidData = getInvalidRawData(filteredData); // 無効データそのもの

  // Executive KPI
  const annualTotal = calculateAnnualTotal(rawData, selectedYear);
  const monthlyTotal = selectedMonth ? calculateMonthlyTotal(rawData, selectedYear, selectedMonth) : 0;
  // 前年比: 月選択時は月次前年比、すべての月の場合は年間前年比
  const yoyComparison = selectedYear
    ? calculateYoYComparison(rawData, selectedYear, selectedMonth || null)
    : null;
  const momComparison = selectedMonth ? calculateMoMComparison(rawData, selectedYear, selectedMonth) : null;

  const targetAchievement = selectedMonth
    ? calculateTargetAchievement(monthlyTotal, targetMonthly)
    : calculateTargetAchievement(annualTotal, targetAnnual);

  const executiveSummaryData = {
    annualTotal,
    monthlyTotal,
    yoyComparison,
    momComparison,
    targetAchievement,
    target: selectedMonth ? targetMonthly : targetAnnual,
    targetAnnual,
    targetMonthly,
    setTargetAnnual,
    setTargetMonthly,
    selectedMonth
  };

  // Charts & Rankings
  const { chartData: monthlyChartData, stores: monthlyStores } = getMonthlyTotalsByStore(rawData, selectedYear);
  const storeRankings = getStoreRankings(rawData, selectedYear, selectedMonth); // 年月フィルター適用

  // Dynamic TOP3 (Annual vs Monthly based on selection)
  // filteredData is already filtered by month if selectedMonth is set.
  const top3Nominated = getTop3(filteredData, '指名売上');
  const top3Product = getTop3(filteredData, '商品売上');
  const top3AvgPrice = getTop3(filteredData, '客単価');
  const top3Total = getTop3(filteredData, '総売上');

  // Main Tabs
  const tabs = [
    { id: 'main', label: 'Main' },
    { id: 'personal', label: 'Personal' },
    { id: 'store', label: 'Store' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header totals={totals} onReset={handleReset} />

      {/* 読み込みファイル表示（年度付き・変更可能） */}
      {loadedFileYears.length > 0 && (
        <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-1.5">
          <div className="max-w-7xl mx-auto flex items-center gap-3 text-xs text-indigo-600 flex-wrap">
            <span className="font-semibold">📂 読み込み済み:</span>
            {loadedFileYears.map((f, i) => (
              <span key={i} className="bg-indigo-100 px-2 py-0.5 rounded-full">
                {f.name} <span className="font-bold">({f.year}年)</span>
              </span>
            ))}
            <button
              onClick={() => setShowYearEdit(true)}
              className="ml-1 text-indigo-500 hover:text-indigo-700 underline transition-colors"
            >
              ✏️ 年度を変更
            </button>
          </div>
        </div>
      )}

      {/* 年度再割り当てダイアログ */}
      {showYearEdit && (
        <FileOrderConfirmDialog
          files={loadedFileYears.map(f => ({ name: f.name }))}
          initialYears={loadedFileYears.map(f => f.year)}
          onConfirm={async (_, years) => {
            setShowYearEdit(false);
            try {
              setLoading(true);
              // ファイルオブジェクトは再利用できないため、rawDataを年だけ更新する
              const updatedData = rawData.map(row => {
                const fileEntry = loadedFileYears.find(f => f.year === row['年']);
                if (!fileEntry) return row;
                const idx = loadedFileYears.indexOf(fileEntry);
                return { ...row, '年': years[idx] };
              });
              setRawData(updatedData);
              setLoadedFileYears(loadedFileYears.map((f, i) => ({ ...f, year: years[i] })));
              const availYears = getAvailableYears(updatedData);
              if (availYears.length > 0) setSelectedYear(availYears[0]);
            } finally {
              setLoading(false);
            }
          }}
          onCancel={() => setShowYearEdit(false)}
        />
      )}

      {/* Sticky Navigation Area */}
      <div className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60 transition-all border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            {/* 左側: フィルター */}
            <Filters
              years={years}
              months={months}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onYearChange={setSelectedYear}
              onMonthChange={setSelectedMonth}
            />

            {/* 右側: メインタブ */}
            <div className="px-6 pb-2 md:pb-0 md:py-3">
              <div className="flex gap-1 bg-gray-100/50 p-1 rounded-lg">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab.id
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 pb-20">

        {/* データ警告 */}
        <DataWarning warnings={warnings} invalidData={invalidData} />

        {/* --- Main Tab: Executive Dashboard --- */}
        {activeTab === 'main' && (
          <div className="animate-fade-in space-y-8">
            <ExecutiveSummary data={executiveSummaryData} />
            <MonthlyTrendChart chartData={monthlyChartData} stores={monthlyStores} />

            {/* 客数グラフ（総客数） */}
            <CustomerCountChart
              chartData={monthlyChartData}
              stores={monthlyStores}
              title="月別客数推移（総客数）"
              showPerStore={true}
            />

            {/* 部門別ランキング (期間連動) - クリックでPersonalタブへ */}
            <div className="cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  部門別ランキング ({selectedMonth ? `${selectedMonth}月` : '年間'})
                </h2>
                <div className="text-sm text-primary-400 flex items-center gap-1">
                  <span>クリックで詳細へ</span>
                  <span>→</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 左上: 総売上 */}
                <div onClick={() => navigateToPersonalWithMetric('総売上')} className="cursor-pointer hover:opacity-80 transition-opacity">
                  <RankingCard title={`総売上 (${selectedMonth ? `${selectedMonth}月` : '年間'})`} data={top3Total} valueKey="総売上" />
                </div>
                {/* 右上: 客単価 */}
                <div onClick={() => navigateToPersonalWithMetric('客単価')} className="cursor-pointer hover:opacity-80 transition-opacity">
                  <RankingCard title={`客単価 (${selectedMonth ? `${selectedMonth}月` : '年間'})`} data={top3AvgPrice} valueKey="客単価" />
                </div>
                {/* 左下: 指名売上 */}
                <div onClick={() => navigateToPersonalWithMetric('指名売上')} className="cursor-pointer hover:opacity-80 transition-opacity">
                  <RankingCard title={`指名売上 (${selectedMonth ? `${selectedMonth}月` : '年間'})`} data={top3Nominated} valueKey="指名売上" />
                </div>
                {/* 右下: 商品売上 */}
                <div onClick={() => navigateToPersonalWithMetric('商品売上')} className="cursor-pointer hover:opacity-80 transition-opacity">
                  <RankingCard title={`商品売上 (${selectedMonth ? `${selectedMonth}月` : '年間'})`} data={top3Product} valueKey="商品売上" />
                </div>
              </div>
            </div>

            <StoreRankingChart data={storeRankings} />
            {/* IndividualRankingList is moved to PersonalTab */}
            {/* SupplementaryMetrics is removed */}
          </div>
        )}

        {/* --- Personal Tab --- */}
        {activeTab === 'personal' && (
          <PersonalTab
            data={rawData}
            year={selectedYear}
            month={selectedMonth}
            initialMetric={personalInitialMetric}
          />
        )}

        {/* --- Store Tab --- */}
        {activeTab === 'store' && (
          <Tab2_StoreMonthly
            data={filteredData}
            rawData={rawData}
            year={selectedYear}
            selectedMonth={selectedMonth}
          />
        )}

      </div>
    </div>
  );
}

export default App;
