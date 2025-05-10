// src/components/IntroduceVisualization.tsx

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/src/navigation'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts/core'
import { BarChart, PieChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
  // MarkLineComponent // Không cần thiết nếu không dùng
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsOption } from 'echarts'

// Register necessary components (Giữ nguyên)
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  // MarkLineComponent, // Chỉ đăng ký nếu dùng
  BarChart,
  PieChart,
  LineChart,
  CanvasRenderer
])

// --- Định nghĩa interface và dữ liệu mẫu giữ nguyên ---
interface ContinentData {
  id: string // ID gốc (ví dụ: 'northAmerica')
  value: number
  colorHex: string
}

const sampleDataSets: ContinentData[][] = [
  // Giữ nguyên dữ liệu
  [
    { id: 'asia', value: 45, colorHex: '#3b82f6' },
    { id: 'europe', value: 38, colorHex: '#22c55e' },
    { id: 'northAmerica', value: 28, colorHex: '#ef4444' },
    { id: 'southAmerica', value: 15, colorHex: '#eab308' },
    { id: 'africa', value: 12, colorHex: '#a855f7' },
    { id: 'oceania', value: 8, colorHex: '#ec4899' }
  ],
  [
    { id: 'asia', value: 50, colorHex: '#3b82f6' },
    { id: 'europe', value: 35, colorHex: '#22c55e' },
    { id: 'northAmerica', value: 32, colorHex: '#ef4444' },
    { id: 'southAmerica', value: 18, colorHex: '#eab308' },
    { id: 'africa', value: 10, colorHex: '#a855f7' },
    { id: 'oceania', value: 7, colorHex: '#ec4899' }
  ],
  [
    { id: 'asia', value: 40, colorHex: '#3b82f6' },
    { id: 'europe', value: 42, colorHex: '#22c55e' },
    { id: 'northAmerica', value: 25, colorHex: '#ef4444' },
    { id: 'southAmerica', value: 20, colorHex: '#eab308' },
    { id: 'africa', value: 15, colorHex: '#a855f7' },
    { id: 'oceania', value: 9, colorHex: '#ec4899' }
  ]
]

const chartTypes: ('bar' | 'pie' | 'line')[] = ['bar', 'pie', 'line']

