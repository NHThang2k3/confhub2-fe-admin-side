// src/app/[locale]/visualization/utils/fields.ts
import { DataField } from '../../../../models/visualization/visualization';
import { ConferenceResponse } from '@/src/models/response/conference.response';
import { getNestedValue } from './helpers'; // Import helper


// --- Constants ---
// Đảm bảo hằng số này được định nghĩa và export đúng cách
export const UNKNOWN_CATEGORY = 'Unknown';
const logPrefixFields = 'FIELDS:';

// --- Định nghĩa các châu lục hợp lệ ---
// Sử dụng Set để tra cứu hiệu quả (O(1) average time complexity)
const VALID_CONTINENTS = new Set([
    'Africa',
    'Asia',
    'Europe',
    'North America',
    'South America',
    'Oceania',
    // 'Antarctica', // Thêm nếu cần thiết cho dữ liệu của bạn
]);


// --- STABLE ACCESSOR DEFINITIONS ---
const accessors = {
    continent: (item: ConferenceResponse): string => {
        const path = 'organizations[1].locations[0].continent';
        const rawValue = getNestedValue(item, path); // Lấy giá trị gốc

        // 1. Xử lý null, undefined hoặc kiểu dữ liệu không phải string
        if (rawValue === null || rawValue === undefined || typeof rawValue !== 'string') {
             // console.log(`${logPrefixFields} continent accessor: Value is null, undefined, or not a string. Mapping to UNKNOWN.`);
            return UNKNOWN_CATEGORY;
        }

        // 2. Trim khoảng trắng thừa ở đầu/cuối chuỗi
        const trimmedValue = rawValue.trim();

        // 3. Xử lý chuỗi rỗng sau khi trim
        if (trimmedValue === '') {
            // console.log(`${logPrefixFields} continent accessor: Value is empty string after trim. Mapping to UNKNOWN.`);
            return UNKNOWN_CATEGORY;
        }

        // 4. Kiểm tra xem giá trị đã trim có nằm trong danh sách châu lục hợp lệ không
        if (VALID_CONTINENTS.has(trimmedValue)) {
            // console.log(`${logPrefixFields} continent accessor: Found valid continent "${trimmedValue}".`);
            return trimmedValue; // Trả về tên châu lục hợp lệ
        } else {
            // Giá trị là chuỗi không rỗng, nhưng không phải là châu lục chuẩn trong danh sách
            // console.warn(`${logPrefixFields} continent accessor: Non-standard continent value "${trimmedValue}" encountered. Mapping to UNKNOWN.`);
            return UNKNOWN_CATEGORY;
        }
    },
    country: (item: ConferenceResponse): string => {
        const path = 'organizations[1].locations[0].country';
        const value = getNestedValue(item, path);
        // Cân nhắc áp dụng logic tương tự nếu muốn chuẩn hóa Country về Unknown
        return (value === null || value === undefined || String(value).trim() === '') ? UNKNOWN_CATEGORY : String(value).trim();
    },
    year: (item: ConferenceResponse): string => {
        const path = 'organizations[1].year';
        const value = getNestedValue(item, path);
        return (value !== null && value !== undefined && String(value).trim() !== '') ? String(value) : UNKNOWN_CATEGORY;
    },
    accessType: (item: ConferenceResponse): string => {
        const path = 'organizations[1].accessType';
        const value = getNestedValue(item, path);
         // Cân nhắc áp dụng logic tương tự nếu muốn chuẩn hóa Access Type về Unknown
        return (value === null || value === undefined || String(value).trim() === '') ? UNKNOWN_CATEGORY : String(value).trim();
    },
    // ... các accessors khác giữ nguyên ...
    followersCount: (item: ConferenceResponse): number => {
        const path = 'followBy';
        const value = getNestedValue(item, path);
        return Array.isArray(value) ? value.length : 0;
    },
    feedbacksCount: (item: ConferenceResponse): number => {
        const path = 'feedbacks';
        const value = getNestedValue(item, path);
        return Array.isArray(value) ? value.length : 0;
    },
    topicsCount: (item: ConferenceResponse): number => {
        const path = 'organizations[1].topics';
        const value = getNestedValue(item, path);
        return Array.isArray(value) ? value.length : 0;
    },
    feedbacksArray: (item: ConferenceResponse): any[] => {
        const path = 'feedbacks';
        const value = getNestedValue(item, path);
        return Array.isArray(value) ? value : [];
    },
};

// --- STABLE FIELD DEFINITIONS (Template) ---
// Định nghĩa các trường không thay đổi, chỉ tham chiếu đến accessors đã cập nhật
const AVAILABLE_FIELDS_TEMPLATE: DataField[] = [
    // Dimensions
    { id: 'organizations[1].locations[0].continent', name: 'Continent', type: 'dimension', accessor: accessors.continent },
    { id: 'organizations[1].locations[0].country', name: 'Country', type: 'dimension', accessor: accessors.country },
    { id: 'organizations[1].year', name: 'Year', type: 'dimension', accessor: accessors.year },
    { id: 'organizations[1].accessType', name: 'Access Type', type: 'dimension', accessor: accessors.accessType },

    // Measures
    { id: 'count_records', name: 'Record Count', type: 'measure', aggregation: 'count' },
    { id: 'count_followers', name: '# Followers', type: 'measure', accessor: accessors.followersCount, aggregation: 'sum' },
    { id: 'count_feedbacks', name: '# Feedbacks', type: 'measure', accessor: accessors.feedbacksCount, aggregation: 'sum' },
    { id: 'count_topics', name: '# Topics', type: 'measure', accessor: accessors.topicsCount, aggregation: 'sum' },
    {
        id: 'feedback_star_avg',
        name: 'Avg. Feedback Star',
        type: 'measure',
        accessor: accessors.feedbacksArray,
        aggregation: 'average',
        // avgTargetProperty: 'star' // Vẫn giữ nếu bạn dùng nó trong aggregateData
    },
];

/**
 * Returns the STABLE list of available fields based on a template.
 * Ensures consistency regardless of the sample item (as long as one exists).
 * @param sampleItem A sample raw data item (used only for existence check).
 * @returns A STABLE array of DataField objects, or an empty array if no sample.
 */
export const getAvailableFields = (sampleItem: ConferenceResponse | null | undefined): DataField[] => {
    // console.log(`${logPrefixFields} getAvailableFields called. Sample exists: ${!!sampleItem}`);
    if (!sampleItem || typeof sampleItem !== 'object') {
        // console.warn(`${logPrefixFields} Invalid or missing sampleItem. Returning empty fields.`);
        return [];
    }
    // Always return the same template object - reference stability for hooks
    // console.log(`${logPrefixFields} Returning STABLE template with ${AVAILABLE_FIELDS_TEMPLATE.length} fields.`);
    return AVAILABLE_FIELDS_TEMPLATE;
};