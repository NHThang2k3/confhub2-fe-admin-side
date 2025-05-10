// // src/app/[locale]/visualization/utils/visualizationUtils.ts
// import { EChartsOption } from 'echarts';
// import { ChartConfig, ChartOptions, DataField, FieldType, ProcessedChartData, ChartType } from '../../../../models/visualization/visualization'; // Adjust path as needed
// import { groupBy, mapValues, sumBy, countBy, meanBy } from 'lodash'; // Ensure lodash is installed
// import { ConferenceResponse, Feedback } from '@/src/models/response/conference.response'; // Assuming Feedback type is defined here or imported separately

// // --- Constants ---
// const UNKNOWN_CATEGORY = 'Unknown'; // Consistent handling for null/undefined keys
// const logPrefixUtil = 'UTILS:'; // Prefix for console logs in this file

// // --- Utility Functions ---

// /**
//  * Safely retrieves a nested value from an object using a dot-separated path.
//  * Handles array indices within the path.
//  * @param obj The object to traverse.
//  * @param path The dot-separated path string (e.g., 'organizations[0].locations[0].country').
//  * @returns The value found at the path, or undefined if the path is invalid or any part is null/undefined.
//  */
// const getNestedValue = (obj: any, path: string): any => {
//     if (typeof obj !== 'object' || obj === null) {
//         // console.log(`${logPrefixUtil} getNestedValue: Input obj is not an object or is null.`);
//         return undefined;
//     }
//     // console.log(`${logPrefixUtil} getNestedValue: Accessing path "${path}" on object:`, obj); // Log the object structure if needed (can be verbose)
//     try {
//         const parts = path.split('.');
//         let current: any = obj;

//         for (const part of parts) {
//             if (current === null || current === undefined) {
//                 // console.log(`${logPrefixUtil} getNestedValue: Path traversal stopped at "${part}" due to null/undefined parent.`);
//                 return undefined;
//             }

//             // Check for array index notation like "locations[0]"
//             const arrayMatch = part.match(/^(.+)\[(\d+)]$/);
//             if (arrayMatch) {
//                 const arrayKey = arrayMatch[1];
//                 const index = parseInt(arrayMatch[2], 10);
//                 // console.log(`${logPrefixUtil} getNestedValue: Accessing array "${arrayKey}" at index ${index}.`);
//                 current = current[arrayKey];
//                 if (!Array.isArray(current) || index >= current.length) {
//                     // console.log(`${logPrefixUtil} getNestedValue: Array "${arrayKey}" not found, not an array, or index ${index} out of bounds.`);
//                     return undefined;
//                 }
//                 current = current[index];
//             } else {
//                 // console.log(`${logPrefixUtil} getNestedValue: Accessing property "${part}".`);
//                 current = current[part];
//             }
//         }
//         // console.log(`${logPrefixUtil} getNestedValue: Path "${path}" resolved to value:`, current);
//         return current;
//     } catch (error) {
//         console.error(`${logPrefixUtil} getNestedValue: Error accessing path "${path}":`, error);
//         return undefined;
//     }
// };


// /**
//  * Parses a value to a number, returning 0 for invalid or non-numeric types.
//  * Logs the conversion attempt.
//  * @param value The value to parse.
//  * @param fieldName Optional field name for logging context.
//  * @returns The parsed number, or 0 if parsing fails.
//  */
// const parseNumericValue = (value: any, fieldName: string = 'value'): number => {
//     // console.log(`${logPrefixUtil} parseNumericValue: Attempting to parse ${fieldName}:`, value);
//     if (typeof value === 'number' && !isNaN(value)) {
//         // console.log(`${logPrefixUtil} parseNumericValue: Parsed ${fieldName} as number: ${value}`);
//         return value;
//     }
//     if (typeof value === 'string') {
//         const num = parseFloat(value);
//         if (!isNaN(num)) {
//             // console.log(`${logPrefixUtil} parseNumericValue: Parsed string "${value}" for ${fieldName} as number: ${num}`);
//             return num;
//         }
//     }
//     // console.log(`${logPrefixUtil} parseNumericValue: Failed to parse ${fieldName} (value: ${value}). Returning 0.`);
//     return 0;
// };

// // --- STABLE ACCESSOR DEFINITIONS ---
// // Define accessors outside getAvailableFields so they have stable references
// // Added detailed logging within each accessor
// const accessors = {
//     continent: (item: ConferenceResponse): string => {
//         const path = 'organizations[0].locations[0].continent';
//         const value = getNestedValue(item, path);
//         const result = value ?? UNKNOWN_CATEGORY;
//         // console.log(`${logPrefixUtil} Accessor [continent]: Path="${path}", Raw=${value}, Result=${result}`);
//         return result;
//     },
//     country: (item: ConferenceResponse): string => {
//         const path = 'organizations[0].locations[0].country';
//         const value = getNestedValue(item, path);
//         const result = value ?? UNKNOWN_CATEGORY;
//         // console.log(`${logPrefixUtil} Accessor [country]: Path="${path}", Raw=${value}, Result=${result}`);
//         return result;
//     },
//     year: (item: ConferenceResponse): string => {
//         const path = 'organizations[0].year';
//         const value = getNestedValue(item, path);
//         // Ensure the result is a string for dimension axis
//         const result = value !== null && value !== undefined ? String(value) : UNKNOWN_CATEGORY;
//         // console.log(`${logPrefixUtil} Accessor [year]: Path="${path}", Raw=${value}, Result=${result}`);
//         return result;
//     },
//     accessType: (item: ConferenceResponse): string => {
//         const path = 'organizations[0].accessType';
//         const value = getNestedValue(item, path);
//         const result = value ?? UNKNOWN_CATEGORY;
//         // console.log(`${logPrefixUtil} Accessor [accessType]: Path="${path}", Raw=${value}, Result=${result}`);
//         return result;
//     },
//     followersCount: (item: ConferenceResponse): number => {
//         const path = 'followBy'; // Corrected typo
//         const value = getNestedValue(item, path);
//         const result = Array.isArray(value) ? value.length : 0;
//         // console.log(`${logPrefixUtil} Accessor [followersCount]: Path="${path}", Raw=${value}, Result=${result}`);
//         return result;
//     },
//     feedbacksCount: (item: ConferenceResponse): number => {
//         const path = 'feedbacks'; // Corrected typo/case
//         const value = getNestedValue(item, path);
//         const result = Array.isArray(value) ? value.length : 0;
//         // console.log(`${logPrefixUtil} Accessor [feedbacksCount]: Path="${path}", Raw=${value}, Result=${result}`);
//         return result;
//     },
//     topicsCount: (item: ConferenceResponse): number => {
//         const path = 'organizations[0].topics'; // Corrected path
//         const value = getNestedValue(item, path);
//         const result = Array.isArray(value) ? value.length : 0;
//         // console.log(`${logPrefixUtil} Accessor [topicsCount]: Path="${path}", Raw=${value}, Result=${result}`);
//         return result;
//     },
//     feedbacksArray: (item: ConferenceResponse): Feedback[] => { // Assuming Feedback type exists
//         const path = 'feedbacks'; // Corrected typo/case
//         const value = getNestedValue(item, path);
//         const result = Array.isArray(value) ? value : []; // Return empty array if not found or not array
//         // console.log(`${logPrefixUtil} Accessor [feedbacksArray]: Path="${path}", Raw=${value}, Result Length=${result.length}`);
//         return result;
//     },
// };


