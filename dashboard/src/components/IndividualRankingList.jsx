import { toNumber, getPersonImageIndex } from '../utils/dataProcessor';

const IndividualRankingList = ({
    data,
    title = 'ランキング',
    valueKey = 'value',
    formatFn,
    onStaffSelect
}) => {
    const defaultFormatFn = (value) => {
        return new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 0 }).format(toNumber(value));
    };

    const formatter = formatFn || defaultFormatFn;

    const getRankBadgeColor = (rank) => {
        if (rank === 1) return 'bg-primary-500 text-white';
        if (rank === 2) return 'bg-gray-400 text-white';
        if (rank === 3) return 'bg-gray-300 text-gray-700';
        return 'bg-gray-100 text-gray-600';
    };

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-lg p-6 shadow-card border border-gray-200 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
                <div className="text-gray-500 text-center py-8">データがありません</div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-6 shadow-card border border-gray-200 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>

            <div className="space-y-3">
                {data.map((staff, index) => (
                    <div
                        key={index}
                        onClick={() => onStaffSelect && onStaffSelect(staff.スタッフ名 || staff.staffName)}
                        className={`flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all ${onStaffSelect ? 'cursor-pointer hover:shadow-md transform hover:-translate-y-0.5' : ''}`}
                    >
                        {/* ランク番号 */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getRankBadgeColor(staff.rank)}`}>
                            {staff.rank}
                        </div>

                        {/* 人物イラスト */}
                        <img
                            src={`/image_person/Humation Illustration-${getPersonImageIndex(staff.スタッフ名)}.png`}
                            alt={staff.スタッフ名}
                            className="w-12 h-12 rounded-full object-cover object-top border border-gray-200"
                        />

                        {/* スタッフ情報 */}
                        <div className="flex-1">
                            <div className="font-semibold text-gray-900">{staff.スタッフ名}</div>
                            <div className="text-sm text-gray-500">{staff.スタッフCD}</div>
                        </div>

                        {/* 売上情報 */}
                        <div className="text-right">
                            <div className="text-2xl font-bold text-primary-600 tabular-nums">
                                {formatter(staff[valueKey])}
                            </div>
                            <div className="text-sm text-gray-500">
                                {valueKey === '客単価' ? '円' : '円'}
                                {/* 簡易的。必要ならunit propsを追加 */}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default IndividualRankingList;
