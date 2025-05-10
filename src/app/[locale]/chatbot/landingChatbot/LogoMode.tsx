import React from 'react'

// Nội dung CSS cho animation sẽ được nhúng vào đây
// Lưu ý: Đây là CSS thuần, không phải class Tailwind nữa
const customStyles = `
/* Định nghĩa keyframes cho hiệu ứng shimmer */
@keyframes shimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Định nghĩa keyframes cho hiệu ứng tilt (cho vòng sáng) */
@keyframes tilt {
  0%, 50%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(0.5deg); }
  75% { transform: rotate(-0.5deg); }
}

/* Class tùy chỉnh cho Text Logo */
.logo-text-shimmer {
  /* Styling cơ bản tương tự Tailwind */
  font-size: 4rem; /* tương đương text-6xl */
  line-height: 1;
  font-weight: 800; /* tương đương font-extrabold */
  cursor: pointer;
  user-select: none;

  /* Hiệu ứng Gradient Text */
  color: transparent; /* Làm chữ trong suốt */
  background-clip: text;
  -webkit-background-clip: text; /* Prefix cho Safari */
  background-image: linear-gradient(to right, #a78bfa, #f472b6, #ef4444); /* Gradient tương tự */

  /* Animation Shimmer */
  background-size: 200% auto; /* Kích thước background lớn hơn */
  animation: shimmer 3s linear infinite; /* Áp dụng animation */

  /* Transition cho hover */
  transition: transform 0.3s ease-in-out, filter 0.3s ease-in-out;
}

/* Class tùy chỉnh cho Vòng sáng */
.logo-glow {
  position: absolute;
  inset: -0.25rem; /* tương đương -inset-1 */
  background-image: linear-gradient(to right, #a78bfa, #f472b6, #ef4444);
  border-radius: 0.5rem; /* tương đương rounded-lg */
  filter: blur(16px); /* tương đương blur */
  opacity: 0.25; /* tương đương opacity-25 */
  transition: opacity 0.2s ease-in-out;
  animation: tilt 10s infinite linear; /* Áp dụng animation */
  z-index: -1; /* Đảm bảo nằm dưới text */
}

/* Hiệu ứng Hover (sử dụng class cha .logo-container) */
.logo-container:hover .logo-text-shimmer {
  transform: scale(1.05); /* Phóng to */
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.3)); /* Đổ bóng */
}

.logo-container:hover .logo-glow {
  opacity: 0.5; /* Tăng độ sáng */
}

/* Responsive cho font-size */
@media (min-width: 768px) {
  .logo-text-shimmer {
    font-size: 6rem; /* tương đương md:text-8xl */
  }
}
`

export default function LogoMode(): JSX.Element {
  return (
    <div className='flex h-screen items-center justify-center bg-black'>
      {/* Nhúng thẻ <style> với CSS tùy chỉnh */}
      <style>{customStyles}</style>

      {/* Container cho logo, thêm class để CSS hover hoạt động */}
      <div className='logo-container relative'>
        {/* Text Logo sử dụng class CSS tùy chỉnh */}
        <h1 className='logo-text-shimmer'>hello</h1>

        {/* Vòng sáng sử dụng class CSS tùy chỉnh */}
        <div className='logo-glow'></div>
      </div>
    </div>
  )
}