// // --- STABLE FIELD DEFINITIONS (Template) ---
// // Define this structure ONCE, outside the function.
// // IDs updated to be more representative of the corrected paths.
// const AVAILABLE_FIELDS_TEMPLATE: DataField[] = [
//     // Dimensions
//     { id: 'organizations[0].locations[0].continent', name: 'Continent', type: 'dimension', accessor: accessors.continent },
//     { id: 'organizations[0].locations[0].country', name: 'Country', type: 'dimension', accessor: accessors.country },
//     { id: 'organizations[0].year', name: 'Year', type: 'dimension', accessor: accessors.year },
//     { id: 'organizations[0].accessType', name: 'Access Type', type: 'dimension', accessor: accessors.accessType },

//     // Measures
//     { id: 'count_records', name: 'Record Count', type: 'measure', aggregation: 'count' }, // No accessor needed for simple count aggregation
//     { id: 'count_followers', name: '# Followers', type: 'measure', accessor: accessors.followersCount, aggregation: 'sum' },
//     { id: 'count_feedbacks', name: '# Feedbacks', type: 'measure', accessor: accessors.feedbacksCount, aggregation: 'sum' },
//     { id: 'count_topics', name: '# Topics', type: 'measure', accessor: accessors.topicsCount, aggregation: 'sum' },
//     {
//         id: 'feedback_star_avg', // Changed id slightly to reflect aggregation
//         name: 'Avg. Feedback Star', // Changed name slightly
//         type: 'measure',
//         accessor: accessors.feedbacksArray, // Accessor returns the array
//         aggregation: 'average',
//         // Specify the property within the array object to average
//         // This is a custom addition, handled within aggregateData
//         avgTargetProperty: 'star'
//     },
// ];

// // --- Field Definition ---

// /**
//  * Returns the STABLE list of available fields if data exists.
//  * Logs the process.
//  * @param sampleItem A sample raw data item (only used for existence check).
//  * @returns A STABLE array of DataField objects, or an empty array.
//  */
// export const getAvailableFields = (sampleItem: ConferenceResponse | null | undefined): DataField[] => {
//     console.log(`${logPrefixUtil} getAvailableFields called. Sample exists: ${!!sampleItem}`);
//     if (!sampleItem || typeof sampleItem !== 'object') {
//         console.warn(`${logPrefixUtil} Invalid or missing sampleItem. Returning empty fields.`);
//         return []; // Return empty array if no data/sample
//     }

//     // Return the pre-defined STABLE template array
//     console.log(`${logPrefixUtil} Returning STABLE template with ${AVAILABLE_FIELDS_TEMPLATE.length} fields.`);
//     return AVAILABLE_FIELDS_TEMPLATE;
// };


// // --- Data Processing ---

// /**
//  * Aggregates data within groups based on the measure field's aggregation type.
//  * Includes detailed logging.
//  * @param groupedData Data grouped by one or more dimensions (Record<string, ConferenceResponse[]>).
//  * @param measureField The DataField object representing the measure to aggregate.
//  * @returns A record mapping group keys to aggregated numeric values.
//  */
// const aggregateData = (
//     groupedData: Record<string, ConferenceResponse[]>,
//     measureField: DataField
// ): Record<string, number> => {
//     const measureId = measureField.id;
//     const aggregationType = measureField.aggregation;
//     console.log(`${logPrefixUtil} aggregateData: Aggregating measure "${measureId}" using type "${aggregationType}" for groups: [${Object.keys(groupedData).join(', ')}]`);

//     if (!aggregationType) {
//         console.warn(`${logPrefixUtil} aggregateData: Measure field "${measureId}" is missing aggregation type. Returning 0 for all groups.`);
//         return mapValues(groupedData, () => 0);
//     }

//     const aggregatedResult: Record<string, number> = {};

//     switch (aggregationType) {
//         case 'sum':
//             console.log(`${logPrefixUtil} aggregateData: SUM aggregation for "${measureId}".`);
//             if (!measureField.accessor) {
//                 console.warn(`${logPrefixUtil} aggregateData: SUM aggregation for "${measureId}" requires an accessor. Returning 0.`);
//                 return mapValues(groupedData, () => 0);
//             }
//             // Use mapValues for conciseness, logging within accessor is key
//             return mapValues(groupedData, (group, key) => {
//                  const sum = sumBy(group, item => {
//                     const value = measureField.accessor!(item);
//                     const numValue = parseNumericValue(value, `${measureId} for SUM in group ${key}`);
//                     // console.log(`${logPrefixUtil} aggregateData: SUM - Group "${key}", Item: (see prev logs), Value: ${numValue}`);
//                     return numValue;
//                 });
//                 console.log(`${logPrefixUtil} aggregateData: SUM - Group "${key}" aggregated to: ${sum}`);
//                 return sum;
//             });


