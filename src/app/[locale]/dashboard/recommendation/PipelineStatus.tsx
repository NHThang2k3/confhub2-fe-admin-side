// src/app/[locale]/dashboard/recommendation/PipelineStatus.tsx
'use client';

// import React, { useEffect, useRef } from 'react'; // --- THAY ĐỔI 1: Không cần import useEffect và useRef nữa
import React from 'react'; // --- THAY ĐỔI 1: Chỉ cần import React
import { FaCheckCircle, FaExclamationTriangle, FaSpinner, FaClock, FaArrowRight } from 'react-icons/fa';
import { useTranslations } from 'next-intl';
import ProgressBar from './ProgressBar';

interface PipelineStatusProps {
    statusData: any;
}

const PipelineStatus: React.FC<PipelineStatusProps> = ({ statusData }) => {
    const t = useTranslations('RecommendationAdmin');
    // const logsEndRef = useRef<null | HTMLDivElement>(null); // --- THAY ĐỔI 2: Xóa dòng này

    /* --- THAY ĐỔI 3: Xóa toàn bộ khối useEffect này ---
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [statusData?.last_run?.logs]);
    */

    if (!statusData) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex items-center justify-center min-h-[200px]">
                <FaSpinner className="animate-spin text-gray-400 text-2xl" />
                <p className="ml-4 text-gray-500">{t('statusLoading')}</p>
            </div>
        );
    }

    const { is_running, last_run } = statusData;
    const progress = last_run?.progress;
    const lastRunTime = last_run.timestamp ? new Date(last_run.timestamp * 1000).toLocaleString() : 'N/A';
    const modelType = last_run.similarity_model || 'N/A';
    const adminActionRequired = last_run?.admin_action_required;

    const getStatusIcon = () => {
        if (is_running) return <FaSpinner className="animate-spin text-blue-500" />;
        if (last_run.status === 'success') return <FaCheckCircle className="text-green-500" />;
        if (last_run.status === 'error') return <FaExclamationTriangle className="text-red-500" />;
        return <FaClock className="text-gray-500" />;
    };

    const renderLogLine = (line: string, index: number) => {
        let icon: React.ReactNode = <FaArrowRight className="text-gray-500 mr-2 flex-shrink-0" />;
        let style = "text-gray-300";

        if (line.includes('✅') || line.includes('SUCCESS')) {
            icon = <FaCheckCircle className="text-green-400 mr-2 flex-shrink-0" />;
            style = "text-green-300 font-semibold";
        } else if (line.includes('❌') || line.includes('ERROR')) {
            icon = <FaExclamationTriangle className="text-red-400 mr-2 flex-shrink-0" />;
            style = "text-red-300 font-bold";
        } else if (line.includes('🚀')) {
            icon = <span className="mr-2">🚀</span>;
            style = "text-cyan-300 font-bold";
        } else if (line.includes('--- Step')) {
            icon = <span className="mr-2">🔹</span>;
            style = "text-yellow-300 mt-2";
        } else if (line.includes('⏩')) {
            icon = <span className="mr-2">⏩</span>;
            style = "text-gray-400 italic";
        } else if (line.includes('🎉')) {
            icon = <span className="mr-2">🎉</span>;
            style = "text-green-300 font-bold";
        }

        return (
            <div key={index} className={`flex items-start ${style}`}>
                {icon}
                <span className="whitespace-pre-wrap">{line.replace(/✅|❌|🚀|⏩|🔹|🎉/g, '').trim()}</span>
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('statusTitle')}</h2>

            {adminActionRequired === 'EMBEDDING_INCOMPLETE' && (
                <div className="mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md">
                    <div className="flex items-center">
                        <FaExclamationTriangle className="text-yellow-500 mr-3 text-xl" />
                        <div>
                            <p className="font-bold">{t('statusPausedTitle')}</p>
                            <p className="text-sm">{t('statusPausedMessage')}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center space-x-4 mb-4">
                <div className="text-2xl">{getStatusIcon()}</div>
                <div>
                    <p className="font-medium text-gray-700">
                        {is_running ? t('statusInProgress') : `${t('statusLastRun')}: ${last_run.status}`}
                    </p>
                    <p className="text-sm text-gray-500">
                        {is_running ? `${t('statusModel')}: ${modelType}` : `${t('statusFinishedAt')}: ${lastRunTime}`}
                    </p>
                </div>
            </div>

            {progress?.is_active && (
                <ProgressBar progress={progress} />
            )}

            <div className="mt-4">
                <h3 className="font-semibold text-gray-700 mb-2">{t('logsTitle')}</h3>
                <div className="bg-gray-900 text-white text-sm p-4 rounded-md h-96 overflow-y-auto font-mono space-y-1">
                    {last_run.logs && last_run.logs.length > 0
                        ? last_run.logs.map(renderLogLine)
                        : <p className="text-gray-400 italic">{t('logsNotAvailable')}</p>}
                    {/* --- THAY ĐỔI 4: Xóa ref={logsEndRef} khỏi div này --- */}
                    <div />
                </div>
            </div>
        </div>
    );
};

export default PipelineStatus;