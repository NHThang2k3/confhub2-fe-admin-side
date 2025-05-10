// src/app/[locale]/visualization/utils/processor.ts
import { groupBy, mapValues, sumBy } from 'lodash';
import { ChartConfig, ProcessedChartData, DataField, ChartType } from '../../../../models/visualization/visualization';
import { ConferenceResponse } from '@/src/models/response/conference.response';
import { getNestedValue, parseNumericValue } from './helpers'; // Import helpers
import { UNKNOWN_CATEGORY } from './fields'; // Import constants if needed

const logPrefixProcessor = 'PROCESSOR:';

/**
 * Aggregates data within groups based on the measure field's aggregation type.
 * (Internal helper function for processDataForChart)
 */
const aggregateData = (
    groupedData: Record<string, ConferenceResponse[]>,
    measureField: DataField
): Record<string, number> => {
    const measureId = measureField.id;
    const aggregationType = measureField.aggregation;
    console.log(`${logPrefixProcessor} aggregateData: Aggregating "${measureId}" (${aggregationType}) for groups: [${Object.keys(groupedData).join(', ')}]`);

    if (!aggregationType) {
        console.warn(`${logPrefixProcessor} aggregateData: Missing aggregation type for "${measureId}". Returning 0.`);
        return mapValues(groupedData, () => 0);
    }

    switch (aggregationType) {
        case 'sum':
            if (!measureField.accessor) {
                console.warn(`${logPrefixProcessor} aggregateData: SUM needs accessor for "${measureId}". Returning 0.`);
                return mapValues(groupedData, () => 0);
            }
            return mapValues(groupedData, (group, key) => {
                const sum = sumBy(group, item => parseNumericValue(measureField.accessor!(item), `${measureId} for SUM in group ${key}`));
                return sum;
            });

        case 'average':
            const avgTargetProp = (measureField as any).avgTargetProperty;
            console.log(`${logPrefixProcessor} aggregateData: AVERAGE for "${measureId}" ${avgTargetProp ? `(prop: "${avgTargetProp}")` : ''}.`);
            if (!measureField.accessor) {
                console.warn(`${logPrefixProcessor} aggregateData: AVERAGE needs accessor for "${measureId}". Returning 0.`);
                return mapValues(groupedData, () => 0);
            }
            return mapValues(groupedData, (group, key) => {
                const allValues: number[] = [];
                group.forEach((item, index) => {
                    const accessedValue = measureField.accessor!(item);
                    if (avgTargetProp && Array.isArray(accessedValue)) {
                        const arrayValues = accessedValue
                            .map((subItem: any, subIndex: number) => parseNumericValue(getNestedValue(subItem, avgTargetProp), `${avgTargetProp} from ${measureId}[${subIndex}]`))
                            .filter(v => !isNaN(v));
                        allValues.push(...arrayValues);
                    } else if (!avgTargetProp) {
                        const numValue = parseNumericValue(accessedValue, `${measureId} for AVERAGE item ${index}`);
                        if (!isNaN(numValue)) allValues.push(numValue);
                    } else {
                        console.warn(`${logPrefixProcessor} aggregateData: AVERAGE - Mismatch for "${measureId}" in group "${key}". Expected array for avgTargetProp.`);
                    }
                });
                const average = allValues.length > 0 ? sumBy(allValues) / allValues.length : 0;
                return average;
            });

        case 'count':
            return mapValues(groupedData, (group, key) => {
                const count = group.length;
                return count;
            });

        default:
            console.warn(`${logPrefixProcessor} aggregateData: Unknown aggregation type: "${aggregationType}" for "${measureId}". Returning 0.`);
            return mapValues(groupedData, () => 0);
    }
};


/**
 * Processes raw data based on chart configuration into a structure suitable for ECharts.
 * @param rawData Array of ConferenceResponse items.
 * @param config User's chart configuration.
 * @param availableFields List of all defined DataFields.
 * @returns Processed chart data (categories, series, legend).
 * @throws Error on invalid configuration.
 */
