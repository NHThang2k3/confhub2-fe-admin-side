// src/app/[locale]/dashboard/logAnalysis/utils/chartUtils.ts

import { EChartsOption } from 'echarts'; // Import SeriesOption nếu bạn muốn ép kiểu rõ ràng cho series
import { CallbackDataParams } from 'echarts/types/dist/shared'; // Import CallbackDataParams để sử dụng trong function color

export interface BarChartData { // Đảm bảo export
    labels: string[];
    values: number[];
}

export interface PieChartItem { // Đảm bảo export
  name: string;
  value: number;
}

// Helper function to create Pie chart options (Doughnut)
export const getPieChartOption = (
    chartTitle: string,
    data: PieChartItem[], // Sử dụng PieChartItem[]
    colors?: string[],
    subtext?: string
): EChartsOption => {
    return {
        title: {
            text: chartTitle,
            left: 'center',
            top: 10,
            textStyle: {
                fontSize: 16,
                fontWeight: 'normal',
                color: '#333'
            },
            subtext: subtext,
            subtextStyle: { fontSize: 12, color: '#666' }
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
                fontSize: 11 // Giảm kích thước font một chút
            }
        },
        series: [
            {
                name: chartTitle,
                type: 'pie',
                radius: ['50%', '75%'], // Doughnut
                center: ['65%', '55%'], // Điều chỉnh vị trí để legend không bị che
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
                        fontSize: 16, // Giảm kích thước font một chút
                        fontWeight: 'bold',
                        formatter: '{b}\n{c}' // Bỏ % để tránh quá dài
                    },
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.3)' // Giảm độ mờ
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


// --- HOÀN CHỈNH getBarChartOption ---
export const getBarChartOption = (
    chartTitle: string,
    xAxisData: string[],
    seriesData: number[],
    seriesName: string,
    // color có thể là:
    // 1. string: một màu duy nhất cho tất cả các thanh
    // 2. string[]: một mảng màu, mỗi màu cho một thanh (lặp lại nếu mảng ngắn hơn dữ liệu)
    // 3. function: một hàm callback để xác định màu cho từng thanh dựa trên dataIndex hoặc giá trị
    // 4. undefined: sử dụng màu mặc định của ECharts hoặc màu global của series
    colorOption?: string | string[] | ((params: CallbackDataParams) => string)
): EChartsOption => {
    let itemStyleColor: string | ((params: CallbackDataParams) => string) | undefined;

    if (typeof colorOption === 'string') {
        // Một màu duy nhất cho cả series
        itemStyleColor = colorOption;
    } else if (Array.isArray(colorOption)) {
        // Mảng màu, áp dụng tuần tự cho các thanh
        itemStyleColor = (params: CallbackDataParams): string => {
            // params.dataIndex là chỉ số của data item (thanh) hiện tại
            return colorOption[params.dataIndex % colorOption.length] || '#5470c6'; // Màu mặc định nếu mảng màu rỗng
        };
    } else if (typeof colorOption === 'function') {
        // Sử dụng trực tiếp hàm callback được cung cấp
        itemStyleColor = colorOption;
    } else {
        // Mặc định nếu không có colorOption hoặc không khớp các kiểu trên
        itemStyleColor = '#5470c6';
    }

    return {
        title: {
            text: chartTitle,
            left: 'center',
            top: 10,
            textStyle: {
                fontSize: 16,
                fontWeight: 'normal',
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
            bottom: '3%', // Mặc định, có thể cần tăng nếu label quá dài
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
                    interval: 0, // Hiển thị tất cả các label
                    rotate: xAxisData.length > 7 ? 45 : (xAxisData.length > 4 ? 30 : 0), // Xoay label nếu nhiều
                    fontSize: 10,
                    color: '#555',
                    overflow: 'truncate', // Cắt bớt nếu quá dài
                    width: xAxisData.length > 10 ? 60 : 80, // Giới hạn chiều rộng (tùy chỉnh)
                    // Hoặc sử dụng formatter để xuống dòng nếu cần thiết phức tạp hơn
                    // formatter: function (value: string) {
                    //   return value.replace(/(.{10})/g, '$1\n'); // Ví dụ xuống dòng sau 10 ký tự
                    // }
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
                barWidth: '60%', // Hoặc để ECharts tự tính
                data: seriesData,
                itemStyle: {
                    color: itemStyleColor,
                    borderRadius: [4, 4, 0, 0] // Bo góc trên của thanh
                },
                emphasis: { // Hiệu ứng khi hover
                    focus: 'series', // Làm nổi bật cả series hoặc 'self' chỉ item đó
                    itemStyle: {
                        // ECharts thường tự làm tối/sáng màu một chút khi hover
                        // Bạn có thể ghi đè nếu muốn màu cụ thể
                        // shadowBlur: 10,
                        // shadowColor: 'rgba(0,0,0,0.3)'
                    }
                }
            }
        ]
        // Có thể ép kiểu ở đây nếu TypeScript vẫn báo lỗi, mặc dù thường không cần thiết
        // series: [ { ... } ] as SeriesOption[]
    };
};

// Đổi tên hàm để nhất quán
export const transformRecordToBarChart = (
    record: Record<string, number> | undefined | null, // Cho phép null
    limit: number = 0, // Mặc định 0 để lấy tất cả
    sortByValue: boolean = true
): BarChartData => {
    if (!record || Object.keys(record).length === 0) return { labels: [], values: [] };

    let entries = Object.entries(record);

    if (sortByValue) {
        entries.sort(([, a], [, b]) => b - a); // Sắp xếp giảm dần
    } else {
        // Sắp xếp theo key nếu không sort theo value (tùy chọn, có thể bỏ nếu muốn giữ thứ tự gốc)
        // entries.sort(([aKey], [bKey]) => aKey.localeCompare(bKey));
    }

    if (limit > 0 && entries.length > limit) {
        entries = entries.slice(0, limit);
    }

    return {
        labels: entries.map(([key]) => key),
        values: entries.map(([, value]) => value)
    };
};

// Hàm mới để chuyển đổi một object { key: value } thành [{ name: key, value: value }] cho PieChart
export const transformObjectToPieChartData = (
  data: Record<string, number> | undefined | null, // Cho phép null
  valueThreshold: number = 0
): PieChartItem[] => {
  if (!data) {
    return [];
  }
  return Object.entries(data)
    .map(([name, value]) => ({ name, value: value || 0 })) // Đảm bảo value là number
    .filter(item => item.value > valueThreshold)
    .sort((a, b) => b.value - a.value);
};