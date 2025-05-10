import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChartDisplayProps {
    echartsConfig: any; //  Ideally, define a more specific type.
    sqlResult: any[];   //  Ideally, define a more specific type.
    description?: string;
}

const ChartDisplay: React.FC<ChartDisplayProps> = ({ echartsConfig, sqlResult, description }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const myChart = useRef<echarts.EChartsType | null>(null);

    useEffect(() => {
        // --- Helper Functions (from your original HTML, adapted for React) ---
        function processConfigFunctions(config: any): any { // Add type annotation for config
            for (const key in config) {
                if (config.hasOwnProperty(key)) {
                    const value = config[key];

                    // Check if the value is a string and looks like a function definition
                    if (typeof value === 'string' && value.trim().startsWith('function')) {
                        try {
                            // Attempt to evaluate the string as a function using Function constructor
                            config[key] = new Function('return ' + value)();
                            console.log(`Converted string function for key: ${key}`);
                        } catch (e) {
                            console.error(`Error converting string to function for key: ${key}`, e);
                            // Optionally handle the error, e.g., keep the string or set to null
                        }
                    } else if (typeof value === 'object' && value !== null) {
                        // Recursively process nested objects
                        processConfigFunctions(value);
                    }
                }
            }
            return config;
        }

        function generateDataMapping(chartConfig: any, sqlResultColumns: string[]): any { // Add types
            let chartType: string | undefined;
            if (Array.isArray(chartConfig.series)) {
                chartType = chartConfig.series[0]?.type;
            } else {
                chartType = chartConfig.series?.type;
            }
            const dataMapping: any = { chartType }; // Define dataMapping type as any

            const findColumnMatchingKeywords = (keywords: string[], columns: string[], columnName: string): string | null => { // Add types
                for (const col of columns) { // Duyệt qua từng cột TRƯỚC
                    for (const keyword of keywords) { // Sau đó duyệt qua từng từ khóa
                        // Ưu tiên 1: Tìm khớp chính xác (case-insensitive)
                        if (col.toLowerCase() === keyword.toLowerCase()) {
                            console.log(`generateDataMapping - ${chartType} ${columnName} được chọn (khớp chính xác keyword "${keyword}"):`, col);
                            return col; // Tìm thấy khớp chính xác, trả về cột và kết thúc hàm
                        }
                    }
                }

                for (const col of columns) { // Duyệt lại từng cột cho khớp include (sau khi đã kiểm tra khớp chính xác)
                    for (const keyword of keywords) { // Duyệt qua từng từ khóa
                        // Ưu tiên 2: Tìm khớp bao gồm từ hoàn chỉnh (case-insensitive)
                        const wordBoundaryRegex = new RegExp('\\b' + keyword + '\\b', 'i'); // Tạo regex với word boundary và case-insensitive flag
                        if (wordBoundaryRegex.test(col)) {
                            console.log(`generateDataMapping - ${chartType} ${columnName} được chọn (khớp include từ hoàn chỉnh keyword "${keyword}"):`, col);
                            return col; // Tìm thấy khớp include từ hoàn chỉnh, trả về cột và kết thúc hàm
                        }
                    }
                }

                return null; // Không tìm thấy cột nào khớp với bất kỳ từ khóa nào
            };


            if (chartType === 'line' || chartType === 'bar' || chartType === 'scatter') {
                const xAxisKeywords = ['Year', 'Source', 'Rank', 'Continent', 'Source', 'Country', 'Publisher', "Conference", "Topics"]; // Added 'Source' for line chart
                const yAxisKeywords = ['Number', 'NumOfConferences', 'Rating', 'AverageRating', "Conferences"];
                const seriesCategoryKeywords = ['Rank', 'Continent', 'Type', 'Category', 'Acronym', "Country", "Topics"];
                const zAxisKeywords = ['Value', 'Count', 'Intensity', 'Z', 'zValue', 'Rating', 'Total', 'NumOfConferences', 'Size', "Conferences"];

                dataMapping.xAxis = findColumnMatchingKeywords(xAxisKeywords, sqlResultColumns, 'xAxis');

                if (dataMapping.xAxis) {
                    const remainingColumnsForYAxis = sqlResultColumns.filter(col => col !== dataMapping.xAxis);
                    dataMapping.yAxis = findColumnMatchingKeywords(yAxisKeywords, remainingColumnsForYAxis, 'yAxis');
                } else {
                    dataMapping.yAxis = findColumnMatchingKeywords(yAxisKeywords, sqlResultColumns, 'yAxis'); // Fallback nếu không tìm được xAxis
                }

                dataMapping.zAxis = findColumnMatchingKeywords(zAxisKeywords, sqlResultColumns, 'zAxis');

                let remainingColumnsForSeriesCategory = sqlResultColumns.filter(col => col !== dataMapping.xAxis && col !== dataMapping.yAxis && col !== dataMapping.zAxis);
                dataMapping.seriesCategory = findColumnMatchingKeywords(seriesCategoryKeywords, remainingColumnsForSeriesCategory, 'seriesCategory');


            }
            else if (chartType === 'heatmap') {
                // Specific keywords for heatmap axes
                console.log("generateDataMapping - SQL Result Columns (Heatmap):", sqlResultColumns);
                const xAxisKeywords = ['Year', 'Date', 'Time', 'Category', 'Label', 'Source', 'Rank', 'Continent', 'Month', 'Country'];
                const yAxisKeywords = ['Month', 'Category', 'Row', 'Group', 'Type', 'Y', 'yAxis', 'yValue', 'Publisher'];
                const seriesCategoryKeywords = ['Series', 'Group', 'Name', 'Rank', 'Continent', 'Type', 'Category'];
                const zAxisKeywords = ['Value', 'Count', 'Intensity', 'Z', 'zValue', 'Rating', 'Total', 'Amount', 'Conferences'];

                dataMapping.xAxis = findColumnMatchingKeywords(xAxisKeywords, sqlResultColumns, 'xAxis');
                if (dataMapping.xAxis) {
                    const remainingColumnsForYAxis = sqlResultColumns.filter(col => col !== dataMapping.xAxis);
                    dataMapping.yAxis = findColumnMatchingKeywords(yAxisKeywords, remainingColumnsForYAxis, 'yAxis');
                } else {
                    dataMapping.yAxis = findColumnMatchingKeywords(yAxisKeywords, sqlResultColumns, 'yAxis'); // Fallback nếu không tìm được xAxis
                }


                if (dataMapping.xAxis && dataMapping.yAxis) {
                    const remainingColumnsForZAxis = sqlResultColumns.filter(col => col !== dataMapping.xAxis && col !== dataMapping.yAxis);
                    dataMapping.zAxis = findColumnMatchingKeywords(zAxisKeywords, remainingColumnsForZAxis, 'zAxis');
                } else {
                    dataMapping.zAxis = findColumnMatchingKeywords(zAxisKeywords, sqlResultColumns, 'zAxis'); // Fallback nếu không tìm được xAxis hoặc yAxis
                }


                let remainingColumnsForSeriesCategory = sqlResultColumns.filter(col => col !== dataMapping.xAxis && col !== dataMapping.yAxis && col !== dataMapping.zAxis);
                dataMapping.seriesCategory = findColumnMatchingKeywords(seriesCategoryKeywords, remainingColumnsForSeriesCategory, 'seriesCategory');

            }
            else if (chartType === 'pie') {
                const itemNameColumnKeywords = ['Type', 'Category', 'Name', 'Continent', 'Source', 'Country', 'Rank'];
                const itemValueColumnKeywords = ['Count', 'Value', 'Number', 'Num', 'NumOfConferences', 'Rating'];

                dataMapping.itemName = findColumnMatchingKeywords(itemNameColumnKeywords, sqlResultColumns, 'itemName');
                dataMapping.itemValue = findColumnMatchingKeywords(itemValueColumnKeywords, sqlResultColumns, 'itemValue');
            }

            console.log("generateDataMapping - Final Data Mapping:", dataMapping);
            return dataMapping;
        }


        function transformSqlResultToEchartsData(sqlResult: any[], chartConfig: any, dataMapping: any): any { // Add types
            if (!sqlResult || !Array.isArray(sqlResult) || sqlResult.length === 0) {
                return { seriesData: [], xAxisData: [], yAxisData: [] };
            }

            const {
                chartType,
                xAxis: xAxisColumn,
                yAxis: yAxisColumn,
                seriesCategory: seriesCategoryColumn,
                itemName: itemNameColumn,
                itemValue: itemValueColumn,
                zAxis: zAxisColumn,
            } = dataMapping;
            console.log("transformSqlResultToEchartsData - dataMapping:", dataMapping);

            if (chartType === "line" || chartType === "bar") {
                const xAxisData = [...new Set(sqlResult.map((row) => row[xAxisColumn]))];
                const seriesData = chartConfig.series.map((seriesConfig: any) => {
                    const seriesName = seriesConfig.name; // Lấy seriesName ra ngoài để dùng lại
                    const normalizedSeriesName = seriesName.toLowerCase();
                    // .replace("rank ", ""); // Chuẩn hóa seriesName: loại bỏ "rank " và chuyển về lowercase

                    const currentSeriesData = xAxisData.map((xAxisValue: any) => { // Add type to xAxisValue
                        let matchingDataPoints: any[];
                        if (seriesCategoryColumn) {
                            // Ưu tiên 1: Khớp chính xác (sau khi chuẩn hóa seriesName)
                            matchingDataPoints = sqlResult.filter(
                                (item: any) => // Add type to item in filter
                                    item[xAxisColumn] === xAxisValue &&
                                    item[seriesCategoryColumn]?.toLowerCase() ===
                                    normalizedSeriesName
                            );

                            if (matchingDataPoints.length === 0) {
                                // Ưu tiên 2: Khớp include từ hoàn chỉnh (so sánh normalizedSeriesName với seriesCategoryColumn)
                                const wordBoundaryRegex = new RegExp(
                                    "\\b" + normalizedSeriesName + "\\b",
                                    "i"
                                );
                                matchingDataPoints = sqlResult.filter(
                                    (item: any) => // Add type to item in filter
                                        item[xAxisColumn] === xAxisValue &&
                                        seriesCategoryColumn &&
                                        wordBoundaryRegex.test(item[seriesCategoryColumn])
                                );
                            }
                            if (matchingDataPoints.length === 0) {
                                // Ưu tiên 3: Khớp include từ hoàn chỉnh (so sánh seriesCategoryColumn với normalizedSeriesName - ĐẢO NGƯỢC CHIỀU SO SÁNH)
                                matchingDataPoints = sqlResult.filter((item: any) => { // Add type to item in filter
                                    // Đưa RegExp vào bên trong filter
                                    const wordBoundaryRegexReverse = new RegExp(
                                        "\\b" + item[seriesCategoryColumn] + "\\b",
                                        "i"
                                    ); // Regex với giá trị từ SQL (item đã được định nghĩa ở đây)
                                    return (
                                        item[xAxisColumn] === xAxisValue &&
                                        seriesCategoryColumn &&
                                        seriesName &&
                                        wordBoundaryRegexReverse.test(seriesName)
                                    ); // Kiểm tra seriesName có chứa giá trị từ SQL không
                                });
                            }
                        } else {
                            matchingDataPoints = sqlResult.filter(
                                (item: any) => item[xAxisColumn] === xAxisValue // Add type to item in filter
                            );
                        }
                        const dataPoint = matchingDataPoints[0];
                        return dataPoint ? dataPoint[yAxisColumn] : null;
                    });
                    return {
                        ...seriesConfig,
                        data: currentSeriesData,
                    };
                });
                return { seriesData, xAxisData, yAxisData: [] };
            } else if (chartType === "pie") {
                const pieData = sqlResult.map((row: any) => ({ // Add type to row in map
                    name: row[itemNameColumn],
                    value: row[itemValueColumn],
                }));
                return {
                    seriesData: [
                        {
                            ...chartConfig.series[0],
                            data: pieData,
                        },
                    ],
                    xAxisData: [],
                    yAxisData: [],
                };
            } else if (chartType === "scatter") {
                const xAxisData = [...new Set(sqlResult.map((row: any) => row[xAxisColumn]))]; // Add type to row in map
                const yAxisData = [...new Set(sqlResult.map((row: any) => row[yAxisColumn]))]; // Add type to row in map

                //   const seriesData = chartConfig.series.map((seriesConfig) => { // REMOVED: We're creating series DYNAMICALLY now
                let seriesData: any[] = []; // Initialize as an empty array, add type annotation
                if (seriesCategoryColumn) {
                    // Create a series for EACH unique value in the seriesCategoryColumn (Continent)
                    const uniqueCategories = [
                        ...new Set(sqlResult.map((item: any) => item[seriesCategoryColumn])), // Add type to item in map
                    ];
                    seriesData = uniqueCategories.map((category: any) => { // Add type to category
                        // Use map to build the series array
                        const currentSeriesData = sqlResult
                            .filter((item: any) => item[seriesCategoryColumn] === category) // Add type to item in filter
                            .map((item: any) => { // Add type to item in map
                                const zValue = zAxisColumn ? item[zAxisColumn] || 0 : 1;
                                return [item[xAxisColumn], item[yAxisColumn], zValue];
                            });
                        return {
                            name: category, // Series name is the category (e.g., "Europe")
                            type: "scatter",
                            data: currentSeriesData,
                            // You *could* add other series-specific properties here if needed
                        };
                    });
                } else {
                    // No series category:  All data belongs to the single series.
                    let currentSeriesData: any[] = []; // Add type annotation

                    currentSeriesData = sqlResult.map((item: any) => { // Add type to item in map
                        const zValue = zAxisColumn ? item[zAxisColumn] || 0 : 1; // Use zAxisColumn, default to 1 if not mapped
                        return [item[xAxisColumn], item[yAxisColumn], zValue];
                    });

                    seriesData = [
                        {
                            ...chartConfig.series[0], // Keep other series properties from the original config
                            data: currentSeriesData,
                        },
                    ];
                }
                return { seriesData, xAxisData, yAxisData };
            } else if (chartType === "heatmap") {
                // ... (Your heatmap code - NO CHANGES NEEDED) ...
                if (!xAxisColumn || !yAxisColumn || !zAxisColumn) {
                    console.error(
                        "Heatmap requires xAxis, yAxis, and zAxis data mappings."
                    );
                    return { seriesData: [], xAxisData: [], yAxisData: [] };
                }

                const xAxisData = [...new Set(sqlResult.map((row: any) => row[xAxisColumn]))]; // Add type to row in map
                const yAxisData = [...new Set(sqlResult.map((row: any) => row[yAxisColumn]))]; // Add type to row in map
                console.log(
                    "transformSqlResultToEchartsData - Heatmap xAxisData:",
                    xAxisData
                );
                console.log(
                    "transformSqlResultToEchartsData - Heatmap yAxisData:",
                    yAxisData
                );

                const seriesData = chartConfig.series.map((seriesConfig: any) => { // Add type to seriesConfig
                    const seriesName = seriesConfig.name;
                    const normalizedSeriesName = seriesName.toLowerCase();

                    let currentSeriesData: any[] = []; // Initialize as an empty array, add type annotation

                    if (seriesCategoryColumn) {
                        sqlResult.forEach((item: any) => { // Add type to item in forEach
                            const categoryValue = item[seriesCategoryColumn];

                            // Ưu tiên 1: Khớp chính xác
                            if (categoryValue?.toLowerCase() === normalizedSeriesName) {
                                let xAxisIndex = xAxisData.indexOf(item[xAxisColumn]);
                                let yAxisIndex = yAxisData.indexOf(item[yAxisColumn]);
                                if (xAxisIndex !== -1 && yAxisIndex !== -1) {
                                    currentSeriesData.push([
                                        xAxisIndex,
                                        yAxisIndex,
                                        item[zAxisColumn] || 0,
                                    ]);
                                }
                            } else {
                                // Ưu tiên 2 & 3:  Khớp include từ (normalizedSeriesName in categoryValue OR categoryValue in seriesName)
                                const wordBoundaryRegex = new RegExp(
                                    "\\b" + normalizedSeriesName + "\\b",
                                    "i"
                                );
                                const wordBoundaryRegexReverse = new RegExp(
                                    "\\b" + categoryValue + "\\b",
                                    "i"
                                );

                                if (
                                    (seriesCategoryColumn &&
                                        wordBoundaryRegex.test(categoryValue)) ||
                                    (seriesCategoryColumn &&
                                        seriesName &&
                                        wordBoundaryRegexReverse.test(seriesName))
                                ) {
                                    let xAxisIndex = xAxisData.indexOf(item[xAxisColumn]);
                                    let yAxisIndex = yAxisData.indexOf(item[yAxisColumn]);
                                    if (xAxisIndex !== -1 && yAxisIndex !== -1) {
                                        currentSeriesData.push([
                                            xAxisIndex,
                                            yAxisIndex,
                                            item[zAxisColumn] || 0,
                                        ]);
                                    }
                                }
                            }
                        });
                    } else {
                        // No series category:  Map all data, converting to indices.
                        sqlResult.forEach((item: any) => { // Add type to item in forEach
                            let xAxisIndex = xAxisData.indexOf(item[xAxisColumn]);
                            let yAxisIndex = yAxisData.indexOf(item[yAxisColumn]);

                            if (xAxisIndex !== -1 && yAxisIndex !== -1) {
                                currentSeriesData.push([
                                    xAxisIndex,
                                    yAxisIndex,
                                    item[zAxisColumn] || 0,
                                ]);
                            }
                        });
                    }

                    console.log(
                        "transformSqlResultToEchartsData - Heatmap currentSeriesData:",
                        currentSeriesData
                    );
                    return {
                        ...seriesConfig,
                        name: seriesConfig.name,
                        type: "heatmap",
                        data: currentSeriesData,
                        label: seriesConfig.label,
                        emphasis: seriesConfig.emphasis,
                    };
                });
                return { seriesData, xAxisData, yAxisData };
            }
            return { seriesData: [], xAxisData: [], yAxisData: [] }; // Default return
        }


        if (chartContainerRef.current && echartsConfig && sqlResult && sqlResult.length > 0) {
            myChart.current = echarts.init(chartContainerRef.current);

            const sqlResultColumns: string[] = Object.keys(sqlResult[0]); // No longer need || {}
            const config = processConfigFunctions(echartsConfig);

            let generatedDataMapping = generateDataMapping(config, sqlResultColumns);

            if (!generatedDataMapping.xAxis && (config.series[0]?.type === "bar" || config.series[0]?.type === 'line')) {
                console.warn("Could not automatically determine xAxis. Using the first column.");
                generatedDataMapping.xAxis = sqlResultColumns[0];
            }
            if (!generatedDataMapping.yAxis && (config.series[0]?.type === "bar" || config.series[0]?.type === 'line')) {
                console.warn("Could not automatically determine yAxis.  Using the second column.");
                generatedDataMapping.yAxis = sqlResultColumns[1];
            }

            // seriesCategory is only check for multi-series
            if (config.series.length > 1 && !generatedDataMapping.seriesCategory && (config.series[0]?.type === "bar" || config.series[0]?.type === 'line')) {
                console.warn("Could not automatically determine seriesCategory. Using a default series name.");
                const defaultSeriesName = 'DefaultSeries';

                // Correctly create modified data and config
                const modifiedSqlResult = sqlResult.map((item: any) => ({ ...item, [defaultSeriesName]: 'default' }));
                const modifiedEchartsConfig = {
                    ...echartsConfig,
                    series: [{ name: defaultSeriesName, type: config.series[0]?.type }], // Use optional chaining
                };

                generatedDataMapping = { ...generatedDataMapping, seriesCategory: defaultSeriesName }; // Update data mapping
                sqlResult = modifiedSqlResult;
                echartsConfig = modifiedEchartsConfig; // Now we are modifying the *local* copies
            }


            const transformedData = transformSqlResultToEchartsData(sqlResult, echartsConfig, generatedDataMapping);
            console.log("Transformed Data:", transformedData);

            const echartsOptionDynamic: echarts.EChartsOption = {
                ...echartsConfig,
                xAxis: {
                    ...echartsConfig.xAxis,
                    data: transformedData.xAxisData
                },
                yAxis: {
                    ...echartsConfig.yAxis,
                     data: transformedData.yAxisData != null ? transformedData.yAxisData : []
                },
                series: transformedData.seriesData
            };

            console.log("echartsOptionDynamic for Chart:", echartsOptionDynamic);

            myChart.current.setOption(echartsOptionDynamic);
        } else {
            console.warn("Not rendering chart: Missing data (echartsConfig, sqlResult, or container)");
        }

        return () => {
            if (myChart.current) {
                myChart.current.dispose();
                myChart.current = null;
            }
        };
    }, [echartsConfig, sqlResult, description]);

    return (
        <div>
            <div ref={chartContainerRef} style={{ width: '100%', height: '500px' }}></div>
            <div className="mt-4">
                <ReactMarkdown
                    children={description || 'No description available.'}
                    remarkPlugins={[remarkGfm]}
                />
            </div>
        </div>
    );
};

export default ChartDisplay;