import React from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { RequestTimings } from '@/src/models/logAnalysis';
import { FaLink } from 'react-icons/fa';

interface RequestsTableProps {
    requestIds: string[];
    requestsData: { [key: string]: RequestTimings };
    onSelectRequest: (requestId: string) => void;
    formatDateTime: (isoString: string | null | undefined) => string;
    getStatusChipClass: (status: string | undefined | null) => string;
}

const RequestsTable: React.FC<RequestsTableProps> = ({
    requestIds,
    requestsData,
    onSelectRequest,
    formatDateTime,
    getStatusChipClass,
}) => {
    if (!requestIds || requestIds.length === 0) {
        return null; // NoData message handled by parent
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg shadow-sm">
                <thead className="bg-gray-5">
                    <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Request ID
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Original Request ID
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Start Time
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            End Time
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Duration
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {requestIds.map((reqId) => {
                        const details = requestsData[reqId];
                        return (
                            <tr key={reqId} className="hover:bg-gray-5 transition-colors duration-150">
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 break-all">
                                    {reqId}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 break-all">
                                    {details?.originalRequestId ? (
                                        <button
                                            onClick={() => onSelectRequest(details.originalRequestId!)} // Thêm ! để khẳng định originalRequestId tồn tại trong ngữ cảnh này
                                            className="text-indigo-600 hover:text-indigo-900 hover:underline focus:outline-none flex items-center"
                                            title={`View details for original request: ${details.originalRequestId}`}
                                            aria-label={`View details for original request ID ${details.originalRequestId}`}
                                        >
                                            <FaLink className="mr-1.5 h-3 w-3 text-indigo-500" />
                                            {details.originalRequestId}
                                        </button>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                    {details ? formatDateTime(details.startTime) : 'N/A'}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                    {details ? formatDateTime(details.endTime) : 'N/A'}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                    {details && details.durationSeconds != null ? `${details.durationSeconds.toFixed(2)}s` : 'N/A'}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    {details && details.status ? (
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusChipClass(details.status)}`}>
                                            {details.status}
                                        </span>
                                    ) : <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusChipClass(null)}`}>Unknown</span>}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => onSelectRequest(reqId)}
                                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                                        aria-label={`View details for request ${reqId}`}
                                    >
                                        View Details <FaExternalLinkAlt className="ml-1.5 h-3 w-3" />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default RequestsTable;