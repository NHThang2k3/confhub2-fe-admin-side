// src/app/[locale]/chatbot/Modal.tsx
import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | '4xl' | '5xl' | '6xl' | '7xl'; // Thêm các size lớn hơn
  positioning?: 'fixed' | 'absolute';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  positioning = 'fixed',
}) => {
  if (!isOpen) return null;

  // Mở rộng các tùy chọn size để linh hoạt hơn
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
  };

  const containerClasses =
    positioning === 'fixed'
      ? 'fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50'
      : 'absolute inset-0 z-20 flex items-center justify-center bg-white-pure/80 dark:bg-gray-800/80 backdrop-blur-sm';

  return (
    <div
      className={containerClasses}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        // Các class đã được tối ưu cho responsive
        className={`
          flex flex-col bg-white-pure shadow-xl dark:bg-gray-900 
          rounded-lg overflow-hidden 
          w-full ${sizeClasses[size]} 
          max-h-[90vh] sm:max-h-[95vh] 
          m-2 sm:m-4
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Không co lại */}
        {title && (
          <div className="flex-shrink-0 flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white-pure">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-gray-700"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Body: Tự động co giãn và cuộn dọc nếu cần */}
        <div className="flex-grow overflow-y-auto p-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {children}
        </div>

        {/* Footer: Không co lại */}
        {footer && (
          <div className="flex-shrink-0 rounded-b-lg border-t border-gray-200 bg-gray-10 p-3 dark:border-gray-700 dark:bg-gray-800">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;