// --- Component chính sử dụng ECharts ---
const IntroduceVisualization: React.FC = () => {
  const t = useTranslations('IntroduceVisualization')

  const [currentDataSetIndex, setCurrentDataSetIndex] = useState(0)
  const [currentChartTypeIndex, setCurrentChartTypeIndex] = useState(0)
  const [isClient, setIsClient] = useState(false)

  const chartData = useMemo(
    () => sampleDataSets[currentDataSetIndex],
    [currentDataSetIndex]
  )
  const chartType = useMemo(
    () => chartTypes[currentChartTypeIndex],
    [currentChartTypeIndex]
  )

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentChartTypeIndex(prevIndex => {
        const nextTypeIndex = (prevIndex + 1) % chartTypes.length
        // Chỉ chuyển dataset khi hoàn thành 1 vòng lặp qua các loại biểu đồ
        if (nextTypeIndex === 0) {
          setCurrentDataSetIndex(
            prevDataIndex => (prevDataIndex + 1) % sampleDataSets.length
          )
        }
        return nextTypeIndex
      })
    }, 3000) // Giữ nguyên interval 3 giây

    return () => clearInterval(intervalId)
  }, [])

  // ----- Helper Function cho định dạng tên lục địa (Giữ nguyên) -----
  // Hàm này nhận ID gốc và dịch
  const formatAxisTick = (tickItem: string): string => {
    try {
      // Sử dụng tên id làm key dịch
      return t(`continent.${tickItem}`)
    } catch (e) {
      // Log cảnh báo rõ ràng hơn
      console.warn(
        `next-intl MISSING_MESSAGE: Could not resolve IntroduceVisualization.continent.${tickItem}. Check your messages file.`,
        e
      )
      return tickItem // Fallback về id nếu không có bản dịch
    }
  }

  // ----- Hàm tạo ECharts Option -----
  const getEchartsOption = (): EChartsOption => {
    const baseOption: EChartsOption = {
      grid: {
        left: '3%',
        right: '4%',
        bottom: chartType === 'pie' ? '15%' : '18%',
        top: '5%',
        containLabel: true
      },
      tooltip: {
        trigger: chartType === 'pie' ? 'item' : 'axis',
        // --- START: MODIFIED TOOLTIP FORMATTER ---
        formatter: (params: any) => {
          // Echarts formatter nhận params khác Recharts.
          // Đối với trigger='axis', params là mảng. Đối với trigger='item', params là đối tượng.
          const param = Array.isArray(params) ? params[0] : params
          if (!param || param.value === undefined || param.value === null) {
            return ''
          }

          // Lấy ID gốc từ data.id đã thêm vào series data points
          const originalId = param.data?.id
          // Sử dụng ID gốc để dịch
          const continentName = originalId
            ? t(`continent.${originalId}`)
            : param.name || t('unknown')

          const value = param.value
          const color = param.color || param.data?.itemStyle?.color // Lấy màu từ param.color (axis) hoặc param.data.itemStyle.color (item)

          // Tạo HTML tooltip đơn giản
          return `
            <div class='rounded border border-gray-20 bg-white-pure p-2 text-sm shadow-lg backdrop-blur-sm'>
              <p class='font-semibold'>${continentName}</p>
              <p style='color: ${color}'>
                <span style='display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color};'></span>
                ${t('valueLabel')}: ${value}
              </p>
            </div>
          `
        },
        // --- END: MODIFIED TOOLTIP FORMATTER ---
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        padding: 0
      },
      animationDuration: 500,
      animationEasing: 'cubicInOut'
    }

    // --- Cấu hình cụ thể cho từng loại biểu đồ ---
    switch (chartType) {
      case 'bar': {
        const categories = chartData.map(item => formatAxisTick(item.id))
        // --- START: MODIFIED BAR SERIES DATA ---
        const seriesData = chartData.map(item => ({
          value: item.value,
          id: item.id, // Thêm ID gốc vào data point
          itemStyle: {
            color: item.colorHex,
            borderRadius: [4, 4, 0, 0]
          }
        }))
        // --- END: MODIFIED BAR SERIES DATA ---

        return {
          ...baseOption,
          xAxis: {
            type: 'category',
            data: categories, // Trục X hiển thị tên đã dịch
            axisLabel: {
              interval: 0,
              rotate: -30,
              fontSize: 10,
              color: '#6b7280',
              margin: 12
            },
            axisTick: {
              alignWithLabel: true
            }
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              fontSize: 10,
              color: '#6b7280'
            },
            splitLine: {
              lineStyle: {
                type: 'dashed',
                color: '#e5e7eb'
              }
            }
          },
          series: [
            {
              name: t('valueLabel'),
              type: 'bar',
              data: seriesData, // Dữ liệu series chứa cả value và id
              barWidth: '60%'
            }
          ]
        }
      }

      case 'pie': {
        const pieData = chartData.map(item => ({
          name: formatAxisTick(item.id), // Tên hiển thị (đã dịch)
          value: item.value,
          id: item.id, // Giữ lại id gốc - Cái này bạn đã làm đúng
          itemStyle: {
            color: item.colorHex,
            borderColor: item.colorHex,
            borderWidth: 1
          }
        }))

        return {
          ...baseOption,
          tooltip: {
            // Override tooltip trigger for pie
            trigger: 'item',
            formatter: !Array.isArray(baseOption.tooltip) // Đảm bảo lấy đúng formatter đã sửa
              ? baseOption.tooltip?.formatter
              : undefined
          },
          legend: {
            type: 'scroll',
            orient: 'horizontal',
            bottom: '2%',
            left: 'center',
            itemWidth: 10,
            itemHeight: 10,
            icon: 'circle',
            textStyle: {
              fontSize: 10,
              color: 'var(--primary)'
            },
            data: pieData.map(item => ({
              // ECharts lấy tên legend từ series.data.name
              name: item.name,
              itemStyle: { color: item.itemStyle.color }
            }))
          },
          series: [
            {
              name: t('valueLabel'),
              type: 'pie',
              radius: ['40%', '70%'],
              center: ['50%', '45%'],
              avoidLabelOverlap: true,
              label: {
                show: false
              },
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.3)'
                }
              },
              labelLine: {
                show: false
              },
              data: pieData, // Dữ liệu series chứa name (đã dịch) và id (gốc)
              itemStyle: {
                borderWidth: 2,
                borderColor: '#ffffff'
              }
            }
          ]
        }
      }

      case 'line': {
        const categories = chartData.map(item => formatAxisTick(item.id))
        // --- START: MODIFIED LINE SERIES DATA ---
        // Line chart có thể dùng mảng giá trị, nhưng dùng mảng object tốt hơn cho tooltip
        const seriesData = chartData.map(item => ({
          value: item.value,
          id: item.id, // Thêm ID gốc vào data point
          itemStyle: {
            // Thêm itemStyle để màu điểm có thể lấy từ đây
            color: item.colorHex
          }
        }))
        // --- END: MODIFIED LINE SERIES DATA ---

        return {
          ...baseOption,
          xAxis: {
            type: 'category',
            data: categories, // Trục X hiển thị tên đã dịch
            axisLabel: {
              interval: 0,
              rotate: -30,
              fontSize: 10,
              color: '#6b7280',
              margin: 12
            },
            axisTick: {
              alignWithLabel: true
            }
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              fontSize: 10,
              color: '#6b7280'
            },
            splitLine: {
              lineStyle: {
                type: 'dashed',
                color: '#e5e7eb'
              }
            }
          },
          series: [
            {
              name: t('valueLabel'),
              type: 'line',
              smooth: true,
              data: seriesData, // Dữ liệu series chứa cả value và id
              showSymbol: true,
              symbol: 'circle',
              symbolSize: 6,
              lineStyle: {
                color: '#3b82f6', // Có thể lấy màu từ itemStyle nếu muốn mỗi điểm/đường 1 màu
                width: 2
              },
              itemStyle: {
                // Style cho điểm (dot) - sử dụng màu từ data point nếu có
                color: (params: any) =>
                  params.data?.itemStyle?.color || '#3b82f6', // Sử dụng màu từ data point nếu có, fallback màu mặc định
                borderColor: '#ffffff',
                borderWidth: 1
              },
              emphasis: {
                focus: 'series',
                itemStyle: {
                  // symbolSize: 8,
                  borderWidth: 2,
                  borderColor: '#ffffff'
                }
              }
            }
          ]
        }
      }
      default:
        return baseOption
    }
  }

  // --- Render biểu đồ (Giữ nguyên) ---
  const renderChart = () => {
    if (!isClient) {
      return (
        <div className='flex h-full items-center justify-center '>
          {t('Loading_Chart')}
        </div>
      )
    }

    const option = getEchartsOption()

    return (
      <div
        key={chartType + '-' + currentDataSetIndex} // Thêm dataset index vào key để đảm bảo re-render khi dataset thay đổi
        className='animate-fade-simple h-full w-full'
      >
        <ReactECharts
          echarts={echarts}
          option={option}
          notMerge={true}
          lazyUpdate={true}
          style={{ height: '100%', width: '100%' }}
        />
      </div>
    )
  }

  // Lấy tên biểu đồ đã dịch (Giữ nguyên)
  const translatedChartType = t(
    chartType === 'bar'
      ? 'chartTypeBar'
      : chartType === 'pie'
        ? 'chartTypePie'
        : 'chartTypeLine'
  )

  return (
    <section
      aria-labelledby='visualization-intro-heading'
      className='m-0 rounded-xl border border-gray-20 bg-gray-5 p-6 shadow-lg  md:m-12 md:p-4'
    >
      {/* --- CSS Keyframes cho fade (Giữ nguyên) --- */}
      <style>{`
            @keyframes fadeSimple {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-fade-simple {
                 animation: fadeSimple 0.5s ease-in-out forwards;
            }
       `}</style>

      <div className='container mx-auto flex flex-col items-center gap-8 lg:flex-row lg:gap-12'>
        {/* Phần nội dung văn bản (Giữ nguyên) */}
        <div className='text-center lg:w-1/2 lg:text-left'>
          <h2
            id='visualization-intro-heading'
            className='mb-4 text-3xl font-bold  md:text-4xl'
          >
            {t('heading')}
          </h2>
          <p className='mb-6 text-lg leading-relaxed '>{t('description')}</p>
          <Link
            href={`/visualization`}
            className='group inline-flex items-center justify-center rounded-lg bg-button px-6 py-3 font-semibold text-button-text  shadow-md transition duration-150 ease-in-out hover:bg-button focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
            aria-label={t('buttonAriaLabel')}
          >
            <span>{t('buttonText')}</span>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2}
              aria-hidden='true'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M17 8l4 4m0 0l-4 4m4-4H3'
              />
            </svg>
          </Link>
        </div>

        {/* Phần hiển thị biểu đồ mô phỏng */}
        <div className='mt-8 w-full lg:mt-0 lg:w-1/2'>
          <div className='relative flex h-80 items-center justify-center overflow-hidden rounded-lg p-2 lg:h-96'>
            {renderChart()}
          </div>
          <p className='mt-3 text-center text-sm italic '>
            {t('chartExampleLabel', { chartType: translatedChartType })}
          </p>
        </div>
      </div>
    </section>
  )
}

export default IntroduceVisualization