//         case 'average':
//             const avgTargetProp = (measureField as any).avgTargetProperty; // Get the specific property to average
//             console.log(`${logPrefixUtil} aggregateData: AVERAGE aggregation for "${measureId}" ${avgTargetProp ? `(targeting property "${avgTargetProp}")` : ''}.`);

//             if (!measureField.accessor) {
//                 console.warn(`${logPrefixUtil} aggregateData: AVERAGE aggregation for "${measureId}" requires an accessor. Returning 0.`);
//                 return mapValues(groupedData, () => 0);
//             }

//             return mapValues(groupedData, (group, key) => {
//                 const allValues: number[] = [];
//                 group.forEach((item, index) => {
//                     const accessedValue = measureField.accessor!(item); // This might be an array (feedbacks) or a single value

//                     if (avgTargetProp && Array.isArray(accessedValue)) {
//                         // Handle averaging a property within an array (e.g., feedback stars)
//                         const arrayValues = accessedValue
//                             .map((subItem: any, subIndex: number) => {
//                                 const nestedVal = getNestedValue(subItem, avgTargetProp);
//                                 const numVal = parseNumericValue(nestedVal, `${avgTargetProp} from ${measureId}[${subIndex}] in group ${key}`);
//                                 // console.log(`${logPrefixUtil} aggregateData: AVERAGE - Group "${key}", Item ${index}, SubItem ${subIndex}: Extracted "${avgTargetProp}" = ${numVal}`);
//                                 return numVal;
//                             })
//                             .filter(v => !isNaN(v)); // Ensure we only average valid numbers
//                         allValues.push(...arrayValues);
//                     } else if (!avgTargetProp) {
//                         // Handle averaging a direct numeric value accessed per item
//                         const numValue = parseNumericValue(accessedValue, `${measureId} for AVERAGE in group ${key}, item ${index}`);
//                         if (!isNaN(numValue)) {
//                             // console.log(`${logPrefixUtil} aggregateData: AVERAGE - Group "${key}", Item ${index}: Value = ${numValue}`);
//                             allValues.push(numValue);
//                         }
//                     } else {
//                          console.warn(`${logPrefixUtil} aggregateData: AVERAGE - Mismatch: avgTargetProp="${avgTargetProp}" but accessor for "${measureId}" did not return an array for item ${index} in group "${key}".`);
//                     }
//                 });

//                 const average = allValues.length > 0 ? sumBy(allValues) / allValues.length : 0;
//                 console.log(`${logPrefixUtil} aggregateData: AVERAGE - Group "${key}" (collected ${allValues.length} values) aggregated to: ${average}`);
//                 return average;
//             });


//         case 'count':
//             console.log(`${logPrefixUtil} aggregateData: COUNT aggregation for "${measureId}".`);
//             // Count the number of items in each group
//             return mapValues(groupedData, (group, key) => {
//                 const count = group.length;
//                 console.log(`${logPrefixUtil} aggregateData: COUNT - Group "${key}" aggregated to: ${count}`);
//                 return count;
//             });

//         default:
//             console.warn(`${logPrefixUtil} aggregateData: Unknown aggregation type: "${aggregationType}" for "${measureId}". Returning 0.`);
//             return mapValues(groupedData, () => 0);
//     }
// };


// /**
//  * Processes raw data based on the chart configuration to prepare it for ECharts.
//  * Handles grouping, aggregation, and structuring data into categories and series.
//  * Includes logging for key steps and validation.
//  * @param rawData The raw array of data items (ConferenceResponse[]).
//  * @param config The ChartConfig object defining the visualization setup.
//  * @param availableFields The list of all defined DataFields.
//  * @returns A ProcessedChartData object containing categories, series, and legend data.
//  * @throws Error if the configuration is invalid for the selected chart type.
//  */
// const processDataForChart = (
//     rawData: ConferenceResponse[], // Use specific type
//     config: ChartConfig,
//     availableFields: DataField[]
// ): ProcessedChartData => {
//     const chartType = config.chartType as ChartType;
//     console.log(`${logPrefixUtil} processDataForChart: Started for chart type "${chartType}". Raw data length: ${rawData?.length ?? 0}`);

//     if (!rawData || rawData.length === 0) {
//         console.warn(`${logPrefixUtil} processDataForChart: Raw data is empty or invalid. Returning empty results.`);
//         return { categories: [], series: [], legendData: [] };
//     }

//     const xAxisField = availableFields.find(f => f.id === config.xAxis?.fieldId);
//     const yAxisField = availableFields.find(f => f.id === config.yAxis?.fieldId);
//     const colorField = availableFields.find(f => f.id === config.color?.fieldId);
//     const sizeField = availableFields.find(f => f.id === config.size?.fieldId);

//     console.log(`${logPrefixUtil} processDataForChart: Fields - X: ${xAxisField?.id || 'N/A'}, Y: ${yAxisField?.id || 'N/A'}, Color: ${colorField?.id || 'N/A'}, Size: ${sizeField?.id || 'N/A'}`);

//     // --- Input Validation ---
//     // Added more specific error logging
//     if (!yAxisField) {
//         const errorMsg = `Chart requires a Measure field for Y-Axis/Value (Selected: ${config.yAxis?.fieldId || 'none'}).`;
//         console.error(`${logPrefixUtil} processDataForChart: ${errorMsg}`);
//         throw new Error(errorMsg);
//     }
//     if (yAxisField.type !== 'measure') {
//         const errorMsg = `Field '${yAxisField.name}' (ID: ${yAxisField.id}) selected for Y-Axis/Value is not a Measure (Type: ${yAxisField.type}).`;
//         console.error(`${logPrefixUtil} processDataForChart: ${errorMsg}`);
//         throw new Error(errorMsg);
//     }
//     if (!yAxisField.aggregation && !yAxisField.accessor && chartType !== 'scatter') {
//          const errorMsg = `Measure field '${yAxisField.name}' (ID: ${yAxisField.id}) requires an 'aggregation' type (or an accessor for scatter Y) but has none.`;
//          console.error(`${logPrefixUtil} processDataForChart: ${errorMsg}`);
//          throw new Error(errorMsg);
//     }


