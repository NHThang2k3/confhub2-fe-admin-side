import { AnalyzedChatbotRequest } from "@/src/app/api/logAnalysis/logAnalysisChatbot.types";
import { FiEye } from 'react-icons/fi';

const StatusBadge = ({ status }: { status: AnalyzedChatbotRequest['status'] }) => {
    const styles = {
        SUCCESS: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        ERROR: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        TIMEOUT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        INCOMPLETE: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{status}</span>;
};

export const RequestsTable = ({ requests, onViewDetails }: { requests: AnalyzedChatbotRequest[], onViewDetails: (req: AnalyzedChatbotRequest) => void }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-20 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Start Time</th>
                            <th scope="col" className="px-6 py-3">Question</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Model</th>
                            <th scope="col" className="px-6 py-3 text-right">Round-Trip (ms)</th>
                            <th scope="col" className="px-6 py-3 text-right">Server (ms)</th>
                            <th scope="col" className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((req) => (
                            <tr key={req.requestId} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-20 dark:hover:bg-gray-600">
                                <td className="px-6 py-4">{new Date(req.startTime).toLocaleString()}</td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white max-w-xs truncate">{req.question}</td>
                                <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                                <td className="px-6 py-4">{req.clientRequestedModel || 'default'}</td>
                                <td className="px-6 py-4 text-right">{req.serverMetrics.roundTripTime_ms?.toFixed(0) ?? 'N/A'}</td>
                                <td className="px-6 py-4 text-right">{req.serverMetrics.totalServerDuration_ms?.toFixed(0) ?? 'N/A'}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => onViewDetails(req)} className="text-blue-600 hover:text-blue-800">
                                        <FiEye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};