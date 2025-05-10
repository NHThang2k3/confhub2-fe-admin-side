// src/types/echarts.ts
import type {
    EChartsType as CoreEChartsType,
    EChartsCoreOption as CoreEChartsOption
} from 'echarts/core';

export type EChartsType = CoreEChartsType;
// Optionally rename for consistency within your app:
export type EChartsOption = CoreEChartsOption;
