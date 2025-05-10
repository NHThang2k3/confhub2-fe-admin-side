// src/models/visualization.ts

export type FieldType = 'dimension' | 'measure';

export interface DataField {
  id: string; // Unique ID, e.g., 'location.continent', 'count_conferences'
  name: string; // Display name, e.g., 'Continent', 'Number of Conferences'
  type: FieldType;
  // Optional: Function to extract value from raw data item
  accessor?: (dataItem: any) => string | number | null | string[];
  // Optional: Aggregation function for measures (e.g., 'count', 'average', 'sum')
  aggregation?: 'count' | 'average' | 'sum' | 'none'; // 'none' for pre-aggregated or direct values
}

export type ChartType = 'none'| 'bar' | 'line' | 'pie' | 'scatter'; // Add more as needed

export interface ChartAxisConfig {
  fieldId: string | null; // ID of the field dropped here
}

export interface ChartColorConfig {
  fieldId: string | null; // ID of the field dropped for color encoding
}

export interface ChartSizeConfig {
    fieldId: string | null; // ID of the field dropped for size encoding (e.g., scatter plot bubble size)
}


export interface ChartConfig {
  chartType: ChartType;
  xAxis: ChartAxisConfig;
  yAxis: ChartAxisConfig;
  color: ChartColorConfig;
  size?: ChartSizeConfig; // For charts like scatter
  // Add other potential drop zones like 'tooltipFields', 'filters', etc.
}

export interface ChartOptions {
  title: string;
  showLegend: boolean;
  showToolbox: boolean; // ECharts built-in toolbox (zoom, save, etc.)
  // Add more specific ECharts options (colors, axis labels, etc.)
}

// Example structure for processed data ready for ECharts
export interface ProcessedChartData {
  categories?: string[]; // For bar/line X-axis
  series: any[];       // ECharts series data
  legendData?: string[]; // For pie/grouped charts
}

export const AVAILABLE_CHART_TYPES: { id: ChartType, name: string }[] = [
    { id: 'none', name: 'Select Chart Type' },
    { id: 'bar', name: 'Bar Chart' },
    { id: 'line', name: 'Line Chart' },
    { id: 'pie', name: 'Pie Chart' },
    { id: 'scatter', name: 'Scatter Plot' },
];