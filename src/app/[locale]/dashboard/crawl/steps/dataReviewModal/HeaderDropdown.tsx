// src/app/[locale]/dashboard/logAnalysis/modals/DataReviewModal/HeaderDropdown.tsx
import React, { useMemo } from 'react'; // Thêm useMemo
import { useTranslations } from 'next-intl';
import { REQUIRED_FIELDS } from './constants';

interface HeaderDropdownProps {
    csvHeader: string;
    options: string[];
    selected: string | undefined;
    usedOptions: string[]; // Danh sách các header đã được map bởi các cột CSV khác
    onChange: (csvHeader: string, newHeader: string | null) => void;
}

const HeaderDropdown: React.FC<HeaderDropdownProps> = ({ csvHeader, options, selected, usedOptions, onChange }) => {
    const t = useTranslations('DataReviewModal');

    // Lọc ra các tùy chọn đã được sử dụng bởi các cột khác,
    // nhưng LUÔN LUÔN bao gồm tùy chọn hiện tại (nếu có) để người dùng có thể bỏ chọn.
    const filteredOptions = useMemo(() => {
        return options.filter(opt =>
            !usedOptions.includes(opt) || // Nếu tùy chọn chưa được sử dụng
            opt === selected             // HOẶC nếu tùy chọn là cái đang được chọn cho cột này
        );
    }, [options, usedOptions, selected]);

    return (
        <div className="relative">
            <div className="h-0 overflow-hidden invisible whitespace-nowrap font-semibold min-w-[220px]">
                {selected || csvHeader}
            </div>
            <p className="text-gray-800 font-semibold mb-1">{csvHeader}</p>
            <select
                value={selected || ''}
                onChange={(e) => onChange(csvHeader, e.target.value || null)}
                className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
            >
                <option value="">{t('dropdownPlaceholder')}</option>
                {filteredOptions.map(opt => ( // Sử dụng filteredOptions
                    <option key={opt} value={opt}> {/* Không cần disabled nữa vì đã lọc */}
                        {opt} {REQUIRED_FIELDS.includes(opt) ? '*' : ''}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default HeaderDropdown;