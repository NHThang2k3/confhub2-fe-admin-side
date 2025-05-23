// src/app/[locale]/dashboard/logAnalysis/ConferenceTableControls.tsx
import React from 'react'
import {
  FaSave,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaRedo, // Giữ lại FaRedo cho icon
  FaListUl,
  FaCheckDouble,
  FaTimesCircle,
  FaMinusCircle,
  FaExclamationCircle,
  FaSearch
} from 'react-icons/fa'

type MainSavingStatus = 'idle' | 'saving' | 'success' | 'error'

interface ConferenceTableControlsProps {
  selectedCount: number
  isSaveEnabled: boolean
  mainSaveStatus: MainSavingStatus
  rowSaveErrorsCount: number
  onSave: () => void
  onProcessAgain: () => void; // <--- ĐỔI TÊN PROP
  onSelectAll: () => void
  onSelectNoError: () => void
  onSelectError: () => void
  onSelectWithoutWarningsOrErrors: () => void;
  onSelectWarning: () => void
  onDeselectAll: () => void
  searchTerm: string
  onSearchChange: (term: string) => void
  isProcessing?: boolean; // <--- ĐỔI TÊN PROP
}


export const ConferenceTableControls: React.FC<
  ConferenceTableControlsProps
> = ({
  selectedCount,
  isSaveEnabled,
  mainSaveStatus,
  rowSaveErrorsCount,
  onSave,
  onProcessAgain, // <--- Nhận prop đã đổi tên
  onSelectAll,
  onSelectNoError,
  onSelectError,
  onSelectWithoutWarningsOrErrors,
  onSelectWarning,
  onDeselectAll,
  searchTerm,
  onSearchChange,
  isProcessing, // <--- Nhận prop đã đổi tên

}) => {
    const renderMainSaveButton = () => {
      // ... (logic render nút save giữ nguyên)
      let icon = <FaSave className='mr-2' />
      let text = `Save Selected (${selectedCount})`
      let buttonClass = 'bg-blue-600 hover:bg-blue-700 text-white'
      let titleAttr = 'Save all selected conferences without errors or warnings'
      let disabled = !isSaveEnabled

      switch (mainSaveStatus) {
        case 'saving':
          icon = <FaSpinner className='mr-2 animate-spin' />
          text = 'Saving...'
          disabled = true
          buttonClass = 'bg-gray-500 text-white cursor-not-allowed' // Sửa lại màu
          titleAttr = 'Saving in progress...'
          break
        case 'success':
          icon = <FaCheckCircle className='mr-2' />
          text = 'Saved Successfully'
          disabled = true // Giữ disabled sau khi thành công để tránh double click
          buttonClass = 'bg-green-600 text-white cursor-default'
          titleAttr = 'Selected conferences saved successfully.'
          break
        case 'error':
          icon = <FaExclamationTriangle className='mr-2' />
          text = `Save Failed (${rowSaveErrorsCount} ${rowSaveErrorsCount === 1 ? 'error' : 'errors'})`
          disabled = !isSaveEnabled // Cho phép thử lại nếu isSaveEnabled true trở lại
          buttonClass = 'bg-red-600 hover:bg-red-700 text-white'
          titleAttr = `Save failed for ${rowSaveErrorsCount} item(s). Check table for details. Click to retry if possible.`
          break
        case 'idle':
        default:
          if (selectedCount === 0) {
            titleAttr = 'Select conferences to save.'
            disabled = true
          } else if (!isSaveEnabled && selectedCount > 0) {
            titleAttr =
              'Cannot save: One or more selected conferences have errors or warnings.'
            disabled = true
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

    // isProcessDisabled thay cho isCrawlDisabled
    const isProcessDisabled = selectedCount === 0 || mainSaveStatus === 'saving' || isProcessing;


    return (
      <>
        <div className='mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          {/* Search Input */}
          <div className='relative flex-grow md:max-w-sm lg:max-w-md'>
            <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
              <FaSearch className='h-4 w-4 text-gray-400' aria-hidden='true' />
            </div>
            <input
              type='search'
              name='conferenceSearch'
              id='conferenceSearch'
              className='block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2'
              placeholder='Search conferences (title, acronym...)'
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
            />
          </div>

          <div className='flex flex-wrap items-center justify-start gap-2 md:justify-end'>
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
              <button
                onClick={onSelectWithoutWarningsOrErrors}
                title='Select Conferences Without Warnings or Errors'
                className='rounded p-1 text-blue-600 hover:bg-gray-100 hover:text-blue-700'
              >
                <FaCheckCircle />
              </button>
              <button
                onClick={onSelectWarning}
                title='Select Conferences With Warnings'
                className='rounded p-1 text-amber-600 hover:bg-gray-100 hover:text-amber-700'
              >
                <FaExclamationCircle />
              </button>
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
            <button
              type='button'
              onClick={onProcessAgain} // <--- Gọi prop đã đổi tên
              disabled={isProcessDisabled} // <--- Sử dụng biến đã đổi tên
              className={`inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition duration-150 ease-in-out hover:bg-gray-5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${isProcessDisabled ? 'cursor-not-allowed opacity-60' : ''}`}
              title={
                isProcessing // <--- Sử dụng biến đã đổi tên
                  ? 'Another process operation is in progress...'
                  : selectedCount === 0
                    ? 'Select conferences to process again'
                    : `Process selected (${selectedCount}) conferences again`
              }
            >
              <FaRedo className='mr-2' /> Process Again {/* <--- ĐỔI TEXT NÚT */}
            </button>
          </div>
        </div>
      </>
    );
  };