import { ChatbotLogAnalysisResult } from "@/src/app/api/logAnalysis/logAnalysisChatbot.types";
import { FiCheckCircle, FiXCircle, FiClock, FiCpu, FiMessageSquare, FiZap, FiChevronsRight } from 'react-icons/fi';

interface SummaryCardProps {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    unit?: string;
    color: string;
}

const Card = ({ icon, title, value, unit, color }: SummaryCardProps) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white">
                {value} <span className="text-sm font-normal">{unit}</span>
            </p>
        </div>
    </div>
);

export const SummaryCards = ({ summary }: { summary: ChatbotLogAnalysisResult['summary'] }) => {
    const totalRequests = summary.successCount + summary.errorCount + summary.timeoutCount + summary.incompleteCount;
    const successRate = totalRequests > 0 ? ((summary.successCount / totalRequests) * 100).toFixed(1) : 'N/A';

    return (
        // <<< SỬA ĐỔI LAYOUT >>>
        <div className="space-y-4">
            {/* Hàng 1: Các chỉ số tổng quan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card icon={<FiCheckCircle size={24} />} title="Success Rate" value={`${successRate}`} unit="%" color="bg-green-100 text-green-600 dark:bg-green-900/50" />
                <Card icon={<FiXCircle size={24} />} title="Errors / Timeouts" value={`${summary.errorCount} / ${summary.timeoutCount}`} color="bg-red-100 text-red-600 dark:bg-red-900/50" />
                <Card icon={<FiMessageSquare size={24} />} title="Total Requests" value={totalRequests} color="bg-blue-100 text-blue-600 dark:bg-blue-900/50" />
                <Card icon={<FiClock size={24} />} title="Avg. Round-Trip" value={summary.averageResponseTime_ms.toFixed(0)} unit="ms" color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50" />
            </div>
            {/* Hàng 2: Các chỉ số thời gian chi tiết */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card icon={<FiCpu size={24} />} title="Avg. Server Time" value={summary.averageServerTime_ms.toFixed(0)} unit="ms" color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50" />
                <Card icon={<FiChevronsRight size={24} />} title="Avg. TTFT" value={summary.averageTimeToFirstToken_ms.toFixed(0)} unit="ms" color="bg-teal-100 text-teal-600 dark:bg-teal-900/50" />
                <Card icon={<FiZap size={24} />} title="Avg. AI Stream" value={summary.averageAiTime_ms.toFixed(0)} unit="ms" color="bg-purple-100 text-purple-600 dark:bg-purple-900/50" />
            </div>
        </div>
    );
};