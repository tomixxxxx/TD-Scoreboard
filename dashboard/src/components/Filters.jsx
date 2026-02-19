import React from 'react';

const Filters = ({ years, months, selectedYear, selectedMonth, onYearChange, onMonthChange }) => {
    return (
        <div className="px-6 py-3 border-b border-gray-200/50">
            <div className="max-w-7xl mx-auto flex items-center gap-4">
                <span className="text-sm font-medium text-gray-500">期間:</span>

                <select
                    value={selectedYear || ''}
                    onChange={(e) => onYearChange(e.target.value ? Number(e.target.value) : null)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/80 text-gray-900 shadow-sm transition-colors hover:bg-white"
                >
                    <option value="">すべての年</option>
                    {years.map(year => (
                        <option key={year} value={year}>{year}年</option>
                    ))}
                </select>

                <select
                    value={selectedMonth || ''}
                    onChange={(e) => onMonthChange(e.target.value ? Number(e.target.value) : null)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/80 text-gray-900 shadow-sm transition-colors hover:bg-white"
                >
                    <option value="">すべての月</option>
                    {months.map(month => (
                        <option key={month} value={month}>{month}月</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default Filters;