//     switch (chartType) {
//         case 'bar':
//         case 'line':
//             if (!xAxisField) {
//                 const errorMsg = `Bar/Line chart requires a Dimension field for X-Axis (Selected: ${config.xAxis?.fieldId || 'none'}).`;
//                 console.error(`${logPrefixUtil} processDataForChart: ${errorMsg}`);
//                 throw new Error(errorMsg);
//             }
//             if (xAxisField.type !== 'dimension') {
//                 const errorMsg = `Field '${xAxisField.name}' (ID: ${xAxisField.id}) selected for X-Axis is not a Dimension (Type: ${xAxisField.type}).`;
//                  console.error(`${logPrefixUtil} processDataForChart: ${errorMsg}`);
//                 throw new Error(errorMsg);
//             }
//             if (!xAxisField.accessor) { // Check accessor existence
//                  const errorMsg = `Internal Error: X-Axis field '${xAxisField.name}' (ID: ${xAxisField.id}) is missing its required accessor function.`;
//                  console.error(`${logPrefixUtil} processDataForChart: ${errorMsg}`);
//                 throw new Error(errorMsg);
//             }
//             break;
//         case 'pie':
//             if (!colorField) {
//                 const errorMsg = `Pie chart requires a Dimension field for Color/Slices (Selected: ${config.color?.fieldId || 'none'}).`;
//                  console.error(`${logPrefixUtil} processDataForChart: ${errorMsg}`);
//                 throw new Error(errorMsg);
//             }
//             if (colorField.type !== 'dimension') {
//                 const errorMsg = `Field '${colorField.name}' (ID: ${colorField.id}) selected for Color/Slices is not a Dimension (Type: ${colorField.type}).`;
//                  console.error(`${logPrefixUtil} processDataForChart: ${errorMsg}`);
//                 throw new Error(errorMsg);
//             }
//              if (!colorField.accessor) { // Check accessor existence
//                  const errorMsg = `Internal Error: Color field '${colorField.name}' (ID: ${colorField.id}) is missing its required accessor function.`;
//                  console.error(`${logPrefixUtil} processDataForChart: ${errorMsg}`);
//                 throw new Error(errorMsg);
//             }
//             break;
//         case 'scatter':
//             if (!xAxisField) {
//                 const errorMsg = `Scatter chart requires a field (Dimension or Measure) for X-Axis (Selected: ${config.xAxis?.fieldId || 'none'}).`;
//                  console.error(`${logPrefixUtil} processDataForChart: ${errorMsg}`);
//                 throw new Error(errorMsg);
//             }
//              if (!xAxisField.accessor) { // Check accessor existence
//                  const errorMsg = `Internal Error: X-Axis field '${xAxisField.name}' (ID: ${xAxisField.id}) is missing its required accessor function.`;
//                  console.error(`${logPrefixUtil} processDataForChart: ${errorMsg}`);
//                 throw new Error(errorMsg);
//             }
//              if (!yAxisField.accessor) { // Y needs accessor for scatter raw values
//                 const errorMsg = `Internal Error: Y-Axis field '${yAxisField.name}' (ID: ${yAxisField.id}) is missing its required accessor function for scatter plot.`;
//                 console.error(`${logPrefixUtil} processDataForChart: ${errorMsg}`);
//                 throw new Error(errorMsg);
//             }
//             if (config.size?.fieldId && !sizeField) { // Check sizeField exists if selected
//                  const errorMsg = `Selected Size field (ID: ${config.size?.fieldId}) not found in available fields.`;
//                  console.error(`${logPrefixUtil} processDataForChart: ${errorMsg}`);
//                 throw new Error(errorMsg);
//             }
//             if (sizeField && sizeField.type !== 'measure') {
//                 const errorMsg = `Field '${sizeField.name}' (ID: ${sizeField.id}) selected for Size must be a Measure (Type: ${sizeField.type}).`;
//                  console.error(`${logPrefixUtil} processDataForChart: ${errorMsg}`);
//                 throw new Error(errorMsg);
//             }
//              if (sizeField && !sizeField.accessor) { // Check size accessor existence if field selected
//                  const errorMsg = `Internal Error: Size field '${sizeField.name}' (ID: ${sizeField.id}) is missing its required accessor function.`;
//                  console.error(`${logPrefixUtil} processDataForChart: ${errorMsg}`);
//                 throw new Error(errorMsg);
//             }
//             break;
//         default:
//             const errorMsg = `Unsupported chart type: ${chartType}`;
//             console.error(`${logPrefixUtil} processDataForChart: ${errorMsg}`);
//             throw new Error(errorMsg);
//     }


//     let categories: string[] = [];
//     let series: any[] = [];
//     let legendData: string[] = [];

//     console.log(`${logPrefixUtil} processDataForChart: Starting data processing logic for ${chartType}.`);

//     // --- Bar/Line Chart Logic ---
//     if (chartType === 'bar' || chartType === 'line') {
//         // Accessors already validated above
//         const groupKeyAccessor = (item: ConferenceResponse): string => xAxisField!.accessor!(item)?.toString() ?? UNKNOWN_CATEGORY;
//         console.log(`${logPrefixUtil} processDataForChart [${chartType}]: Grouping by X-Axis: ${xAxisField!.id}`);
//         const groupedByX = groupBy(rawData, groupKeyAccessor);
//         categories = Object.keys(groupedByX).sort();
//         console.log(`${logPrefixUtil} processDataForChart [${chartType}]: Found ${categories.length} X-categories: [${categories.slice(0, 10).join(', ')}]...`);

