// src/components/dashboard/recommendation/PipelineControls.tsx
'use client';

import React, { useState } from 'react';
import { FaPlay, FaSyncAlt, FaArrowRight, FaExclamationTriangle } from 'react-icons/fa'; // Thêm icon
import { useTranslations } from 'next-intl';

interface PipelineControlsProps {
    isRunning: boolean;
    onRunPipeline: (options: any) => void;
    adminActionRequired: string | null; // <--- Thêm prop mới
}

const PipelineControls: React.FC<PipelineControlsProps> = ({ isRunning, onRunPipeline, adminActionRequired }) => {
    const t = useTranslations('RecommendationAdmin');

    const [modelType, setModelType] = useState('mutifactor');
    const [forceRerun, setForceRerun] = useState(false);
    const [stepsToRun, setStepsToRun] = useState<string[]>([]);

    const handleStepToggle = (step: string) => {
        setStepsToRun(prev =>
            prev.includes(step) ? prev.filter(s => s !== step) : [...prev, step]
        );
    };

    const handleSubmit = () => {
        onRunPipeline({
            model_type: modelType, // Backend server.py uses 'model_type'
            force_rerun: forceRerun,
            steps_to_run: forceRerun ? [] : stepsToRun,
        });
    };

     const handleResumeEmbedding = () => {
        onRunPipeline({
            model_type: modelType,
            force_rerun: false,
            steps_to_run: ['embedding'],
        });
    };

    const handleProceedAnyway = () => {
        onRunPipeline({
            model_type: modelType,
            force_rerun: false,
            // Chạy các bước còn lại sau embedding
            steps_to_run: ['similarity', 'prediction'],
        });
    };

    const pipelineSteps = ['clustering', 'similarity', 'prediction'];

    // --- RENDER LOGIC MỚI ---
    if (adminActionRequired === 'EMBEDDING_INCOMPLETE') {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md border border-yellow-400">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                    <FaExclamationTriangle className="text-yellow-500 mr-2" />
                    {t('actionRequiredTitle')}
                </h2>
                <p className="text-sm text-gray-600 mb-4">{t('actionRequiredDescription')}</p>
                <div className="space-y-3">
                    <button
                        onClick={handleResumeEmbedding}
                        disabled={isRunning && !adminActionRequired}
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400"
                    >
                        <FaSyncAlt className="mr-2" />
                        {t('resumeEmbeddingButton')}
                    </button>
                    <button
                        onClick={handleProceedAnyway}
                        disabled={isRunning && !adminActionRequired}
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 disabled:bg-gray-400"
                    >
                        <FaArrowRight className="mr-2" />
                        {t('proceedAnywayButton')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('runPipelineTitle')}</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('modelTypeLabel')}</label>
                    <select
                        value={modelType}
                        onChange={(e) => setModelType(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        disabled={isRunning}
                    >
                        <option value="mutifactor">{t('modelTypeMutifactor')}</option>
                        <option value="pearson">{t('modelTypePearson')}</option>
                    </select>
                </div>

                <div className="border-t border-b border-gray-200 py-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">{t('embeddingStepTitle')}</h3>
                    <p className="text-xs text-gray-500 mb-3">{t('embeddingStepDescription')}</p>
                    <button
                        onClick={handleResumeEmbedding}
                        disabled={isRunning}
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <FaSyncAlt className="mr-2" />
                        {t('resumeEmbeddingButton')}
                    </button>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">{t('rerunSectionTitle')}</h3>
                    <div className="flex items-center">
                        <input
                            id="force-rerun"
                            type="checkbox"
                            checked={forceRerun}
                            onChange={(e) => {
                                setForceRerun(e.target.checked);
                                if (e.target.checked) {
                                    setStepsToRun([]); // Clear specific steps if full force is selected
                                }
                            }}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            disabled={isRunning}
                        />
                        <label htmlFor="force-rerun" className="ml-2 block text-sm text-gray-900">
                            {t('forceFullRerunLabel')}
                        </label>
                    </div>
                </div>

                {!forceRerun && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('forceSpecificStepsLabel')}</label>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                            {pipelineSteps.map(step => (
                                <div key={step} className="flex items-center">
                                    <input
                                        id={`step-${step}`}
                                        type="checkbox"
                                        checked={stepsToRun.includes(step)}
                                        onChange={() => handleStepToggle(step)}
                                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        disabled={isRunning}
                                    />
                                    <label htmlFor={`step-${step}`} className="ml-2 block text-sm text-gray-900 capitalize">
                                        {step}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={isRunning || (stepsToRun.length === 0 && !forceRerun)}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <FaPlay className="mr-2" />
                    {isRunning ? t('runButtonInProgress') : t('runButtonIdle')}
                </button>
            </div>
        </div>
    );
};

export default PipelineControls;