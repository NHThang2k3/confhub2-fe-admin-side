// src/app/[locale]/visualization/utils/options.ts
import { EChartsOption } from 'echarts';
import { ChartConfig, ChartOptions, DataField } from '../../../../models/visualization/visualization';
import { ConferenceResponse } from '@/src/models/response/conference.response';
import { processDataForChart } from './processor'; // Import data processor

const logPrefixOptions = 'OPTIONS:';

/**
 * Generates the final ECharts option object.
 * @param rawData Array of ConferenceResponse items.
 * @param config User's chart configuration.
 * @param options Chart display options (title, legend, etc.).
 * @param availableFields List of all defined DataFields.
 * @returns EChartsOption object ready for rendering.
 */
export const generateChartOption = (
    rawData: ConferenceResponse[],
    config: ChartConfig,
    options: ChartOptions,
    availableFields: DataField[]
): EChartsOption => {
    console.log(`${logPrefixOptions} generateChartOption: Start. Type: ${config.chartType}, Title: "${options.title}"`);

    // 1. Process Data
    console.log(`${logPrefixOptions} generateChartOption: Calling processDataForChart...`);
    const { categories, series, legendData } = processDataForChart(rawData, config, availableFields);
    console.log(`${logPrefixOptions} generateChartOption: Data processed. Series: ${series.length}, Categories: ${categories?.length}, Legend: ${legendData?.length}`);

    // Find fields for axis names etc.
    const xAxisField = availableFields.find(f => f.id === config.xAxis?.fieldId);
    const yAxisField = availableFields.find(f => f.id === config.yAxis?.fieldId);
    const sizeField = availableFields.find(f => f.id === config.size?.fieldId);

    // 2. Determine Axis Types
    let xAxisType: 'category' | 'value' = 'category';
    if (config.chartType === 'scatter') {
        xAxisType = (xAxisField && xAxisField.type === 'measure') ? 'value' : 'category';
    } else if (config.chartType === 'bar' || config.chartType === 'line') {
        xAxisType = 'category';
    }
    console.log(`${logPrefixOptions} generateChartOption: X-Axis type: ${xAxisType}`);

    // 3. Build Axis Options
    // --- FIX: Define xAxisOption using indexed access type ---
    let xAxisOption: EChartsOption['xAxis'] = undefined;
    if (config.chartType !== 'pie') {
        if (xAxisType === 'category') {
            xAxisOption = {
                type: 'category',
                name: xAxisField?.name,
                nameLocation: 'middle',
                nameGap: (categories && categories.length > 10) ? 40 : 25,
                nameTextStyle: { fontSize: 12 },
                data: categories,
                axisTick: { alignWithLabel: true },
                axisLabel: {
                    fontSize: 10,
                    rotate: (categories && categories.length > 10) ? 30 : 0,
                    interval: (categories && categories.length > 20) ? 'auto' : 0,
                },
                boundaryGap: true, // <-- Boolean là đúng cho category
            };
        } else { // Includes 'value', 'time', 'log'
            xAxisOption = {
                type: 'value', // Hoặc 'time', 'log'
                name: xAxisField?.name,
                nameLocation: 'middle',
                nameGap: 25,
                nameTextStyle: { fontSize: 12 },
                axisTick: undefined, // Thường không cần tick đặc biệt cho value axis
                axisLabel: {
                    fontSize: 10,
                },
                // boundaryGap: false, // <-- XÓA DÒNG NÀY
                // Mặc định cho type 'value' là không có khoảng đệm thêm (boundaryGap = [0,0])
            };
        }
    }
    // --- FIX END ---


    // 4. Build Base Option Structure
    const finalOption: EChartsOption = {
        title: {
            text: options.title || 'Chart',
            left: 'center',
            textStyle: { fontSize: 16, fontWeight: 'normal' },
        },
        tooltip: {
            trigger: config.chartType === 'pie' ? 'item' : 'axis',
            axisPointer: { type: 'cross' }, // Crosshair for axis tooltips
            // formatter: // Add custom formatter later if needed based on chart type/data
        },
        legend: {
            show: options.showLegend && legendData && legendData.length > 0, // Show if enabled and items exist
            type: 'scroll', // Allow scrolling if many items
            orient: 'horizontal',
            left: 'center',
            bottom: 5, // Position at bottom
            data: legendData,
            textStyle: { fontSize: 10 }, // Smaller legend text
            itemWidth: 15, // Adjust legend item symbol size
            itemHeight: 10,
        },
        toolbox: {
            show: options.showToolbox,
            orient: 'vertical',
            left: 'right',
            top: 'center',
            itemSize: 14, // Smaller toolbox icons
            feature: {
                // dataZoom: { yAxisIndex: 'none', title: { zoom: 'Zoom', back: 'Reset' } },
                magicType: {
                    type: ['line', 'bar', 'stack'], // Allow switching (contextually useful)
                    title: { line: 'Line', bar: 'Bar', stack: 'Stack', tiled: 'Tiled' }
                },
                restore: { title: 'Restore' },
                saveAsImage: {
                    name: options.title?.replace(/[^a-z0-9]/gi, '_') || 'chart', // Sanitize filename
                    type: 'png',
                    pixelRatio: 2, // Higher resolution save
                    title: 'Save PNG'
                },
                dataView: { readOnly: true, title: 'Data View', lang: ['Data View', 'Close', 'Refresh'] }, // Allow viewing data
            },
        },
        grid: { // Padding around the chart area
            left: '3%',
            right: '8%', // Increased right padding for toolbox
            bottom: options.showLegend && legendData && legendData.length > 0 ? '10%' : '5%', // Adjust based on legend
            top: '15%', // Padding for title
            containLabel: true // Ensure axis labels fit
        },
        xAxis: xAxisOption, // <-- Assign the conditionally created option object
        yAxis: config.chartType !== 'pie' ? { // yAxis is usually 'value' in these examples
            type: 'value',
            name: yAxisField?.name,
            nameLocation: 'middle',
            nameGap: 45, // Adjust based on expected label length
            nameTextStyle: { fontSize: 12 },
            axisLabel: {
                fontSize: 10,
                // formatter: '{value} units' // Custom formatting if needed
            },
        } : undefined, // No yAxis for Pie
        series: series,
        // visualMap: [], // Placeholder for continuous color/size mapping
        // dataZoom: [], // Placeholder for zoom/scroll
        // backgroundColor: '#fff', // Optional background
    };



    // 4. Apply Chart-Specific Overrides & Enhancements

    // Pie Chart: Remove axis/grid explicitly (already handled by xAxisOption being undefined)
    if (config.chartType === 'pie') {
        // delete finalOption.xAxis; // No longer needed
        delete finalOption.yAxis;
        delete finalOption.grid;
        // Adjust tooltip formatter for Pie
        finalOption.tooltip = {
            ...finalOption.tooltip,
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)' // Standard pie tooltip: Series Name, Item Name, Value, Percentage
        };
    }

    // Scatter Chart: Ensure value axis types are correct (already handled by xAxisOption logic)
    if (config.chartType === 'scatter') {

        // Add visualMap if size field is used
        if (sizeField && finalOption.series && Array.isArray(finalOption.series) && finalOption.series.length > 0) {
            let minSize = Infinity, maxSize = -Infinity;
            let sizeDataExists = false;

            finalOption.series.forEach(s => {
                // Check if series is scatter and data exists and has length
                // (length check is important for ArrayLike)
                if (s.type === 'scatter' && s.data && typeof (s.data as any).length === 'number') {

                    // --- FIX START: Use standard for loop for ArrayLike compatibility ---
                    const dataLength = (s.data as any).length; // Get length safely
                    for (let i = 0; i < dataLength; i++) {
                        // Truy cập phần tử bằng chỉ mục
                        const item = (s.data as any)[i];

                        // Giữ nguyên type guard bên trong cho từng 'item'
                        if (Array.isArray(item) && item.length > 2) {
                            const sizeVal = item[2];
                            if (typeof sizeVal === 'number' && !isNaN(sizeVal)) {
                                sizeDataExists = true;
                                minSize = Math.min(minSize, sizeVal);
                                maxSize = Math.max(maxSize, sizeVal);
                            }
                        }
                        // Bạn có thể thêm else if để xử lý trường hợp item là object
                        // else if (typeof item === 'object' && item !== null && Array.isArray((item as any).value)) {
                        //    // Xử lý item.value[2] nếu cần
                        // }
                        // else {
                        //    console.warn("Unexpected scatter data item format:", item);
                        // }
                    }
                    // --- FIX END ---
                }
            });

            // Logic thêm visualMap không đổi
            if (sizeDataExists && isFinite(minSize) && isFinite(maxSize) && minSize !== maxSize) {
                console.log(`Adding visualMap for size. Range: ${minSize}-${maxSize}`, 'color: purple;');
                finalOption.visualMap = [{
                    type: 'continuous',
                    dimension: 2,
                    min: minSize,
                    max: maxSize,
                    itemWidth: 15,
                    itemHeight: 80,
                    text: [`Max: ${maxSize.toFixed(1)}`, `Min: ${minSize.toFixed(1)}`],
                    textGap: 5,
                    textStyle: { fontSize: 10 },
                    calculable: true,
                    realtime: true,
                    inRange: { symbolSize: [5, 30] },
                    orient: 'vertical',
                    left: 10,
                    bottom: '15%'
                }];
            } else if (sizeDataExists) {
                console.log(`Size field selected, but min/max range invalid or constant (${minSize}-${maxSize}). Skipping visualMap.`, 'color: orange;');
            }
        }
        // Adjust scatter tooltip formatter
        finalOption.tooltip = {
            ...finalOption.tooltip,
            trigger: 'item', // Tooltip per point
            formatter: (params: any) => {
                const seriesName = params.seriesName;
                const data = params.data || [];
                // Use axis field names if available, otherwise default
                const xName = xAxisField?.name ?? 'X';
                const yName = yAxisField?.name ?? 'Y';
                let tooltip = `${seriesName}<br/>`;
                // Access data array elements, checking length
                if (data.length > 0) tooltip += `${xName}: ${data[0]}<br/>`;
                if (data.length > 1) tooltip += `${yName}: ${data[1]}<br/>`;
                if (sizeField && data.length > 2) {
                    tooltip += `${sizeField.name}: ${data[2]}<br/>`;
                }
                return tooltip;
            }
        };
    }

    // Add DataZoom for charts with many categories or value-based X-axis
    const addDataZoom = (xAxisType === 'value') || (xAxisType === 'category' && categories && categories.length > 20);
    if (config.chartType !== 'pie' && addDataZoom) {
        console.log(`Adding dataZoom for X-axis.`, 'color: purple;');
        finalOption.dataZoom = [
            {
                type: 'slider',
                xAxisIndex: 0,
                filterMode: 'filter',
                bottom: (options.showLegend && legendData && legendData.length > 0) ? 35 : 15,
                height: 15,
                start: 0,
                end: 100
            },
            {
                type: 'inside',
                xAxisIndex: 0,
                filterMode: 'filter',
            }
        ];

        // --- FIX START: Adjust grid bottom padding more safely ---
        // Kiểm tra grid tồn tại VÀ không phải là mảng (vì chúng ta khởi tạo nó là object)
        if (finalOption.grid && !Array.isArray(finalOption.grid)) {
            // Bên trong khối này, TypeScript biết finalOption.grid là một object đơn lẻ (GridComponentOption)
            if (options.showLegend && legendData && legendData.length > 0) {
                // Tăng padding nếu cả legend và zoom đều hiển thị
                finalOption.grid.bottom = '15%'; // Truy cập trực tiếp, không cần 'as'
            } else {
                // Padding ít hơn nếu chỉ có zoom
                finalOption.grid.bottom = '10%'; // Truy cập trực tiếp
            }
        }
        // Optional: Nếu có khả năng grid là mảng ở đâu đó khác, bạn cần xử lý trường hợp đó:
        // else if (Array.isArray(finalOption.grid) && finalOption.grid.length > 0) {
        //     // Quyết định grid nào cần sửa, ví dụ: grid đầu tiên
        //     const gridToModify = finalOption.grid[0];
        //     if (options.showLegend && legendData && legendData.length > 0) {
        //         gridToModify.bottom = '15%';
        //     } else {
        //         gridToModify.bottom = '10%';
        //     }
        // }
        // --- FIX END ---
    }


    console.log(`Final ECharts option constructed.`, 'color: purple; font-weight: bold;');
    // console.log(JSON.stringify(finalOption, null, 2)); // Deep log final option if needed

    return finalOption;
};