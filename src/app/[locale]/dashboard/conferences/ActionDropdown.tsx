'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, Trash2 } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ActionDropdownProps {
  onViewHistory: () => void;
  onDelete: () => void;
}

export const ActionDropdown: React.FC<ActionDropdownProps> = ({
  onViewHistory,
  onDelete
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleScroll() {
      setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', handleScroll, true);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isOpen]);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      setDropdownPosition({
        top: rect.bottom + scrollTop + 4,
        left: rect.right + scrollLeft - 192 // 192px is w-48 (12rem * 16px)
      });
    }
    
    setIsOpen(!isOpen);
  };

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const DropdownContent = () => (
    <div 
      ref={dropdownRef}
      className="fixed w-48 bg-white border border-gray-200 rounded-md shadow-lg z-[9999]"
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
      }}
    >
      <div className="py-1">
        <button
          onClick={() => handleAction(onViewHistory)}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Eye className="w-4 h-4 mr-3 text-blue-500" />
          View History
        </button>
        <button
          onClick={() => handleAction(onDelete)}
          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-3" />
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Actions"
      >
        <MoreVertical className="w-4 h-4 text-gray-600" />
      </button>

      {isOpen && typeof window !== 'undefined' && createPortal(
        <DropdownContent />,
        document.body
      )}
    </>
  );
};
