// components/ConnectionStatus.tsx
import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaSpinner } from 'react-icons/fa';

// Định nghĩa các trạng thái kết nối có thể có
type ConnectionStateType = 'connected' | 'error' | 'info' | 'connecting';

interface ConnectionStatusProps {
  status: ConnectionStateType; // Thêm trạng thái để xác định style và icon
  message: string | null;
  elapsedTime?: number; // Optional, chỉ hiển thị khi status là 'connected'
  onClose: () => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  message,
  elapsedTime,
  onClose,
}) => {
  // Hàm định dạng thời gian (giữ nguyên)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  // Xác định icon và màu sắc dựa trên trạng thái
  let IconComponent;
  let bgColor;
  let textColor = 'text-white'; // Mặc định chữ trắng cho các nền tối

  switch (status) {
    case 'connected':
      IconComponent = <FaCheckCircle className="text-green-300" size={24} />;
      bgColor = 'bg-green-600';
      break;
    case 'error':
      IconComponent = <FaTimesCircle className="text-red-300" size={24} />;
      bgColor = 'bg-red-600';
      break;
    case 'connecting':
      IconComponent = <FaSpinner className="animate-spin text-blue-300" size={24} />;
      bgColor = 'bg-blue-600';
      break;
    case 'info':
    default:
      IconComponent = <FaInfoCircle className="text-gray-300" size={24} />;
      bgColor = 'bg-gray-800'; // Giữ màu gốc cho trạng thái thông tin
      break;
  }

  // Chỉ hiển thị component nếu có message hoặc đang ở trạng thái connecting/connected
  if (!message && status !== 'connecting' && status !== 'connected') {
    return null; // Hoặc trả về một thông báo mặc định nếu cần
  }

  return (
    <div
      className={`fixed top-6
               left-1/2 // Đặt điểm neo ở giữa theo chiều ngang
               transform -translate-x-1/2 // Dịch chuyển sang trái 50% chiều rộng của chính nó để căn giữa
               ${bgColor} ${textColor}
               rounded-lg shadow-xl z-50
               flex items-center gap-3 p-2
               min-w-[250px] max-w-md // Đặt chiều rộng min/max
               transition-all duration-300 ease-in-out // Thêm hiệu ứng chuyển động nhẹ nhàng
               `}
      role="alert" // Thêm vai trò ARIA để hỗ trợ tiếp cận
    >
      {/* Icon */}
      <div className="flex-shrink-0">{IconComponent}</div>

      {/* Nội dung: Message và Thời gian */}
      <div className="flex-grow">
        {message && <p className="font-medium">{message}</p>}
        {/* Chỉ hiển thị thời gian nếu đang kết nối và elapsedTime được cung cấp */}
        {status === 'connected' && elapsedTime !== undefined && (
          <p className="text-sm opacity-90">
            Connected for: {formatTime(elapsedTime)} / 10:00
          </p>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;