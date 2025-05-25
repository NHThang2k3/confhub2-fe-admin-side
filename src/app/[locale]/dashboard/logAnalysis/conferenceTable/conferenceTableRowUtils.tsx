import React from 'react';
import { FaExclamationTriangle, FaWrench, FaInfoCircle, FaBug, FaNetworkWired, FaCloud, FaCodeBranch, FaFileAlt, FaShieldAlt, FaCog, FaExternalLinkAlt, FaQuestionCircle, FaCheckCircle } from 'react-icons/fa';
import { DataQualityInsight, LogError } from '@/src/models/logAnalysis';

/**
 * Lấy class CSS cho độ nghiêm trọng của insight.
 * @param severity - Độ nghiêm trọng của insight.
 * @returns Chuỗi class CSS.
 */
export const getSeverityClass = (severity?: 'Low' | 'Medium' | 'High'): string => {
  switch (severity) {
    case 'High': return 'text-red-600 bg-red-100 border-red-300';
    case 'Medium': return 'text-amber-600 bg-amber-100 border-amber-300';
    case 'Low': return 'text-blue-600 bg-blue-100 border-blue-300';
    default: return 'text-gray-600 bg-gray-100 border-gray-300';
  }
};

/**
 * Lấy icon tương ứng với loại insight.
 * @param type - Loại insight.
 * @returns React element (icon).
 */
export const getInsightIcon = (type: DataQualityInsight['insightType']) => {
  switch (type) {
    case 'ValidationWarning': return <FaExclamationTriangle className="mr-1.5 inline-block text-amber-600" />;
    case 'NormalizationApplied': return <FaWrench className="mr-1.5 inline-block text-sky-600" />;
    case 'DataCorrection': return <FaInfoCircle className="mr-1.5 inline-block text-purple-600" />;
    default: return <FaInfoCircle className="mr-1.5 inline-block text-gray-500" />;
  }
};

/**
 * Parse chuỗi lỗi JSON từ link processing.
 * @param errorString - Chuỗi lỗi JSON.
 * @returns Đối tượng lỗi đã parse hoặc null nếu lỗi.
 */
export const parseLinkError = (errorString: string) => {
  try {
    const errorObj = JSON.parse(errorString);
    return {
      level: errorObj.level,
      time: errorObj.time,
      batchRequestId: errorObj.batchRequestId,
      route: errorObj.route,
      service: errorObj.service,
      // Thêm các trường khác nếu có trong JSON lỗi thực tế
    };
  } catch (e) {
    return null;
  }
};

/**
 * Lấy icon và màu sắc cho từng loại lỗi, có tính đến trạng thái recovered.
 * @param error - Đối tượng lỗi LogError.
 * @returns Đối tượng chứa icon, màu chữ, màu nền, màu viền.
 */
export const getErrorDisplayProps = (error: LogError) => {
  let icon = <FaQuestionCircle className="mr-1.5 text-red-700" />;
  let textColor = 'text-red-700';
  let bgColor = 'bg-red-100';
  let borderColor = 'border-red-300';

  if (error.isRecovered) {
    icon = <FaCheckCircle className="mr-1.5 text-green-700" />;
    textColor = 'text-green-700';
    bgColor = 'bg-green-50';
    borderColor = 'border-green-200';
  } else {
    switch (error.errorType) {
      case 'DataParsing': icon = <FaBug className="mr-1.5 text-red-700" />; break;
      case 'Network': icon = <FaNetworkWired className="mr-1.5 text-red-700" />; break;
      case 'APIQuota': icon = <FaCloud className="mr-1.5 text-red-700" />; break;
      case 'Logic': icon = <FaCodeBranch className="mr-1.5 text-red-700" />; break;
      case 'FileSystem': icon = <FaFileAlt className="mr-1.5 text-red-700" />; break;
      case 'SafetyBlock': icon = <FaShieldAlt className="mr-1.5 text-red-700" />; break;
      case 'Configuration': icon = <FaCog className="mr-1.5 text-red-700" />; break;
      case 'ThirdPartyAPI': icon = <FaExternalLinkAlt className="mr-1.5 text-red-700" />; break;
      case 'Unknown':
      default: icon = <FaQuestionCircle className="mr-1.5 text-red-700" />; break;
    }
  }
  return { icon, textColor, bgColor, borderColor };
};

// Helper để xác định số cột cho expanded view
export const getExpandedGridColumnsClass = ({
  hasPreviewData,
  hasErrorsOrLinkFailures,
  hasDataQualityOrStepDetails
}: {
  hasPreviewData: boolean;
  hasErrorsOrLinkFailures: boolean;
  hasDataQualityOrStepDetails: boolean;
}): string => {
  const activeColumnCount = [hasPreviewData, hasErrorsOrLinkFailures, hasDataQualityOrStepDetails].filter(Boolean).length;

  if (activeColumnCount === 3) {
    return 'md:grid-cols-[2fr_2fr_1fr]';
  } else if (activeColumnCount === 2) {
    if (hasPreviewData && hasDataQualityOrStepDetails && !hasErrorsOrLinkFailures) {
      return 'md:grid-cols-[2fr_1fr]';
    } else if (hasErrorsOrLinkFailures && hasDataQualityOrStepDetails && !hasPreviewData) {
      return 'md:grid-cols-[2fr_1fr]';
    } else {
      return 'md:grid-cols-2';
    }
  } else if (activeColumnCount === 1) {
    return 'md:grid-cols-1';
  }
  return 'md:grid-cols-1';
};