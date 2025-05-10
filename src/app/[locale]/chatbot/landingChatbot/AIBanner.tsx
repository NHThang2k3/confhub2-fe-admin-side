// src/components/chatbot/AIBanner.tsx

'use client'

import React, { useState } from 'react'
import Image from 'next/image'
// Make sure you're using the Link from your navigation setup (which seems to be the case)
import { Link } from '@/src/navigation'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'

const AIBanner: React.FC = () => {
  const t = useTranslations('')
  const [mousePosition, setMousePosition] = useState<{
    x: number | null
    y: number | null
  }>({ x: null, y: null })

  // --- Xử lý sự kiện chuột ---
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    setMousePosition({ x, y })
  }

  const handleMouseLeave = () => {
    setMousePosition({ x: null, y: null })
  }

  // --- Định nghĩa hiệu ứng Framer Motion ---
  const textHoverEffect = {
    scale: 1.05,
    textShadow: '0px 0px 6px rgba(255, 255, 255, 0.7)',
    transition: { duration: 0.2 }
  }

  // Variants cho NÚT (vẫn điều khiển con)
  const buttonVariants = {
    idle: { scale: 1 },
    hovering: {
      scale: 1.05,
      boxShadow: '0px 0px 15px rgba(255, 255, 255, 0.3)',
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  }

  // Variants cho NÚT PHỤ
  const secondaryButtonVariants = {
    ...buttonVariants,
    hovering: {
      ...buttonVariants.hovering,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: '#D1D5DB'
    }
  }

  // Variants cho SPARKLE (không đổi logic)
  const sparkleVariants = {
    idle: { opacity: 0, scale: 0.5, transition: { duration: 0.15 } },
    hovering: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2, delay: 0.1 }
    }
  }

  // --- Style lớp phủ ---
  const overlayStyle: React.CSSProperties =
    mousePosition.x !== null && mousePosition.y !== null
      ? {
          background: `radial-gradient(circle 250px at ${mousePosition.x}px ${mousePosition.y}px, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%)`,
          transition: 'background 0.3s ease-out'
        }
      : {
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          transition: 'background 0.3s ease-out'
        }

  // --- Component SVG Sparkle (tái sử dụng) ---
  const SparkleIcon = () => (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='8' // Giữ nguyên width/height gốc để viewBox hoạt động đúng
      height='8'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor' // Màu kế thừa từ cha
      strokeWidth={2.5} // Có thể chỉnh độ dày
      strokeLinecap='round'
      strokeLinejoin='round'
      // Kích thước hiển thị và màu được đặt trên motion.div cha
    >
      <path d='M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z' />
    </svg>
  )

  return (
    <div
      className='relative flex h-screen flex-col items-center justify-center overflow-hidden text-white'
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* --- Ảnh nền, Lớp phủ, Navbar giữ nguyên --- */}
      <Image
        src='/banner.png'
        alt='Background Image'
        fill
        quality={100}
        className='z-0'
        style={{ objectFit: 'cover' }}
        priority
      />
      <div className='z-5 absolute inset-0' style={overlayStyle} />
      <div className='absolute left-0 top-0 z-20 flex w-full items-center justify-between p-4'>
        <div className='flex items-center'>
          <Link href='/'>
            <motion.button
              className='rounded px-4 py-2 font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75'
              whileHover={textHoverEffect}
              whileTap={{ scale: 0.9 }}
            >
              {t('Home')}
            </motion.button>
          </Link>
        </div>
      </div>

      {/* --- Nội dung chính --- */}
      <div className='relative z-10 text-center'>
        {/* H1 và P giữ nguyên */}
        <motion.h1
          className='mb-4 cursor-default text-6xl font-bold md:text-8xl'
          whileHover={textHoverEffect}
        >
          {t('Name_Chatbot')}
        </motion.h1>
        <motion.p
          className='mb-8 cursor-default text-lg'
          whileHover={textHoverEffect}
        >
          {t('Slogan_Chatbot')}
        </motion.p>

        {/* --- Container cho các nút bấm --- */}
        <div className='flex items-stretch justify-center gap-4'>
          {/* --- Nút Chat Now (Regular Chat) --- */}
          {/* MODIFIED href below */}
          <Link href='/chatbot/regularchat'>
            <motion.button
              // Giữ relative cho nút cha
              className='relative flex min-w-[180px] items-center justify-center gap-2 overflow-hidden rounded bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75'
              variants={buttonVariants}
              initial='idle'
              whileHover='hovering'
              whileTap='tap'
            >
              {/* --- Container cho Nội dung chính VÀ Sparkles --- */}
              <span className='relative flex items-center justify-center gap-2'>
                {/* Sparkle Top-Left */}
                <motion.div
                  className='absolute -left-1 -top-1 text-current' // Vị trí và màu kế thừa
                  variants={sparkleVariants}
                  aria-hidden='true'
                >
                  <SparkleIcon /> {/* Component SVG tái sử dụng */}
                </motion.div>

                {/* Sparkle Bottom-Right */}
                <motion.div
                  className='absolute -bottom-1 left-4 text-current' // Vị trí và màu kế thừa
                  variants={sparkleVariants}
                  aria-hidden='true'
                >
                  <SparkleIcon /> {/* Component SVG tái sử dụng */}
                </motion.div>

                {/* Icon Chat chính */}
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth={2}
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='h-5 w-5'
                  aria-hidden='true'
                >
                  <path d='M7.9 20A9 9 0 1 0 4 16.1L2 22Z' />{' '}
                  <path d='M8 12h.01' /> <path d='M12 12h.01' />{' '}
                  <path d='M16 12h.01' />
                </svg>
                {/* Text nút */}
                {t('Chat_now')}
              </span>
            </motion.button>
          </Link>

          {/* --- Nút Live Chat --- */}
          {/* MODIFIED href below */}
          <Link href='/chatbot/livechat'>
            <motion.button
              className='relative flex min-w-[180px] items-center justify-center gap-2 overflow-hidden rounded border border-white px-6 py-3 font-bold text-white outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75'
              variants={secondaryButtonVariants}
              initial='idle'
              whileHover='hovering'
              whileTap='tap'
            >
              {/* --- Container cho Nội dung chính VÀ Sparkles --- */}
              <span className='relative flex items-center justify-center gap-2'>
                {/* Sparkle Top-Left */}
                <motion.div
                  // Class đặt size và màu cho SVG con thông qua text-current
                  className='absolute -left-1 -top-1 h-3 w-3 text-current'
                  variants={sparkleVariants}
                  aria-hidden='true'
                >
                  <SparkleIcon />
                </motion.div>
                {/* Sparkle Bottom-Right */}
                <motion.div
                  className='absolute -bottom-1 left-4 h-3 w-3 text-current'
                  variants={sparkleVariants}
                  aria-hidden='true'
                >
                  <SparkleIcon />
                </motion.div>
                {/* Icon Mic chính */}
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth={2}
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='h-5 w-5'
                  aria-hidden='true'
                >
                  <path d='M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z' />{' '}
                  <path d='M19 10v2a7 7 0 0 1-14 0v-2' />{' '}
                  <line x1='12' x2='12' y1='19' y2='22' />
                </svg>
                {/* Text nút */}
                {t('Live_chat')}{' '}
              </span>
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AIBanner