//         if (!colorField) {
//             // Single series
//              console.log(`${logPrefixUtil} processDataForChart [${chartType}]: Single series mode. Aggregating Y-Axis (${yAxisField!.id}) by ${yAxisField!.aggregation}.`);
//             const aggregatedValues = aggregateData(groupedByX, yAxisField!);
//             const data = categories.map(cat => aggregatedValues[cat] ?? 0);

//             series.push({
//                 name: yAxisField!.name,
//                 type: chartType,
//                 data: data,
//                 emphasis: { focus: 'series' },
//                 smooth: chartType === 'line' ? true : undefined,
//             });
//             legendData.push(yAxisField!.name);
//             console.log(`${logPrefixUtil} processDataForChart [${chartType}]: Single series created. Name: ${yAxisField!.name}, Data points: ${data.length}`);

//         } else {
//             // Multiple series (grouped by color)
//              if (!colorField.accessor) {
//                  const errorMsg = `Internal Error: Color field '${colorField.name}' (ID: ${colorField.id}) is missing its required accessor function for grouping.`;
//                  console.error(`${logPrefixUtil} processDataForChart: ${errorMsg}`);
//                 throw new Error(errorMsg);
//             }
//             console.log(`${logPrefixUtil} processDataForChart [${chartType}]: Grouped series mode. Grouping by Color: ${colorField.id}`);
//             const colorKeyAccessor = (item: ConferenceResponse): string => colorField.accessor!(item)?.toString() ?? UNKNOWN_CATEGORY;
//             const groupedByColor = groupBy(rawData, colorKeyAccessor);
//             legendData = Object.keys(groupedByColor).sort();
//              console.log(`${logPrefixUtil} processDataForChart [${chartType}]: Found ${legendData.length} color groups: [${legendData.slice(0, 10).join(', ')}]...`);

//             series = legendData.map(colorValue => {
//                  console.log(`${logPrefixUtil} processDataForChart [${chartType}]: Processing color group "${colorValue}".`);
//                 const colorGroupData = groupedByColor[colorValue];
//                 // Group this subset by X-axis
//                 const groupedSubsetByX = groupBy(colorGroupData, groupKeyAccessor);
//                 // Aggregate the Y-axis measure for this specific color group
//                  console.log(`${logPrefixUtil} processDataForChart [${chartType}]: Aggregating Y-Axis (${yAxisField!.id}) for color "${colorValue}".`);
//                 const aggregatedValues = aggregateData(groupedSubsetByX, yAxisField!);
//                 // Map aggregated values to the main categories order
//                 const data = categories.map(cat => aggregatedValues[cat] ?? 0);
//                  console.log(`${logPrefixUtil} processDataForChart [${chartType}]: Series created for color "${colorValue}". Data points: ${data.length}`);

//                 return {
//                     name: colorValue,
//                     type: chartType,
//                     stack: 'total', // Stack grouped bars/lines by default
//                     emphasis: { focus: 'series' },
//                     smooth: chartType === 'line' ? true : undefined,
//                     data: data,
//                 };
//             });
//         }
//     }
//     // --- Pie Chart Logic ---
//     else if (chartType === 'pie') {
//          // Accessors already validated above
//         const groupKeyAccessor = (item: ConferenceResponse): string => colorField!.accessor!(item)?.toString() ?? UNKNOWN_CATEGORY;
//         console.log(`${logPrefixUtil} processDataForChart [${chartType}]: Grouping by Color/Slice: ${colorField!.id}`);
//         const groupedByColor = groupBy(rawData, groupKeyAccessor);
//         legendData = Object.keys(groupedByColor).sort();
//          console.log(`${logPrefixUtil} processDataForChart [${chartType}]: Found ${legendData.length} slices: [${legendData.slice(0, 10).join(', ')}]...`);

//          console.log(`${logPrefixUtil} processDataForChart [${chartType}]: Aggregating slice values by Y-Axis: ${yAxisField!.id} using ${yAxisField!.aggregation}.`);
//         const aggregatedValues = aggregateData(groupedByColor, yAxisField!);

//         const data = legendData.map(name => ({
//             name: name,
//             value: aggregatedValues[name] ?? 0,
//         }));

//         series.push({
//             name: yAxisField!.name,
//             type: 'pie',
//             radius: ['40%', '70%'],
//             avoidLabelOverlap: true,
//             itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 1 },
//             label: { show: false, position: 'center' },
//             emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
//             labelLine: { show: false },
//             data: data,
//         });
//         categories = []; // No categories for pie
//          console.log(`${logPrefixUtil} processDataForChart [${chartType}]: Pie series created. Name: ${yAxisField!.name}, Slices: ${data.length}`);
//     }
//     // --- Scatter Plot Logic ---
//     else if (chartType === 'scatter') {
//          // Accessors already validated above
//         const sizeAccessor = sizeField?.accessor;
//         const defaultSize = 8;
//         console.log(`${logPrefixUtil} processDataForChart [${chartType}]: Preparing point mapping. X: ${xAxisField!.id}, Y: ${yAxisField!.id}, Size: ${sizeField?.id ?? 'N/A'}`);

//         const mapItemToPoint = (item: ConferenceResponse, itemIndex: number): (number | string | null)[] | null => {
//             const xValRaw = xAxisField!.accessor!(item);
//             const yValRaw = yAxisField!.accessor!(item); // Scatter uses accessor directly

//             // Determine X value type
//             const finalXVal = xAxisField!.type === 'dimension'
//                 ? (xValRaw === null || xValRaw === undefined ? UNKNOWN_CATEGORY : String(xValRaw))
//                 : parseNumericValue(xValRaw, `X-value (${xAxisField!.id})`);

//             const numY = parseNumericValue(yValRaw, `Y-value (${yAxisField!.id})`);
//             const sizeVal = sizeAccessor ? parseNumericValue(sizeAccessor(item), `Size-value (${sizeField!.id})`) : defaultSize;

//             // Validate point data
//             const isXInvalid = xAxisField!.type === 'measure' && (finalXVal === null || finalXVal === undefined || isNaN(Number(finalXVal)));
//             const isYInvalid = numY === null || numY === undefined || isNaN(numY);

