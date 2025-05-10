// src/components/SuperBanner.tsx

import React, { useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Link } from '@/src/navigation' // Đảm bảo đường dẫn này chính xác
import * as echarts from 'echarts/core' // Import core
import { CanvasRenderer } from 'echarts/renderers' // Import renderer
import { GraphicComponent } from 'echarts/components' // Import graphic component
import type { EChartsCoreOption, EChartsType } from 'echarts/core' // Import types

// --- Đăng ký các components và renderer cần thiết ---
echarts.use([GraphicComponent, CanvasRenderer])

// --- Animation Variants (Giữ nguyên) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
}

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut'
    }
  }
}
// --- Kết thúc Variants ---

const SuperBanner: React.FC = () => {
  const t = useTranslations('')
  const backgroundImageUrl = '/world.svg' // Đường dẫn tới file SVG trong public
  const chartRef = useRef<HTMLDivElement>(null) // Ref cho div chứa ECharts
  const chartInstanceRef = useRef<EChartsType | null>(null) // Ref để lưu trữ instance ECharts

  const sloganText = t('Slogan_Website') // Lấy text slogan

  useEffect(() => {
    let chart: EChartsType | null = null // Khởi tạo biến chart cục bộ

    // Chỉ khởi tạo ECharts nếu chartRef đã được gắn vào DOM
    if (chartRef.current) {
      chart = echarts.init(chartRef.current)
      chartInstanceRef.current = chart // Lưu instance vào ref

      // --- Cấu hình ECharts Option với text động ---
      const option: EChartsCoreOption = {
        graphic: {
          elements: [
            {
              type: 'text',
              left: 'center',
              top: 'center',
              style: {
                text: sloganText, // Sử dụng text từ translation
                // Điều chỉnh fontSize cho phù hợp với design của bạn
                // Có thể cần điều chỉnh dựa trên kích thước màn hình nếu muốn responsive phức tạp hơn
                fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', // Responsive font size (điều chỉnh min, preferred, max)
                fontWeight: 'bold',
                lineDash: [0, 200],
                lineDashOffset: 0,
                fill: 'transparent',
                // Sử dụng màu từ theme của bạn (ví dụ: màu của text-button)
                // Thay '#FFFFFF' bằng mã màu thực tế của text-button nếu khác
                stroke: '#FFFFFF', // Màu viền ban đầu (giống màu text-button)
                lineWidth: 1, // Độ dày viền
                // Thêm textShadow nếu muốn giữ hiệu ứng shadow tương tự h1 cũ
                textShadowBlur: 4,
                textShadowColor: 'rgba(0, 0, 0, 0.3)', // Tương tự var(--logo-shadow)
                textShadowOffsetX: 0,
                textShadowOffsetY: 2
              },
              keyframeAnimation: {
                duration: 3000,
                loop: true,
                keyframes: [
                  {
                    percent: 0.7,
                    style: {
                      fill: 'transparent',
                      lineDashOffset: 200,
                      lineDash: [200, 0]
                    }
                  },
                  {
                    // Stop for a while.
                    percent: 0.8,
                    style: {
                      fill: 'transparent'
                    }
                  },
                  {
                    percent: 1,
                    style: {
                      // Màu cuối cùng khi text hiện đầy đủ (giống màu text-button)
                      fill: '#FFFFFF' // Thay '#FFFFFF' bằng mã màu thực tế
                    }
                  }
                ]
              }
            }
          ]
        }
      }
      // --- Kết thúc cấu hình ECharts Option ---

      chart.setOption(option)

      // --- Xử lý resize để Echarts tự điều chỉnh kích thước ---
      const handleResize = () => {
        chart?.resize()
      }
      window.addEventListener('resize', handleResize)

      // --- Hàm cleanup ---
      return () => {
        window.removeEventListener('resize', handleResize)
        // Sử dụng instance đã lưu để dispose
        chartInstanceRef.current?.dispose()
        chartInstanceRef.current = null // Reset ref
        console.log('ECharts instance disposed')
      }
    }
    // Thêm sloganText vào dependency array để nếu text thay đổi (ví dụ đổi ngôn ngữ), chart sẽ re-render
    // Tuy nhiên, nếu đổi ngôn ngữ làm cả component re-render thì không cần thiết lắm
  }, [sloganText])

  return (
    <motion.section
      className='bg-span-gradient relative flex h-screen flex-col items-center justify-center overflow-hidden px-4 py-16 text-button-text sm:px-2 lg:px-4'
      variants={containerVariants}
      initial='hidden'
      animate='visible'
    >
      {/* Background Map (Giữ nguyên) */}
      <motion.div
        className='absolute inset-0 z-0'
        initial={{ opacity: 0.1 }}
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        aria-hidden='true'
      >
        <div
          className='h-full w-full bg-cover bg-center bg-no-repeat'
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        ></div>
      </motion.div>

      {/* Lớp phủ gradient nhẹ (Giữ nguyên) */}
      {/* <div
        className='pointer-events-none absolute inset-0 z-[1]'
        style={{
          background:
            'linear-gradient(to top, rgba(51, 51, 102, 0.4), transparent, rgba(9, 127, 165, 0.1))',
        }}
        aria-hidden='true'
      ></div> */}

      {/* Blobs (Giữ nguyên) */}
      <motion.div
        className='absolute left-0 top-0 z-[5] h-32 w-32 -translate-x-1/4 -translate-y-1/4 rounded-full bg-white/10 opacity-40 blur-xl filter'
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className='absolute bottom-0 right-0 z-[5] h-48 w-48 translate-x-1/4 translate-y-1/4 rounded-full bg-white/10 opacity-40 blur-xl filter'
        animate={{ scale: [1, 1.1, 1], rotate: [0, -180, -360] }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear',
          delay: 2
        }}
      />

      {/* Content chính */}
      <div className='relative z-10 mx-0 flex max-w-6xl flex-col items-center text-center'>
        {' '}
        {/* Thêm flex flex-col items-center */}
        {/* === Thay thế H1 bằng Div chứa ECharts === */}
        <motion.div
          ref={chartRef}
          // Cần đặt chiều cao và chiều rộng cho div này để ECharts có không gian render
          // Chiều cao nên đủ lớn để chứa font size lớn nhất bạn đặt
          className='mb-5 h-24 w-full cursor-default sm:h-28 md:h-32 lg:h-36' // Điều chỉnh chiều cao (h-*) nếu cần
          variants={itemVariants} // Áp dụng animation xuất hiện chung
          // Không cần whileHover ở đây nữa vì ECharts không tương tác hover như text HTML
        >
          {/* ECharts sẽ render vào đây */}
        </motion.div>
        {/* ========================================== */}
        <motion.p
          className='mx-0 mb-10 max-w-6xl text-lg font-semibold text-button opacity-90 sm:text-xl md:text-2xl'
          variants={itemVariants}
          // style={{ textShadow: ' var(--logo-shadow)' }}
        >
          {t('Slogan_Website_describe')}
        </motion.p>
        <motion.div
          className='flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6'
          variants={itemVariants}
        >
          {/* Buttons (Giữ nguyên) */}
          <Link href='/conferences' passHref legacyBehavior={false}>
            <motion.button
              className='w-full transform rounded-lg bg-button px-8 py-3 font-semibold text-button-text shadow-md transition-transform duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-button
                         focus:ring-offset-2 focus:ring-offset-primary sm:w-auto'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('Search_Conferences')}
            </motion.button>
          </Link>

          <Link href='/journals' passHref legacyBehavior={false}>
            <motion.button
              className='w-full transform rounded-lg border-2 border-button-text bg-transparent px-8 py-3 font-semibold text-button-text shadow-sm transition-all duration-200 ease-in-out hover:bg-button-text hover:text-secondary
                         focus:outline-none focus:ring-2
                         focus:ring-button-text focus:ring-offset-primary sm:w-auto'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('Search_Journals')}
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default SuperBanner
