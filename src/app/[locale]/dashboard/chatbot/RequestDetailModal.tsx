// src/app/[locale]/dashboard/chatbot/RequestDetailModal.tsx

// <<< SỬA LỖI: Đổi tên import để tránh xung đột nếu có >>>
import { AnalyzedChatbotRequest as ChatbotRequest } from "@/src/app/api/logAnalysis/logAnalysisChatbot.types";
import { FiX, FiClock, FiCpu, FiZap, FiWifiOff, FiCode } from 'react-icons/fi';

// Một component nhỏ để hiển thị thanh tiến trình phân bổ thời gian
const TimeBreakdownBar = ({ metrics }: { metrics: ChatbotRequest['serverMetrics'] }) => {
    const { 
        roundTripTime_ms, 
        totalServerDuration_ms, 
        prepDuration_ms, 
        aiCallDuration_ms, 
        postProcessingDuration_ms 
    } = metrics;

    // <<< SỬA LỖI: Kiểm tra tất cả các giá trị cần thiết trước khi tính toán >>>
    // Nếu thiếu bất kỳ chỉ số nào, không hiển thị thanh tiến trình.
    if (
        roundTripTime_ms === undefined || 
        totalServerDuration_ms === undefined ||
        prepDuration_ms === undefined ||
        aiCallDuration_ms === undefined ||
        postProcessingDuration_ms === undefined
    ) {
        return (
            <div className="text-xs text-gray-500 italic my-2">
                Performance breakdown is not available for this request.
            </div>
        );
    }

    // Từ đây trở đi, TypeScript biết rằng các biến này đều là `number`.
    const networkTime = Math.max(0, roundTripTime_ms - totalServerDuration_ms);
    
    // Để tránh chia cho 0 nếu roundTripTime_ms là 0
    const totalTime = roundTripTime_ms > 0 ? roundTripTime_ms : 1;

    const prepPercent = (prepDuration_ms / totalTime) * 100;
    const aiPercent = (aiCallDuration_ms / totalTime) * 100;
    const postPercent = (postProcessingDuration_ms / totalTime) * 100;
    const networkPercent = (networkTime / totalTime) * 100;

    return (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 my-2 flex overflow-hidden" title="Performance Breakdown">
            <div style={{ width: `${networkPercent}%` }} className="bg-gray-400" title={`Network & Queue: ${networkTime.toFixed(0)}ms`}></div>
            <div style={{ width: `${prepPercent}%` }} className="bg-blue-500" title={`Preparation: ${prepDuration_ms.toFixed(0)}ms`}></div>
            <div style={{ width: `${aiPercent}%` }} className="bg-purple-500" title={`AI Call: ${aiCallDuration_ms.toFixed(0)}ms`}></div>
            <div style={{ width: `${postPercent}%` }} className="bg-indigo-500" title={`Post-processing: ${postProcessingDuration_ms.toFixed(0)}ms`}></div>
        </div>
    );
};

export const RequestDetailModal = ({ request, onClose }: { request: ChatbotRequest, onClose: () => void }) => {
    // <<< SỬA LỖI: Tính toán networkTime một cách an toàn >>>
    const networkTime = (request.serverMetrics.roundTripTime_ms !== undefined && request.serverMetrics.totalServerDuration_ms !== undefined)
        ? Math.max(0, request.serverMetrics.roundTripTime_ms - request.serverMetrics.totalServerDuration_ms)
        : undefined;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Request Details</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                        <FiX size={24} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <p className="text-sm text-gray-500">Question</p>
                        <p className="font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">{request.question}</p>
                    </div>
                    {request.clientResponse && (
                        <div>
                            <p className="text-sm text-gray-500">AI Response</p>
                            <p className="bg-gray-100 dark:bg-gray-700 p-2 rounded whitespace-pre-wrap">{request.clientResponse}</p>
                        </div>
                    )}
                    {request.clientError && (
                         <div>
                            <p className="text-sm text-red-500">Client Error</p>
                            <p className="font-mono bg-red-100 dark:bg-red-900/50 p-2 rounded text-red-700 dark:text-red-300">{request.clientError}</p>
                        </div>
                    )}

                    <div className="pt-4">
                        <h4 className="font-semibold mb-2">Performance Breakdown</h4>
                        <TimeBreakdownBar metrics={request.serverMetrics} />
                        <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                            {/* <<< SỬA LỖI: Sử dụng Optional Chaining (?.) và Nullish Coalescing (??) để hiển thị an toàn >>> */}
                            <div className="flex items-center"><FiClock className="mr-2 text-yellow-500" /> Round-Trip: <strong>{request.serverMetrics.roundTripTime_ms?.toFixed(0) ?? 'N/A'}ms</strong></div>
                            <div className="flex items-center"><FiCpu className="mr-2 text-indigo-500" /> Total Server: <strong>{request.serverMetrics.totalServerDuration_ms?.toFixed(0) ?? 'N/A'}ms</strong></div>
                            <div className="flex items-center"><FiWifiOff className="mr-2 text-gray-500" /> Network/Queue: <strong>{networkTime?.toFixed(0) ?? 'N/A'}ms</strong></div>
                            <div className="flex items-center"><FiCode className="mr-2 text-blue-500" /> Preparation: <strong>{request.serverMetrics.prepDuration_ms?.toFixed(0) ?? 'N/A'}ms</strong></div>
                            <div className="flex items-center"><FiZap className="mr-2 text-purple-500" /> AI Call: <strong>{request.serverMetrics.aiCallDuration_ms?.toFixed(0) ?? 'N/A'}ms</strong></div>
                            <div className="flex items-center"><FiCode className="mr-2 text-indigo-500" /> Post-processing: <strong>{request.serverMetrics.postProcessingDuration_ms?.toFixed(0) ?? 'N/A'}ms</strong></div>
                        </div>
                    </div>

                    {request.aiCalls.length > 0 && (
                        <div className="pt-4">
                            <h4 className="font-semibold mb-2">AI Call Details</h4>
                            <ul className="space-y-2">
                                {request.aiCalls.map((call, index) => (
                                    <li key={index} className="p-2 bg-gray-100 dark:bg-gray-700 rounded">
                                        <p><strong>Turn {call.turn}:</strong> {call.duration_ms?.toFixed(0) ?? 'N/A'}ms</p>
                                        <p className="text-xs">Model: {call.actualModel} (Requested: {call.requestedModel})</p>
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