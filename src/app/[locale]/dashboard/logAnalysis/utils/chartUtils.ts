// --- Helper Functions cho Biểu đồ (Giữ nguyên hoặc cải tiến nhẹ) ---
export type BarChartData = { labels: string[]; values: number[] };



// Helper function to create Pie chart options (Doughnut)
export const getPieChartOption = (title: string, data: Array<{ name: string; value: number }>, colors?: string[]) => {
    return {
        title: {
            text: title,
            left: 'center',
            top: 10,
            textStyle: {
                fontSize: 16,
                fontWeight: 'normal',
                color: '#333' // Màu chữ tiêu đề
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: '{b} : {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 10, // Tăng khoảng cách từ lề trái
            top: 'middle',
            itemGap: 8, // Khoảng cách giữa các mục legend
            data: data.map(item => item.name),
            textStyle: {
                fontSize: 12 // Kích thước chữ legend nhỏ hơn
            }
        },
        series: [
            {
                name: title,
                type: 'pie',
                radius: ['50%', '75%'], // Điều chỉnh độ dày doughnut
                center: ['65%', '55%'], // Điều chỉnh vị trí để không bị che bởi legend
                avoidLabelOverlap: true,
                itemStyle: {
                    borderRadius: 8, // Bo tròn mạnh hơn
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false, // Vẫn ẩn label trên slice
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '18',
                        fontWeight: 'bold',
                        formatter: '{b}\n{c} ({d}%)' // Hiển thị cả tên và giá trị khi hover
                    },
                    itemStyle: { // Hiệu ứng khi hover
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                labelLine: {
                    show: false
                },
                data: data,
                // Sử dụng màu được truyền vào hoặc màu mặc định
                color: colors || ['#5470c6', '#ee6666', '#fccb67', '#91cc75', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc']
            }
        ]
    };
};

// Helper function to create Bar chart options
export const getBarChartOption = (title: string, xAxisData: string[], seriesData: number[], seriesName: string, color?: string) => {
    return {
        title: {
            text: title,
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
                    rotate: 30, // Xoay label nếu cần
                    fontSize: 11, // Giảm kích thước font trục X
                    color: '#555'
                },
                axisLine: {
                    lineStyle: {
                        color: '#ccc' // Màu trục X
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
                splitLine: { // Đường lưới ngang mờ hơn
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
                    color: color || '#5470c6', // Màu cột
                    borderRadius: [4, 4, 0, 0] // Bo tròn góc trên của cột
                },
                emphasis: { // Hiệu ứng hover cột
                    itemStyle: {
                        color: '#3b5aa0' // Màu đậm hơn khi hover
                    }
                }
            }
        ]
    };
};

// Helper to transform object record to arrays for Bar chart
export const transformRecordForBarChart = (
    record: Record<string, number> | undefined,
    limit: number = 10,
    sortByValue: boolean = true
): { labels: string[]; values: number[] } => {
    if (!record || Object.keys(record).length === 0) return { labels: [], values: [] };

    let entries = Object.entries(record);

    if (sortByValue) {
        entries.sort(([, a], [, b]) => b - a); // Sort descending by value
    } else {
        entries.sort(([a], [b]) => a.localeCompare(b)); // Sort ascending by key/label
    }

    if (limit > 0 && entries.length > limit) {
        entries = entries.slice(0, limit);
    }

    return {
        labels: entries.map(([key]) => key),
        values: entries.map(([, value]) => value)
    };
};