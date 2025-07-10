import { AnalyzedChatbotRequest } from "@/src/app/api/logAnalysis/logAnalysisChatbot.types";
import { FiX, FiClock, FiCpu, FiZap, FiWifiOff, FiCode, FiChevronsRight } from 'react-icons/fi'; // Thêm icon mới

/**
 * Component hiển thị thanh tiến trình phân bổ thời gian.
 */
const TimeBreakdownBar = ({ metrics }: { metrics: AnalyzedChatbotRequest['serverMetrics'] }) => {
    const { 
        roundTripTime_ms, 
        totalServerDuration_ms, 
        prepDuration_ms, 
        aiTotalStreamDuration_ms, // <<< SỬA ĐỔI: Dùng tên mới
        postProcessingDuration_ms 
    } = metrics;

    // Kịch bản 1: Có đầy đủ dữ liệu từ client và server
    if (
        roundTripTime_ms !== undefined && 
        totalServerDuration_ms !== undefined &&
        prepDuration_ms !== undefined &&
        aiTotalStreamDuration_ms !== undefined && // <<< SỬA ĐỔI: Dùng tên mới
        postProcessingDuration_ms !== undefined
    ) {
        const networkTime = Math.max(0, roundTripTime_ms - totalServerDuration_ms);
        const totalTime = roundTripTime_ms > 0 ? roundTripTime_ms : 1;

        const prepPercent = (prepDuration_ms / totalTime) * 100;
        const aiPercent = (aiTotalStreamDuration_ms / totalTime) * 100; // <<< SỬA ĐỔI: Dùng tên mới
        const postPercent = (postProcessingDuration_ms / totalTime) * 100;
        const networkPercent = (networkTime / totalTime) * 100;

        return (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 my-2 flex overflow-hidden" title="Full Performance Breakdown">
                <div style={{ width: `${networkPercent}%` }} className="bg-gray-400" title={`Network & Queue: ${networkTime.toFixed(0)}ms`}></div>
                <div style={{ width: `${prepPercent}%` }} className="bg-blue-500" title={`Preparation: ${prepDuration_ms.toFixed(0)}ms`}></div>
                <div style={{ width: `${aiPercent}%` }} className="bg-purple-500" title={`AI Stream Duration: ${aiTotalStreamDuration_ms.toFixed(0)}ms`}></div>
                <div style={{ width: `${postPercent}%` }} className="bg-indigo-500" title={`Post-processing: ${postProcessingDuration_ms.toFixed(0)}ms`}></div>
            </div>
        );
    }
    // Kịch bản 2: Chỉ có dữ liệu từ server (request INCOMPLETE)
    else if (
        totalServerDuration_ms !== undefined &&
        prepDuration_ms !== undefined &&
        aiTotalStreamDuration_ms !== undefined && // <<< SỬA ĐỔI: Dùng tên mới
        postProcessingDuration_ms !== undefined
    ) {
        const totalTime = totalServerDuration_ms > 0 ? totalServerDuration_ms : 1;
        const prepPercent = (prepDuration_ms / totalTime) * 100;
        const aiPercent = (aiTotalStreamDuration_ms / totalTime) * 100; // <<< SỬA ĐỔI: Dùng tên mới
        const postPercent = (postProcessingDuration_ms / totalTime) * 100;

        return (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 my-2 flex overflow-hidden" title="Server-side Performance Breakdown">
                <div style={{ width: `${prepPercent}%` }} className="bg-blue-500" title={`Preparation: ${prepDuration_ms.toFixed(0)}ms`}></div>
                <div style={{ width: `${aiPercent}%` }} className="bg-purple-500" title={`AI Stream Duration: ${aiTotalStreamDuration_ms.toFixed(0)}ms`}></div>
                <div style={{ width: `${postPercent}%` }} className="bg-indigo-500" title={`Post-processing: ${postProcessingDuration_ms.toFixed(0)}ms`}></div>
            </div>
        );
    }
    // Kịch bản 3: Không đủ dữ liệu để hiển thị
    else {
        return (
            <div className="text-xs text-gray-500 italic my-2">
                Performance breakdown is not available for this request.
            </div>
        );
    }
};