//             if (isXInvalid || isYInvalid) {
//                  // console.warn(`${logPrefixUtil} processDataForChart [scatter]: Skipping invalid point at index ${itemIndex}. Raw X=${xValRaw}, Raw Y=${yValRaw}. Processed X=${finalXVal}, Processed Y=${numY}`);
//                 return null; // Skip invalid points
//             }

//             const pointData: (number | string | null)[] = [finalXVal, numY];
//             if (sizeAccessor) {
//                 pointData.push(sizeVal > 0 ? sizeVal : 1); // Ensure size is positive
//             }
//             // console.log(`${logPrefixUtil} processDataForChart [scatter]: Mapped item ${itemIndex} to point: [${pointData.join(', ')}]`);
//             return pointData;
//         };

//         if (!colorField) {
//             // Simple Scatter (single series)
//             console.log(`${logPrefixUtil} processDataForChart [scatter]: Single series mode. Mapping points.`);
//             const data = rawData.map(mapItemToPoint).filter((point): point is (number | string | null)[] => point !== null);
//             console.log(`${logPrefixUtil} processDataForChart [scatter]: Mapped ${data.length} valid points.`);

//             series.push({
//                 name: yAxisField!.name, // Or a more generic name?
//                 type: 'scatter',
//                 symbolSize: sizeAccessor ? undefined : defaultSize, // Let data control size if field exists
//                 data: data,
//                 emphasis: { focus: 'series', scale: 1.1 },
//             });
//             legendData.push(yAxisField!.name);
//             console.log(`${logPrefixUtil} processDataForChart [scatter]: Single series created. Name: ${yAxisField!.name}`);

//         } else {
//             // Grouped Scatter (by color)
//             if (!colorField.accessor) {
//                  const errorMsg = `Internal Error: Color field '${colorField.name}' (ID: ${colorField.id}) is missing its required accessor function for grouping scatter plot.`;
//                  console.error(`${logPrefixUtil} processDataForChart: ${errorMsg}`);
//                 throw new Error(errorMsg);
//             }
//             console.log(`${logPrefixUtil} processDataForChart [scatter]: Grouped series mode. Grouping by Color: ${colorField.id}`);
//             const colorKeyAccessor = (item: ConferenceResponse): string => colorField.accessor!(item)?.toString() ?? UNKNOWN_CATEGORY;
//             const groupedByColor = groupBy(rawData, colorKeyAccessor);
//             legendData = Object.keys(groupedByColor).sort();
//              console.log(`${logPrefixUtil} processDataForChart [scatter]: Found ${legendData.length} color groups: [${legendData.slice(0, 10).join(', ')}]...`);

//             series = legendData.map(colorValue => {
//                 console.log(`${logPrefixUtil} processDataForChart [scatter]: Processing color group "${colorValue}".`);
//                 const colorGroupData = groupedByColor[colorValue];
//                 const data = colorGroupData.map(mapItemToPoint).filter((point): point is (number | string | null)[] => point !== null);
//                 console.log(`${logPrefixUtil} processDataForChart [scatter]: Mapped ${data.length} valid points for color "${colorValue}".`);

//                 return {
//                     name: colorValue,
//                     type: 'scatter',
//                     symbolSize: sizeAccessor ? undefined : defaultSize,
//                     data: data,
//                     emphasis: { focus: 'series', scale: 1.1 },
//                 };
//             });
//              console.log(`${logPrefixUtil} processDataForChart [scatter]: Created ${series.length} grouped series.`);
//         }

//         // Determine categories for scatter if X-axis is dimension
//         if (xAxisField!.type === 'dimension') {
//              console.log(`${logPrefixUtil} processDataForChart [scatter]: X-axis is dimension. Generating categories.`);
//             categories = [
//                 ...new Set( // Use Set for unique values directly
//                     rawData.map(item => {
//                         const value = xAxisField!.accessor!(item);
//                         return value === null || value === undefined ? UNKNOWN_CATEGORY : String(value);
//                     })
//                 )
//             ].sort(); // Sort the unique categories
//             console.log(`${logPrefixUtil} processDataForChart [scatter]: Found ${categories.length} X-categories (dimension): [${categories.slice(0, 10).join(', ')}]...`);
//         } else {
//             categories = []; // No categories needed for value-based X-axis
//             console.log(`${logPrefixUtil} processDataForChart [scatter]: X-axis is measure. No categories generated.`);
//         }
//     }

//     console.log(`${logPrefixUtil} processDataForChart: Finished. Series count: ${series.length}, Categories count: ${categories.length}, Legend items: ${legendData.length}`);
//     return { categories, series, legendData };
// };


// // --- ECharts Option Generation ---

// /**
//  * Generates the ECharts option object based on processed data and configuration.
//  * Includes logging for key steps.
//  * @param rawData The raw array of data items (needed again for processing).
//  * @param config The ChartConfig object.
//  * @param options The ChartOptions object (title, legend visibility, etc.).
//  * @param availableFields The list of all defined DataFields.
//  * @returns An EChartsOption object ready for rendering.
//  * @throws Error from processDataForChart if configuration is invalid.
//  */
// export const generateChartOption = (
//     rawData: ConferenceResponse[],
//     config: ChartConfig,
//     options: ChartOptions,
//     availableFields: DataField[]
// ): EChartsOption => {
//     console.log(`${logPrefixUtil} generateChartOption: Started. ChartType: ${config.chartType}, Title: "${options.title}"`);

//     // 1. Process Data (Errors handled within)
//     console.log(`${logPrefixUtil} generateChartOption: Calling processDataForChart...`);
//     const { categories, series, legendData } = processDataForChart(rawData, config, availableFields);
//     console.log(`${logPrefixUtil} generateChartOption: processDataForChart returned. Series: ${series.length}, Categories: ${categories?.length}, Legend: ${legendData?.length}`);

//     const xAxisField = availableFields.find(f => f.id === config.xAxis?.fieldId);
//     const yAxisField = availableFields.find(f => f.id === config.yAxis?.fieldId);
//     const sizeField = availableFields.find(f => f.id === config.size?.fieldId); // Used for scatter visualMap