export const processDataForChart = (
    rawData: ConferenceResponse[],
    config: ChartConfig,
    availableFields: DataField[]
): ProcessedChartData => {
    const chartType = config.chartType as ChartType;
    console.log(`${logPrefixProcessor} processDataForChart: Start. Type: "${chartType}", Data length: ${rawData?.length ?? 0}`);

    if (!rawData || rawData.length === 0) {
        console.warn(`${logPrefixProcessor} processDataForChart: No raw data. Returning empty.`);
        return { categories: [], series: [], legendData: [] };
    }

    // Find selected fields (validation ensures required ones exist later)
    const xAxisField = availableFields.find(f => f.id === config.xAxis?.fieldId);
    const yAxisField = availableFields.find(f => f.id === config.yAxis?.fieldId);
    const colorField = availableFields.find(f => f.id === config.color?.fieldId);
    const sizeField = availableFields.find(f => f.id === config.size?.fieldId);

    console.log(`${logPrefixProcessor} processDataForChart: Fields - X:${xAxisField?.id || 'N/A'} Y:${yAxisField?.id || 'N/A'} Color:${colorField?.id || 'N/A'} Size:${sizeField?.id || 'N/A'}`);

    // --- Input Validation ---
    // Added more specific error logging
    if (!yAxisField) {
        const errorMsg = `Chart requires a Measure field for Y-Axis/Value (Selected: ${config.yAxis?.fieldId || 'none'}).`;
        throw new Error(errorMsg);
    }
    if (yAxisField.type !== 'measure') {
        const errorMsg = `Field '${yAxisField.name}' (ID: ${yAxisField.id}) selected for Y-Axis/Value is not a Measure (Type: ${yAxisField.type}).`;
        throw new Error(errorMsg);
    }
    if (!yAxisField.aggregation && !yAxisField.accessor && chartType !== 'scatter') {
        const errorMsg = `Measure field '${yAxisField.name}' (ID: ${yAxisField.id}) requires an 'aggregation' type (or an accessor for scatter Y) but has none.`;
        throw new Error(errorMsg);
    }

    let categories: string[] = [];
    let series: any[] = [];
    let legendData: string[] = [];

    console.log(`${logPrefixProcessor} processDataForChart: Processing logic for ${chartType}...`);

    // --- Bar/Line Chart Logic ---
    if (chartType === 'bar' || chartType === 'line') {


        if (!xAxisField?.accessor || !yAxisField?.aggregation) throw new Error("Bar/Line chart requires valid X (Dimension w/ accessor) and Y (Measure w/ aggregation) fields.");



        const groupKeyAccessor = (item: ConferenceResponse): string => xAxisField.accessor!(item)?.toString() ?? UNKNOWN_CATEGORY;


        console.log(`${logPrefixProcessor} processDataForChart: Calculating group keys...`);
        const keysGenerated: Record<string, number> = {};
        rawData.forEach((item, index) => {
            const key = groupKeyAccessor(item);
            keysGenerated[key] = (keysGenerated[key] || 0) + 1;
            // Optional: Log problematic items
            // if (key === "Record Count") {
            //    console.log(`Item at index ${index} generated key "Record Count":`, JSON.stringify(item));
            // }
        });

        console.log(`${logPrefixProcessor} processDataForChart: Keys generated counts:`, keysGenerated);
        // Explicitly check for empty string count
        if (keysGenerated.hasOwnProperty('')) {
            console.log(`>>> Count for empty string key ('') : ${keysGenerated['']}`); // Log dễ nhận biết
        } else {
            console.log(`>>> No empty string key ('') found.`);
        }

        const groupedByX = groupBy(rawData, groupKeyAccessor);
        console.log(`${logPrefixProcessor} processDataForChart: Grouped data keys:`, Object.keys(groupedByX));
        categories = Object.keys(groupedByX).sort();
        console.log(`${logPrefixProcessor} processDataForChart: Final categories:`, categories);


        // const groupedByX = groupBy(rawData, groupKeyAccessor);
        // categories = Object.keys(groupedByX).sort();

        if (!colorField?.accessor) { // Single series
            const aggregatedValues = aggregateData(groupedByX, yAxisField);
            const data = categories.map(cat => aggregatedValues[cat] ?? 0);
            series.push({ name: yAxisField.name, type: chartType, data, emphasis: { focus: 'series' }, smooth: chartType === 'line' });
            legendData.push(yAxisField.name);
        } else { // Multi series by color
            const colorKeyAccessor = (item: ConferenceResponse): string => colorField.accessor!(item)?.toString() ?? UNKNOWN_CATEGORY;
            const groupedByColor = groupBy(rawData, colorKeyAccessor);
            legendData = Object.keys(groupedByColor).sort();
            series = legendData.map(colorValue => {
                const colorGroupData = groupedByColor[colorValue];
                const groupedSubsetByX = groupBy(colorGroupData, groupKeyAccessor);
                const aggregatedValues = aggregateData(groupedSubsetByX, yAxisField);
                const data = categories.map(cat => aggregatedValues[cat] ?? 0);
                return { name: colorValue, type: chartType, stack: 'total', emphasis: { focus: 'series' }, smooth: chartType === 'line', data };
            });
        }
    }
    // --- Pie Chart Logic ---
    else if (chartType === 'pie') {
        if (!colorField?.accessor || !yAxisField?.aggregation) throw new Error("Pie chart requires valid Color (Dimension w/ accessor) and Value (Measure w/ aggregation) fields.");
        const groupKeyAccessor = (item: ConferenceResponse): string => colorField.accessor!(item)?.toString() ?? UNKNOWN_CATEGORY;
        const groupedByColor = groupBy(rawData, groupKeyAccessor);
        legendData = Object.keys(groupedByColor).sort();
        const aggregatedValues = aggregateData(groupedByColor, yAxisField);
        const data = legendData.map(name => ({ name, value: aggregatedValues[name] ?? 0 }));
        series.push({
            name: yAxisField.name,
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: true,
            itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 1 },
            label: { show: false, position: 'center' },
            emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
            labelLine: { show: false },
            data: data,
        });
        categories = [];
    }
    // --- Scatter Plot Logic ---
    else if (chartType === 'scatter') {
        if (!xAxisField?.accessor || !yAxisField?.accessor) throw new Error("Scatter chart requires valid X and Y fields with accessors.");
        const sizeAccessor = sizeField?.accessor; // Optional
        const defaultSize = 8;

        const mapItemToPoint = (item: ConferenceResponse): (number | string | null)[] | null => {
            const xValRaw = xAxisField.accessor!(item);
            const yValRaw = yAxisField.accessor!(item);
            const finalXVal = xAxisField.type === 'dimension' ? String(xValRaw ?? UNKNOWN_CATEGORY) : parseNumericValue(xValRaw);
            const numY = parseNumericValue(yValRaw);
            const sizeVal = sizeAccessor ? parseNumericValue(sizeAccessor(item)) : defaultSize;
            const isXInvalid = xAxisField.type === 'measure' && isNaN(Number(finalXVal));
            const isYInvalid = isNaN(numY);
            if (isXInvalid || isYInvalid) return null; // Skip invalid
            const pointData: (number | string | null)[] = [finalXVal, numY];
            if (sizeAccessor) pointData.push(sizeVal > 0 ? sizeVal : 1);
            return pointData;
        };

        if (!colorField?.accessor) { // Single series scatter
            const data = rawData.map(mapItemToPoint).filter((p): p is (number | string | null)[] => p !== null);
            series.push({ name: yAxisField.name, type: 'scatter', symbolSize: sizeAccessor ? undefined : defaultSize, data, emphasis: { focus: 'series', scale: 1.1 } });
            legendData.push(yAxisField.name);
        } else { // Multi series scatter by color
            const colorKeyAccessor = (item: ConferenceResponse): string => colorField.accessor!(item)?.toString() ?? UNKNOWN_CATEGORY;
            const groupedByColor = groupBy(rawData, colorKeyAccessor);
            legendData = Object.keys(groupedByColor).sort();
            series = legendData.map(colorValue => {
                const colorGroupData = groupedByColor[colorValue];
                const data = colorGroupData.map(mapItemToPoint).filter((p): p is (number | string | null)[] => p !== null);
                return { name: colorValue, type: 'scatter', symbolSize: sizeAccessor ? undefined : defaultSize, data, emphasis: { focus: 'series', scale: 1.1 } };
            });
        }
        // Generate categories if X is dimension
        if (xAxisField.type === 'dimension') {
            categories = [...new Set(rawData.map(item => String(xAxisField.accessor!(item) ?? UNKNOWN_CATEGORY)))].sort();
        } else {
            categories = [];
        }
    }

    console.log(`${logPrefixProcessor} processDataForChart: Finished. Series: ${series.length}, Categories: ${categories.length}, Legend: ${legendData.length}`);
    return { categories, series, legendData };
};