export const RequestDetailModal = ({ request, onClose }: { request: AnalyzedChatbotRequest, onClose: () => void }) => {
    const networkTime = (request.serverMetrics.roundTripTime_ms !== undefined && request.serverMetrics.totalServerDuration_ms !== undefined)
        ? Math.max(0, request.serverMetrics.roundTripTime_ms - request.serverMetrics.totalServerDuration_ms)
        : undefined;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Request Details</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                        <FiX size={24} />
                    </button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Question</p>
                        <p className="font-mono bg-gray-100 dark:bg-gray-900/50 p-3 rounded-md text-gray-800 dark:text-gray-200">{request.question}</p>
                    </div>
                    {request.clientResponse && (
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">AI Response</p>
                            <p className="bg-gray-100 dark:bg-gray-900/50 p-3 rounded-md whitespace-pre-wrap text-gray-800 dark:text-gray-200">{request.clientResponse}</p>
                        </div>
                    )}
                    {request.clientError && (
                         <div>
                            <p className="text-sm text-red-500 mb-1">Client Error</p>
                            <p className="font-mono bg-red-100 dark:bg-red-900/50 p-3 rounded-md text-red-700 dark:text-red-300">{request.clientError}</p>
                        </div>
                    )}

                    <div className="pt-2">
                        <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Performance Breakdown</h4>
                        <TimeBreakdownBar metrics={request.serverMetrics} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm mt-3 text-gray-600 dark:text-gray-300">
                            <div className="flex items-center"><FiClock className="mr-2 text-yellow-500" /> Round-Trip: <strong className="ml-auto font-semibold text-gray-800 dark:text-white">{request.serverMetrics.roundTripTime_ms?.toFixed(0) ?? 'N/A'} ms</strong></div>
                            <div className="flex items-center"><FiCpu className="mr-2 text-indigo-500" /> Total Server: <strong className="ml-auto font-semibold text-gray-800 dark:text-white">{request.serverMetrics.totalServerDuration_ms?.toFixed(0) ?? 'N/A'} ms</strong></div>
                            <div className="flex items-center"><FiWifiOff className="mr-2 text-gray-500" /> Network/Queue: <strong className="ml-auto font-semibold text-gray-800 dark:text-white">{networkTime?.toFixed(0) ?? 'N/A'} ms</strong></div>
                            <div className="flex items-center"><FiCode className="mr-2 text-blue-500" /> Preparation: <strong className="ml-auto font-semibold text-gray-800 dark:text-white">{request.serverMetrics.prepDuration_ms?.toFixed(0) ?? 'N/A'} ms</strong></div>
                            
                            {/* <<< THÊM MỚI: Hiển thị TTFT >>> */}
                            <div className="flex items-center"><FiChevronsRight className="mr-2 text-teal-500" /> Time to First Token: <strong className="ml-auto font-semibold text-gray-800 dark:text-white">{request.serverMetrics.timeToFirstToken_ms?.toFixed(0) ?? 'N/A'} ms</strong></div>
                            
                            {/* <<< SỬA ĐỔI: Đổi tên và dùng giá trị mới >>> */}
                            <div className="flex items-center"><FiZap className="mr-2 text-purple-500" /> AI Stream Duration: <strong className="ml-auto font-semibold text-gray-800 dark:text-white">{request.serverMetrics.aiTotalStreamDuration_ms?.toFixed(0) ?? 'N/A'} ms</strong></div>
                            
                            <div className="flex items-center col-span-full sm:col-span-2"><FiCode className="mr-2 text-indigo-500" /> Post-processing: <strong className="ml-auto font-semibold text-gray-800 dark:text-white">{request.serverMetrics.postProcessingDuration_ms?.toFixed(0) ?? 'N/A'} ms</strong></div>
                        </div>
                    </div>

                    {request.aiCalls.length > 0 && (
                        <div className="pt-2">
                            <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">AI Call Details</h4>
                            <ul className="space-y-2">
                                {request.aiCalls.map((call, index) => (
                                    <li key={index} className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-md">
                                        <div className="flex justify-between items-center font-semibold">
                                            <span>Turn {call.turn}</span>
                                            <span className="text-purple-600 dark:text-purple-400">{call.duration_ms?.toFixed(0) ?? 'N/A'} ms</span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Model: {call.actualModel} (Requested: {call.requestedModel})</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};