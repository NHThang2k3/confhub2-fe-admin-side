// src/app/[locale]/dashboard/logAnalysis/ConferenceTableControls.tsx
import React from 'react'
import {
  FaSave,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaRedo,
  FaListUl,
  FaCheckDouble,
  FaTimesCircle,
  FaMinusCircle,
  FaExclamationCircle // THÊM ICON WARNING
} from 'react-icons/fa'

type MainSavingStatus = 'idle' | 'saving' | 'success' | 'error'

interface ConferenceTableControlsProps {
  selectedCount: number
  isSaveEnabled: boolean
  mainSaveStatus: MainSavingStatus
  rowSaveErrorsCount: number
  onSave: () => void
  onCrawl: () => void
  onSelectAll: () => void
  onSelectNoError: () => void // Chọn các hàng không có lỗi (errorCount = 0)
  onSelectError: () => void // Chọn các hàng có lỗi (errorCount > 0)
  // --- THÊM CÁC HÀM CHỌN MỚI ---
  onSelectNoWarning: () => void // Chọn các hàng không có warning (validationWarningCount = 0)
  onSelectWarning: () => void // Chọn các hàng có warning (validationWarningCount > 0)
  // ---------------------------
  onDeselectAll: () => void
}

export const ConferenceTableControls: React.FC<
  ConferenceTableControlsProps
> = ({
  selectedCount,
  isSaveEnabled,
  mainSaveStatus,
  rowSaveErrorsCount,
  onSave,
  onCrawl,
  onSelectAll,
  onSelectNoError,
  onSelectError,
  // --- Destructure hàm mới ---
  onSelectNoWarning,
  onSelectWarning,
  // ------------------------
  onDeselectAll
}) => {
  const renderMainSaveButton = () => {
    let icon = <FaSave className='mr-2' />
    let text = `Save Selected (${selectedCount})`
    let buttonClass = 'bg-blue-600 hover:bg-blue-700 text-white'
    let titleAttr = 'Save all selected conferences without errors or warnings' // Cập nhật title nếu logic isSaveEnabled thay đổi
    let disabled = !isSaveEnabled

    switch (mainSaveStatus) {
      case 'saving':
        icon = <FaSpinner className='mr-2 animate-spin' />
        text = 'Saving...'
        disabled = true
        buttonClass = 'bg-gray-50 text-white cursor-not-allowed'
        titleAttr = 'Saving in progress...'
        break
      case 'success':
        icon = <FaCheckCircle className='mr-2' />
        text = 'Saved Successfully'
        disabled = true
        buttonClass = 'bg-green-600 text-white cursor-default'
        titleAttr = 'Selected conferences saved successfully.'
        break
      case 'error':
        icon = <FaExclamationTriangle className='mr-2' />
        text = `Save Failed (${rowSaveErrorsCount} ${rowSaveErrorsCount === 1 ? 'error' : 'errors'})`
        disabled = !isSaveEnabled
        buttonClass = 'bg-red-600 hover:bg-red-700 text-white'
        titleAttr = `Save failed for ${rowSaveErrorsCount} item(s). Check table for details. Click to retry if possible.`
        break
      case 'idle':
      default:
        if (selectedCount === 0) {
          titleAttr = 'Select conferences to save.'
          disabled = true
        } else if (!isSaveEnabled && selectedCount > 0) {
          // Cập nhật title này tùy thuộc vào logic của isSaveEnabled
          // Ví dụ: có thể bao gồm cả việc kiểm tra warnings
          titleAttr =
            'Cannot save: One or more selected conferences have errors or warnings.'
          disabled = true
          // Có thể thay đổi màu nút nếu có warnings nhưng không có errors
          // buttonClass = 'bg-yellow-500 text-white cursor-not-allowed';
        }
        break
    }
    return (
      <button
        type='button'
        onClick={onSave}
        disabled={disabled}
        className={`inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${buttonClass} transition duration-150 ease-in-out ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
        title={titleAttr}
      >
        {icon} {text}
      </button>
    )
  }

  return (
    <>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-4'>
        <div className='flex flex-wrap items-center gap-2'>
          {/* Selection Buttons */}
          <div className='flex items-center gap-1 rounded-md border border-gray-300 p-1'>
            <button
              onClick={onSelectAll}
              title='Select All Conferences'
              className='rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-blue-600'
            >
              <FaListUl />
            </button>
            <button
              onClick={onSelectNoError}
              title='Select Conferences Without Errors'
              className='rounded p-1 text-green-600 hover:bg-gray-100 hover:text-green-700'
            >
              <FaCheckDouble />
            </button>
            <button
              onClick={onSelectError}
              title='Select Conferences With Errors'
              className='rounded p-1 text-red-600 hover:bg-gray-100 hover:text-red-700'
            >
              <FaTimesCircle />
            </button>
            {/* --- THÊM NÚT CHỌN WARNING --- */}
            <button
              onClick={onSelectNoWarning}
              title='Select Conferences Without Warnings'
              className='rounded p-1 text-blue-600 hover:bg-gray-100 hover:text-blue-700'
            >
              <FaCheckCircle />
            </button>{' '}
            {/* Icon khác */}
            <button
              onClick={onSelectWarning}
              title='Select Conferences With Warnings'
              className='rounded p-1 text-amber-600 hover:bg-gray-100 hover:text-amber-700'
            >
              <FaExclamationCircle />
            </button>
            {/* --------------------------- */}
            <button
              onClick={onDeselectAll}
              title='Deselect All'
              className='rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-black'
            >
              <FaMinusCircle />
            </button>
          </div>
          {/* Action Buttons */}
          {renderMainSaveButton()}
          {/* Nút Crawl Again giữ nguyên */}
          <button
            type='button'
            onClick={onCrawl}
            disabled={selectedCount === 0 || mainSaveStatus === 'saving'}
            className={`inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${selectedCount === 0 || mainSaveStatus === 'saving' ? 'cursor-not-allowed opacity-60' : ''}`}
            title={
              selectedCount === 0
                ? 'Select conferences to crawl again'
                : `Crawl selected (${selectedCount}) conferences again (Mock)`
            }
          >
            <FaRedo className='mr-2' /> Crawl Again
          </button>
        </div>
      </div>
    </>
  )
}