//     // 2. Determine Axis Types
//     let xAxisType: 'category' | 'value' = 'category'; // Default, time/log not used here yet
//     if (config.chartType === 'scatter') {
//         // Scatter X can be measure ('value') or dimension ('category')
//         xAxisType = (xAxisField && xAxisField.type === 'measure') ? 'value' : 'category';
//     } else if (config.chartType === 'bar' || config.chartType === 'line') {
//         // Bar/Line typically use 'category' X-axis in this setup
//         xAxisType = 'category';
//     }
//     console.log(`${logPrefixUtil} generateChartOption: Determined X-Axis type: ${xAxisType}`);

//     // 3. Build Axis Options conditionally
//     let xAxisOption: EChartsOption['xAxis'] = undefined;
//     if (config.chartType !== 'pie') {
//         console.log(`${logPrefixUtil} generateChartOption: Building X-Axis configuration.`);
//         const name = xAxisField?.name ?? ''; // Default to empty if no field (shouldn't happen due to validation)
//         const nameGap = (xAxisType === 'category' && categories && categories.length > 10) ? 40 : 25;
//         const rotateLabel = (xAxisType === 'category' && categories && categories.length > 10) ? 30 : 0;
//         const intervalLabel = (xAxisType === 'category' && categories && categories.length > 20) ? 'auto' : 0;

//         xAxisOption = {
//             type: xAxisType,
//             name: name,
//             nameLocation: 'middle',
//             nameGap: nameGap,
//             nameTextStyle: { fontSize: 12, fontWeight: 'bold' },
//             axisLabel: {
//                 fontSize: 10,
//                 rotate: rotateLabel,
//                 interval: intervalLabel,
//             },
//             // Specific options based on type
//             ...(xAxisType === 'category' && {
//                 data: categories,
//                 axisTick: { alignWithLabel: true },
//                 boundaryGap: true, // Add padding for category axis
//             }),
//             ...(xAxisType === 'value' && {
//                  boundaryGap: false, // No padding for value axis (default is usually ok)
//                  // You might want scale: true here if data is sparse
//             }),
//         };
//         console.log(`${logPrefixUtil} generateChartOption: X-Axis config built:`, xAxisOption); // Log the built option
//     }

//     let yAxisOption: EChartsOption['yAxis'] = undefined;
//      if (config.chartType !== 'pie') {
//           console.log(`${logPrefixUtil} generateChartOption: Building Y-Axis configuration.`);
//           const name = yAxisField?.name ?? ''; // Default empty
//           yAxisOption = {
//             type: 'value', // Y-axis is typically 'value' for measures
//             name: name,
//             nameLocation: 'middle',
//             nameGap: 45, // Adjust gap as needed
//             nameTextStyle: { fontSize: 12, fontWeight: 'bold' },
//             axisLabel: {
//                 fontSize: 10,
//                 // formatter: '{value} units' // Example formatter
//             },
//             // scale: true, // Consider adding if data ranges vary wildly, prevents outliers squishing chart
//         };
//         console.log(`${logPrefixUtil} generateChartOption: Y-Axis config built:`, yAxisOption);
//      }


//     // 4. Build Base Option Structure
//      console.log(`${logPrefixUtil} generateChartOption: Building base ECharts option structure.`);
//     const finalOption: EChartsOption = {
//         title: {
//             text: options.title || 'Chart',
//             left: 'center',
//             textStyle: { fontSize: 16, fontWeight: 'normal' },
//         },
//         tooltip: {
//             trigger: config.chartType === 'pie' ? 'item' : 'axis', // Default trigger based on type
//             axisPointer: { type: 'cross' }, // Show crosshair for axis triggers
//             confine: true, // Keep tooltip within chart bounds
//         },
//         legend: {
//             show: options.showLegend && legendData && legendData.length > 1, // Show only if enabled AND more than 1 item
//             type: 'scroll',
//             orient: 'horizontal',
//             left: 'center',
//             bottom: 5,
//             data: legendData,
//             textStyle: { fontSize: 10 },
//             itemWidth: 15,
//             itemHeight: 10,
//         },
//         toolbox: {
//             show: options.showToolbox,
//             orient: 'vertical',
//             left: 'right',
//             top: 'center',
//             itemSize: 14,
//             feature: {
//                  magicType: {
//                     show: ['bar', 'line'].includes(config.chartType), // Only show for bar/line
//                     type: ['line', 'bar', 'stack'],
//                     title: { line: 'Line', bar: 'Bar', stack: 'Stack', tiled: 'Tiled (Unstack)' }
//                 },
//                 restore: { title: 'Restore' },
//                 saveAsImage: {
//                     name: options.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'chart',
//                     type: 'png',
//                     pixelRatio: 2,
//                     title: 'Save PNG'
//                 },
//                 dataView: { readOnly: true, title: 'Data View', lang: ['Data View', 'Close', 'Refresh'] },
//             },
//         },
//         grid: { // Initial grid settings, might be adjusted later
//             left: '3%',
//             right: '8%', // More space for toolbox
//             bottom: '5%', // Base padding
//             top: '15%', // For title
//             containLabel: true
//         },
//         xAxis: xAxisOption,
//         yAxis: yAxisOption,
//         series: series,
//         // visualMap: [], // Placeholder, added conditionally
//         // dataZoom: [], // Placeholder, added conditionally
//     };

//     // 5. Apply Chart-Specific Overrides & Enhancements

//     // Adjust grid based on legend visibility (do this before dataZoom adjustments)
//     if (finalOption.grid && !Array.isArray(finalOption.grid) && finalOption.legend?.show) {
//         console.log(`${logPrefixUtil} generateChartOption: Adjusting grid bottom padding for legend.`);
//         finalOption.grid.bottom = '10%'; // Increase bottom padding if legend is shown
//     }


