// src/app/[locale]/dashboard/logAnalysis/steps/FileUploadStep.tsx
import React, { useState, useEffect } from 'react';
import { FaFileUpload, FaSpinner, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import Papa from 'papaparse';
import { Conference } from '@/src/models/logAnalysis/importConferenceCrawl';
import ImportDatabaseConfirmationModal from './ImportDatabaseConfirmationModal';
import DataReviewModal from './DataReviewModal';

interface FileUploadStepProps {
  // Props từ hook cha (useConferenceCrawl)
  file: File | null; // File đã được xử lý thành công lần trước
  isParsing: boolean; // Trạng thái loading khi API đang xử lý file
  parseError: string | null; // Lỗi trả về từ API
  parsedDataLength: number; // Số lượng bản ghi đã được parse thành công
  processDataForUpload: (data: Conference[], originalFile: File) => void; // Hàm để gửi dữ liệu đã review lên server
  setParsedData: (data: Conference[] | null) => void; // Hàm để cập nhật dữ liệu khi không upload
  onNext: () => void; // Chuyển sang bước tiếp theo
  canProceed: boolean; // Điều kiện để cho phép chuyển bước
  resetForNewUpload: () => void; // <<< THÊM PROP MỚI

}

const FileUploadStep: React.FC<FileUploadStepProps> = ({
  file,
  isParsing,
  parseError,
  parsedDataLength,
  processDataForUpload,
  setParsedData,
  onNext,
  canProceed,
  resetForNewUpload, // <<< NHẬN PROP MỚI

}) => {
  const t = useTranslations('FileUploadStep');

  // --- State cục bộ để quản lý luồng chọn và review file ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // File người dùng vừa chọn, chờ xử lý
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false); // Hiển thị modal hỏi "Import/Skip"
  const [isReviewModalOpen, setReviewModalOpen] = useState(false); // Hiển thị modal review và map header
  const [clientParsedData, setClientParsedData] = useState<any[] | null>(null); // Dữ liệu thô parse từ file trên client
  const [isClientParsing, setIsClientParsing] = useState(false); // Trạng thái loading khi parse trên client
  const [clientParseError, setClientParseError] = useState<string | null>(null); // Lỗi khi parse trên client
  const [importDecision, setImportDecision] = useState<boolean>(false); // Lưu quyết định "Import" (true) hay "Skip" (false)

  // Đồng bộ state cục bộ nếu state từ hook cha bị reset
  useEffect(() => {
    if (!file) {
      setSelectedFile(null);
    }
  }, [file]);

  /**
   * Được gọi khi người dùng chọn một file từ máy tính.
   * Reset state cũ trước, sau đó mở modal xác nhận.
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // <<< THAY ĐỔI QUAN TRỌNG NHẤT Ở ĐÂY >>>
      // Reset tất cả state liên quan đến file/dữ liệu cũ trước khi xử lý file mới.
      resetForNewUpload();

      if (file.type !== 'text/csv' && !file.name.toLowerCase().endsWith('.csv')) {
        setClientParseError(t('status.invalidFileType'));
        return;
      }
      setClientParseError(null);
      setSelectedFile(file);
      setConfirmModalOpen(true);
    }
    event.target.value = ''; // Reset input để có thể chọn lại cùng một file
  };


  /**
   * Được gọi sau khi người dùng quyết định "Import" hoặc "Skip".
   * Bắt đầu quá trình parse file trên client.
   */
  const handleImportDecision = (decision: boolean) => {
    setConfirmModalOpen(false);
    if (!selectedFile) return;

    setImportDecision(decision);
    setIsClientParsing(true);

    Papa.parse(selectedFile, {
      header: false, // Luôn parse không có header
      skipEmptyLines: true,
      complete: (results) => {
        setIsClientParsing(false);
        if (results.errors.length) {
          setClientParseError(t('status.clientParseError', { error: results.errors[0].message }));
          return;
        }

        const dataAsArray = results.data as string[][];
        if (dataAsArray.length > 0 && dataAsArray[0].length > 0) {
          // Tạo header chung (Column 1, Column 2, ...)
          const generatedHeaders = dataAsArray[0].map((_, index) => `Column ${index + 1}`);
          // Chuyển đổi mảng các mảng thành mảng các object
          const dataAsObjects = dataAsArray.map(row =>
            generatedHeaders.reduce((obj, header, index) => {
              obj[header] = row[index] || '';
              return obj;
            }, {} as Record<string, string>)
          );
          setClientParsedData(dataAsObjects);
          setReviewModalOpen(true); // Mở modal review
        } else {
          setClientParseError(t('status.noValidData'));
        }
      },
      error: (error) => {
        setIsClientParsing(false);
        setClientParseError(t('status.clientParseError', { error: error.message }));
      },
    });
  };

  /**
   * Được gọi khi người dùng hoàn tất quá trình review trong DataReviewModal.
   * Dựa trên quyết định ban đầu, sẽ gọi API hoặc chỉ cập nhật state.
   */
  const handleReviewComplete = (finalData: Conference[]) => {
    setReviewModalOpen(false);
    if (!selectedFile) return;

    if (importDecision) {
      // Nếu user chọn "Import to DB", gọi hàm từ hook để xử lý và upload
      processDataForUpload(finalData, selectedFile);
    } else {
      // Nếu user chọn "Skip", chỉ cần cập nhật state trong hook cha
      setParsedData(finalData);
      // Cập nhật file trong state để hiển thị tên file chính xác
      processDataForUpload([], selectedFile); // Gọi với mảng rỗng để chỉ cập nhật tên file
    }
  };



  // --- THAY ĐỔI CHÍNH Ở ĐÂY ---
  /**
   * Được gọi khi người dùng hoàn tất quá trình review trong DataReviewModal.
   * Xử lý dữ liệu và tự động chuyển sang bước tiếp theo.
   */
  const handleFinalizeFromModal = (finalData: Conference[]) => {
    setReviewModalOpen(false);
    if (!selectedFile) return;

    // Hàm này sẽ được gọi sau khi dữ liệu đã được xử lý xong
    const proceedToNextStep = () => {
      // Sử dụng setTimeout để đảm bảo state đã được cập nhật trước khi chuyển bước
      // Điều này giúp `canProceedToStep2` trong component cha có thời gian tính toán lại
      setTimeout(() => {
        onNext();
      }, 0);
    };

    if (importDecision) {
      // Nếu user chọn "Import to DB", gọi hàm để xử lý và upload
      // Hàm processDataForUpload đã bao gồm việc set state, nên chúng ta chỉ cần chờ nó xong
      processDataForUpload(finalData, selectedFile);
      // Việc chuyển bước sẽ được xử lý bởi useEffect bên dưới, khi isParsing=false và parsedData có dữ liệu
    } else {
      // Nếu user chọn "Skip", chỉ cần cập nhật state
      setParsedData(finalData);
      // Sau khi set state, gọi hàm để chuyển bước
      proceedToNextStep();
    }
  };

  // Thêm useEffect để xử lý chuyển bước tự động cho trường hợp "Import to DB"
  useEffect(() => {
    // Điều kiện: Đã chọn import, API không còn chạy, và đã có dữ liệu được parse
    if (importDecision && !isParsing && parsedDataLength > 0) {
      // Đảm bảo rằng chúng ta chỉ chuyển bước một lần sau khi API hoàn tất
      // Bằng cách kiểm tra xem modal review có đang mở không (nó vừa được đóng)
      if (!isReviewModalOpen) {
        onNext();
      }
    }
  }, [isParsing, parsedDataLength, importDecision, isReviewModalOpen, onNext]);


  /**
   * Xử lý khi người dùng đóng modal review giữa chừng.
   */
  const handleCloseReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedFile(null);
    setClientParsedData(null);
  };

  // Tính toán các trạng thái để hiển thị trên UI
  const isLoading = isParsing || isClientParsing;
  const currentError = parseError || clientParseError;
  const hasData = parsedDataLength > 0;
  const currentFile = selectedFile || file;

  return (
    <div className="space-y-6 rounded-lg border border-gray-200 p-6 bg-white shadow">
      <h3 className="text-lg font-medium leading-6 text-gray-900">{t('header.title')}</h3>
      <p className="text-sm text-gray-600">{t('header.description')}</p>

      <div className='flex items-center space-x-4'>
        <label className={`relative inline-flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100 ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}>
          <FaFileUpload className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          <span>
            {isLoading ? t('button.processing') : currentFile ? t('button.changeFile') : t('button.chooseFile')}
          </span>
          <input
            type='file'
            className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
            accept='.csv, text/csv'
            onChange={handleFileSelect}
            disabled={isLoading}
          />
        </label>
        {currentFile && !isLoading && (
          <span className='min-w-0 flex-shrink truncate text-sm text-gray-600' title={currentFile.name}>
            {currentFile.name}
          </span>
        )}
        {isLoading && <FaSpinner className='animate-spin text-blue-500' />}
      </div>

      {/* Hiển thị các thông báo trạng thái */}
      {currentError && (
        <p className='mt-2 flex items-center text-sm text-red-600'>
          <FaTimesCircle className='mr-1' /> {currentError}
        </p>
      )}
      {hasData && !isLoading && !currentError && (
        <p className='mt-2 flex items-center text-sm text-green-600'>
          <FaCheckCircle className='mr-1' /> {t('status.readyForNextStep', { count: parsedDataLength })}
        </p>
      )}
      {!hasData && currentFile && !isLoading && !currentError && (
        <p className='mt-2 flex items-center text-sm text-yellow-700'>
          <FaExclamationTriangle className='mr-1' /> {t('status.fileSelectedPrompt')}
        </p>
      )}
      {!currentFile && !isLoading && !currentError && (
        <p className="mt-2 text-sm text-gray-500">{t('status.selectFilePrompt')}</p>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('navigation.nextStep')}
        </button>
      </div>

      {/* Các Modals */}
      <ImportDatabaseConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleImportDecision(true)}
        onSkip={() => handleImportDecision(false)}
      />

      <DataReviewModal
        isOpen={isReviewModalOpen}
        onClose={handleCloseReviewModal}
        initialData={clientParsedData}
        isDbImport={importDecision}
        onFinalize={handleFinalizeFromModal} // Map vào prop onFinalize mới

      />
    </div>
  );
};

export default FileUploadStep;