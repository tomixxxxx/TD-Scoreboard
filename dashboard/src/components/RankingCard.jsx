import React from 'react';
import { toNumber, getPersonImageIndex } from '../utils/dataProcessor';

const RankingCard = ({ title, data, valueKey, icon }) => {
    const formatValue = (value) => {
        const num = toNumber(value);
        return new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 0 }).format(num);
    };

    if (!data || data.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-card">
                <h3 className="text-sm font-medium text-gray-700 mb-4">{title}</h3>
                <div className="text-center text-gray-400 py-8">
                    データなし
                </div>
            </div>
        );
    }

    // 人物イラストのパス（名前ハッシュベース）
    const getPersonImage = (name) => {
        const imageNum = getPersonImageIndex(name);
        return `/image_person/Humation Illustration-${imageNum}.png`;
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-card">
            <h3 className="text-sm font-medium text-gray-700 mb-4">{title}</h3>
            <div className="space-y-3">
                {data.slice(0, 3).map((item, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        {/* 人物イラスト */}
                        <img
                            src={getPersonImage(item['スタッフ名'] || item['staffName'] || 'unknown')}
                            alt={item['スタッフ名'] || 'スタッフ'}
                            className="w-12 h-12 rounded-full object-cover object-top border border-gray-200 flex-shrink-0"
                        />

                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`
                                    inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0
                                    ${index === 0 ? 'bg-primary-500 text-white' : ''}
                                    ${index === 1 ? 'bg-gray-400 text-white' : ''}
                                    ${index === 2 ? 'bg-gray-300 text-white' : ''}
                                `}>
                                    {index + 1}
                                </span>
                                <div className="font-semibold text-gray-900 text-sm break-words line-clamp-2">
                                    {item['スタッフ名'] || item['staffName'] || '不明'}
                                </div>
                            </div>
                            <div className="text-xs text-gray-500">
                                {item['スタッフCD'] || item['staffCode'] || ''}
                            </div>
                        </div>

                        {/* 値 */}
                        <div className="text-right flex-shrink-0">
                            <div className="text-lg font-bold text-gray-900 tabular-nums">
                                {formatValue(item[valueKey])}
                            </div>
                            <div className="text-xs text-gray-500">円</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RankingCard;
