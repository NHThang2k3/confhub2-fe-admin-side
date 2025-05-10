// components/AIAbilities.tsx
'use client' // Đảm bảo là Client Component

import React from 'react'
import { useTranslations } from 'next-intl'
import { motion, Variants } from 'framer-motion'
// Không cần import MovingBorderSegmentCard hoặc AnimatedBorderCard nữa

// Định nghĩa kiểu component
const AIAbilities: React.FC = () => {
  const t = useTranslations('AIAbilities')

  // Variants cho container chính (Rows)
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2 // Stagger giữa các card
      }
    }
  }

  // Variants cho từng Card (Hiệu ứng xuất hiện)
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12
      }
    },
    // Có thể thêm lại hover effect nếu muốn
    hover: {
      scale: 1.03,
      y: -5,
      boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.25)', // Thêm bóng đổ khi hover
      transition: { type: 'spring', stiffness: 300, damping: 15 }
    }
  }

  // Variants cho Container Nội dung Bên trong Card (Quản lý stagger)
  const innerContainerVariants: Variants = {
    hidden: {}, // Trạng thái ẩn không cần thay đổi gì cụ thể ở đây
    visible: {
      transition: {
        staggerChildren: 0.15, // Animation lần lượt cho các item bên trong
        delayChildren: 0.2 // Delay nhẹ trước khi bắt đầu animation bên trong
      }
    }
  }

  // Variants cho các Item Bên trong Card (Fade/slide up)
  const innerItemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut'
      }
    }
  }

  // Variants cho hiệu ứng hover/tap của button
  const buttonHoverTap: Variants = {
    hover: {
      scale: 1.08,
      backgroundColor: '#2563EB', // blue-600
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  }

  // Kích thước khác nhau cho các thẻ
  const cardSizeClasses: string[] = [
    'w-full md:w-[calc(50%-1rem)] lg:w-[480px]',
    'w-full md:w-[calc(50%-1rem)] lg:w-[400px]',
    'w-full md:w-[calc(50%-1rem)] lg:w-[420px]',
    'w-full md:w-[calc(50%-1rem)] lg:w-[500px]'
  ]

  // Không cần borderColors hay borderDurations nữa

  return (
    <div className='flex flex-col items-center gap-8 bg-gray-900 p-4 text-white sm:p-8 md:gap-12 md:p-12'>
      {/* Row 1 */}
      <motion.div
        className='flex w-full max-w-6xl flex-wrap justify-center gap-8'
        variants={containerVariants}
        initial='hidden'
        whileInView='visible' // Kích hoạt animation khi vào viewport
        viewport={{ once: true, amount: 0.1 }} // Chạy 1 lần, khi 10% vào view
      >
        {/* --- EASE OF USE --- */}
        <motion.div
          variants={cardVariants} // Animation xuất hiện và hover cho thẻ
          whileHover='hover' // Kích hoạt trạng thái hover
          className={`flex flex-col rounded-lg bg-gray-800 p-6 shadow-lg ${cardSizeClasses[0]}`} // Layout, style và kích thước thẻ
        >
          {/* Container nội dung bên trong với animation stagger */}
          <motion.div
            variants={innerContainerVariants}
            initial='hidden' // Bắt đầu ẩn
            animate='visible' // Chuyển sang visible
            className='flex h-full flex-col' // Layout cột, chiếm full chiều cao thẻ cha
          >
            <motion.h3
              variants={innerItemVariants}
              className='mb-2 text-lg font-semibold text-blue-400'
            >
              {t('easeOfUse.category')}
            </motion.h3>
            <motion.h2
              variants={innerItemVariants}
              className='mb-4 text-2xl font-bold text-white'
            >
              {t('easeOfUse.headline')}
            </motion.h2>
            <motion.p
              variants={innerItemVariants}
              className='mb-4 flex-grow text-sm text-gray-300' // flex-grow để đẩy tags xuống dưới
            >
              {t('easeOfUse.description')}
            </motion.p>
            <motion.div
              variants={innerItemVariants}
              className='mt-auto flex flex-wrap gap-2' // mt-auto để đảm bảo ở dưới cùng
            >
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className='rounded-full border border-blue-800 bg-blue-900/40 px-3 py-1 text-xs font-medium text-blue-300'
                >
                  {t(`easeOfUse.exampleTexts.${index}`)}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* --- EFFICIENCY --- */}
        <motion.div
          variants={cardVariants}
          whileHover='hover'
          className={`flex flex-col rounded-lg bg-gray-800 p-6 shadow-lg ${cardSizeClasses[1]}`}
        >
          <motion.div
            variants={innerContainerVariants}
            initial='hidden'
            animate='visible'
            className='flex h-full flex-col'
          >
            <motion.h3
              variants={innerItemVariants}
              className='mb-2 text-lg font-semibold text-green-400'
            >
              {t('efficiency.category')}
            </motion.h3>
            <motion.h2
              variants={innerItemVariants}
              className='mb-4 text-2xl font-bold text-white'
            >
              {t('efficiency.headline')}
            </motion.h2>
            <motion.p
              variants={innerItemVariants}
              className='mb-4 flex-grow text-sm text-gray-300'
            >
              {t('efficiency.description')}
            </motion.p>
            <motion.div
              variants={innerItemVariants}
              className='mt-auto rounded-md border border-green-700 bg-green-900/30 p-3'
            >
              <h4 className='mb-1 text-sm font-medium text-green-300'>
                {t('efficiency.exampleTitle')}
              </h4>
              <p className='whitespace-pre-line text-xs text-gray-400'>
                {t('efficiency.exampleDescription')}
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Row 2 */}
      <motion.div
        className='flex w-full max-w-6xl flex-wrap justify-center gap-8'
        variants={containerVariants}
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, amount: 0.1 }}
      >
        {/* --- QUALITY --- */}
        <motion.div
          variants={cardVariants}
          whileHover='hover'
          className={`flex flex-col rounded-lg bg-gray-800 p-6 shadow-lg ${cardSizeClasses[2]}`}
        >
          <motion.div
            variants={innerContainerVariants}
            initial='hidden'
            animate='visible'
            className='flex h-full flex-col'
          >
            <motion.h3
              variants={innerItemVariants}
              className='mb-2 text-lg font-semibold text-yellow-400'
            >
              {t('quality.category')}
            </motion.h3>
            <motion.h2
              variants={innerItemVariants}
              className='mb-4 text-2xl font-bold text-white'
            >
              {t('quality.headline')}
            </motion.h2>
            <motion.p
              variants={innerItemVariants}
              className='mb-4 flex-grow text-sm text-gray-300'
            >
              {t('quality.description')}
            </motion.p>
            <motion.div
              variants={innerItemVariants}
              className='mt-auto rounded-md border border-yellow-700 bg-yellow-900/20 p-3 text-xs italic text-yellow-300'
            >
              &quot;{t('quality.quote')}&quot;
            </motion.div>
          </motion.div>
        </motion.div>

        {/* --- INNOVATION --- */}
        <motion.div
          variants={cardVariants}
          whileHover='hover'
          className={`flex flex-col rounded-lg bg-gray-800 p-6 shadow-lg ${cardSizeClasses[3]}`}
        >
          <motion.div
            variants={innerContainerVariants}
            initial='hidden'
            animate='visible'
            className='flex h-full flex-col'
          >
            <motion.h3
              variants={innerItemVariants}
              className='mb-2 text-lg font-semibold text-purple-400'
            >
              {t('innovation.category')}
            </motion.h3>
            <motion.h2
              variants={innerItemVariants}
              className='mb-4 text-2xl font-bold text-white'
            >
              {t('innovation.headline')}
            </motion.h2>
            <motion.p
              variants={innerItemVariants}
              className='mb-4 flex-grow text-sm text-gray-300'
            >
              {t('innovation.description')}
            </motion.p>
            <motion.div
              variants={innerItemVariants}
              className='mt-auto flex flex-wrap gap-3'
            >
              {[...Array(4)].map((_, index) => (
                <motion.button
                  key={index}
                  className='rounded-md bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75'
                  variants={buttonHoverTap}
                  whileHover='hover'
                  whileTap='tap'
                >
                  {t(`innovation.buttons.${index}`)}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default AIAbilities
