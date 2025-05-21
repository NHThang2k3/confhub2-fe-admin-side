// src/app/[locale]/dashboard/logAnalysis/utils/chartUtils.ts
// (Or wherever your chartUtils.ts is located)

import { EChartsOption } from 'echarts'; // Make sure this import is correct

// --- BarChartData type (already present) ---
export type BarChartData = { labels: string[]; values: number[] };


// Helper function to create Pie chart options (Doughnut)
export const getPieChartOption = (
    chartTitle: string, // Renamed from 'title'
    data: Array<{ name: string; value: number }>,
    colors?: string[],
    subtext?: string // Thêm tham số subtext

): EChartsOption => { // Explicitly type the return value
    return {
        title: {
            text: chartTitle,
            left: 'center',
            top: 10,
            textStyle: {
                fontSize: 16,
                fontWeight: 'normal' as const, // Use 'as const' for literal type
                color: '#333'
            },
            subtext: subtext, // Sử dụng subtext ở đây
            subtextStyle: { fontSize: 12, color: '#666' } // Điều chỉnh style
        },
        tooltip: {
            trigger: 'item',
            formatter: '{b} : {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 10,
            top: 'middle',
            itemGap: 8,
            data: data.map(item => item.name),
            textStyle: {
                fontSize: 12 // This is a number, which is good
            }
        },
        series: [
            {
                name: chartTitle,
                type: 'pie',
                radius: ['50%', '75%'],
                center: ['65%', '55%'],
                avoidLabelOverlap: true,
                itemStyle: {
                    borderRadius: 8,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 18, // Changed from '18' (string) to 18 (number)
                        fontWeight: 'bold' as const, // 'bold' is also a valid ZRFontWeight
                        formatter: '{b}\n{c} ({d}%)'
                    },
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                labelLine: {
                    show: false
                },
                data: data,
                color: colors || ['#5470c6', '#ee6666', '#fccb67', '#91cc75', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']
            }
        ]
    };
};

// Helper function to create Bar chart options
export const getBarChartOption = (
    chartTitle: string, // Renamed from 'title'
    xAxisData: string[],
    seriesData: number[],
    seriesName: string,
    color?: string
): EChartsOption => { // Explicitly type the return value
    return {
        title: {
            text: chartTitle,
            left: 'center',
            top: 10,
            textStyle: {
                fontSize: 16,
                fontWeight: 'normal' as const, // Use 'as const' for literal type
                color: '#333'
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                data: xAxisData,
                axisTick: {
                    alignWithLabel: true
                },
                axisLabel: {
                    interval: 0,
                    rotate: 30,
                    fontSize: 11,
                    color: '#555'
                },
                axisLine: {
                    lineStyle: {
                        color: '#ccc'
                    }
                }
            }
        ],
        yAxis: [
            {
                type: 'value',
                axisLabel: {
                    fontSize: 11,
                    color: '#555'
                },
                splitLine: {
                    lineStyle: {
                        type: 'dashed',
                        color: '#eee'
                    }
                }
            }
        ],
        series: [
            {
                name: seriesName,
                type: 'bar',
                barWidth: '60%',
                data: seriesData,
                itemStyle: {
                    color: color || '#5470c6',
                    borderRadius: [4, 4, 0, 0]
                },
                emphasis: {
                    itemStyle: {
                        color: '#3b5aa0'
                    }
                }
            }
        ]
    };
};

// transformRecordForBarChart (remains the same)
export const transformRecordForBarChart = (
    record: Record<string, number> | undefined,
    limit: number = 10,
    sortByValue: boolean = true
): { labels: string[]; values: number[] } => {
    if (!record || Object.keys(record).length === 0) return { labels: [], values: [] };

    let entries = Object.entries(record);

    if (sortByValue) {
        entries.sort(([, a], [, b]) => b - a);
    } else {
        entries.sort(([a], [b]) => a.localeCompare(b));
    }

    if (limit > 0 && entries.length > limit) {
        entries = entries.slice(0, limit);
    }

    return {
        labels: entries.map(([key]) => key),
        values: entries.map(([, value]) => value)
    };
};