//     // Pie Chart Specifics
//     if (config.chartType === 'pie') {
//          console.log(`${logPrefixUtil} generateChartOption: Applying Pie chart specific options.`);
//         // finalOption.xAxis = undefined; // Already handled by conditional creation
//         // finalOption.yAxis = undefined;
//         finalOption.grid = undefined; // Remove grid for Pie
//         // Pie tooltip formatter
//         finalOption.tooltip = {
//             ...finalOption.tooltip,
//             trigger: 'item',
//             formatter: '{a} <br/>{b} : {c} ({d}%)' // Series Name, Item Name, Value, Percentage
//         };
//          console.log(`${logPrefixUtil} generateChartOption: Removed axis/grid, set Pie tooltip formatter.`);
//     }

//     // Scatter Chart Specifics
//     if (config.chartType === 'scatter') {
//         console.log(`${logPrefixUtil} generateChartOption: Applying Scatter chart specific options.`);
//         // Add visualMap for Size dimension if applicable
//         if (sizeField && series && series.length > 0) {
//             console.log(`${logPrefixUtil} generateChartOption: Size field (${sizeField.id}) detected. Calculating min/max for visualMap.`);
//             let minSize = Infinity, maxSize = -Infinity;
//             let sizeDataExists = false;

//             series.forEach(s => {
//                 if (s.type === 'scatter' && Array.isArray(s.data)) {
//                     s.data.forEach((point: (number | string | null)[]) => {
//                         // Size is expected at index 2 if present
//                         if (point && point.length > 2 && typeof point[2] === 'number' && !isNaN(point[2])) {
//                             sizeDataExists = true;
//                             minSize = Math.min(minSize, point[2]);
//                             maxSize = Math.max(maxSize, point[2]);
//                         }
//                     });
//                 }
//             });

//             if (sizeDataExists && isFinite(minSize) && isFinite(maxSize) && maxSize > minSize) {
//                  console.log(`${logPrefixUtil} generateChartOption: Adding visualMap for size. Range: ${minSize}-${maxSize}`);
//                 finalOption.visualMap = [{ // Use array for potential multiple visualMaps later
//                     type: 'continuous',
//                     dimension: 2, // Corresponds to the 3rd element (index 2) in scatter data [x, y, size]
//                     min: minSize,
//                     max: maxSize,
//                     itemWidth: 15,
//                     itemHeight: 80,
//                     text: [`Max: ${maxSize.toFixed(1)}`, `Min: ${minSize.toFixed(1)}`],
//                     textGap: 5,
//                     textStyle: { fontSize: 10 },
//                     calculable: true,
//                     realtime: false, // Usually false is better performance unless needed
//                     inRange: {
//                         symbolSize: [5, 30] // Map data range to visual size range
//                     },
//                     orient: 'vertical',
//                     left: 10, // Position it left
//                     bottom: '15%' // Position above potential dataZoom
//                 }];
//             } else if (sizeDataExists) {
//                 console.warn(`${logPrefixUtil} generateChartOption: Size field selected, but valid min/max range not found or min equals max (${minSize}-${maxSize}). Skipping visualMap.`);
//             } else {
//                  console.log(`${logPrefixUtil} generateChartOption: Size field selected, but no valid size data found in series. Skipping visualMap.`);
//             }
//         }

//         // Scatter tooltip formatter
//         finalOption.tooltip = {
//             ...finalOption.tooltip,
//             trigger: 'item', // Tooltip per point
//             formatter: (params: any) => {
//                  // console.log("Tooltip params:", params); // Debug tooltip data
//                 const seriesName = params.seriesName ?? 'Point';
//                 const data = params.data || [];
//                 const xName = xAxisField?.name ?? 'X';
//                 const yName = yAxisField?.name ?? 'Y';
//                 let tooltipHtml = `${seriesName}<br/>`;
//                 // Access data array elements safely
//                 if (data.length > 0) tooltipHtml += `${xName}: ${data[0]}<br/>`;
//                 if (data.length > 1) tooltipHtml += `${yName}: ${data[1]}<br/>`;
//                 if (sizeField && data.length > 2) {
//                     tooltipHtml += `${sizeField.name}: ${data[2]}<br/>`;
//                 }
//                 return tooltipHtml;
//             }
//         };
//          console.log(`${logPrefixUtil} generateChartOption: Set Scatter visualMap (if applicable) and tooltip formatter.`);
//     }

//     // Add DataZoom for applicable charts
//     const needsDataZoom = (xAxisType === 'value' && series?.[0]?.data?.length > 20) || // Value axis with many points
//                           (xAxisType === 'category' && categories && categories.length > 20); // Category axis with many categories

//     if (config.chartType !== 'pie' && needsDataZoom) {
//         console.log(`${logPrefixUtil} generateChartOption: Adding dataZoom controls for X-axis.`);
//         finalOption.dataZoom = [
//             {
//                 type: 'slider', // Slider control at the bottom
//                 xAxisIndex: 0, // Control the first X axis
//                 filterMode: 'filter', // 'filter' is generally recommended over 'weakFilter'
//                 bottom: 15, // Position below legend
//                 height: 15,
//                 start: 0, // Initial zoom window start (0%)
//                 end: 100 // Initial zoom window end (100%) - Show all initially
//             },
//             {
//                 type: 'inside', // Allow zooming with mouse wheel/touch
//                 xAxisIndex: 0,
//                 filterMode: 'filter',
//                  start: 0,
//                  end: 100
//             }
//         ];

//         // Adjust grid bottom padding *again* if dataZoom is added
//         if (finalOption.grid && !Array.isArray(finalOption.grid)) {
//              console.log(`${logPrefixUtil} generateChartOption: Adjusting grid bottom padding for dataZoom.`);
//              // Determine padding based on legend AND zoom presence
//              const legendShown = finalOption.legend?.show;
//              finalOption.grid.bottom = legendShown ? '15%' : '12%'; // Need more space if both legend and zoom are there
//         }
//     }


//     console.log(`${logPrefixUtil} generateChartOption: Final ECharts option constructed.`);
//     // For deep debugging:
//     // console.log(logPrefixUtil + " Final Option:", JSON.stringify(finalOption, null, 2));

//     return finalOption;
// };