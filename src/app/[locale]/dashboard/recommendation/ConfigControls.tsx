'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FaSlidersH, FaSpinner, FaSave, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { appConfig } from '@/src/middleware';

const API_BASE_URL = appConfig.NEXT_PUBLIC_RECOMMENDATION_SYSTEM_URL;

// --- Định nghĩa Type cho cấu hình để đảm bảo an toàn kiểu ---
interface BehavioralWeights {
    search: number;
    view_detail: number;
    click: number;
    add_to_calendar: number;
    follow: number;
    blacklist: number;
}

interface PipelineConfig {
    NUM_CLUSTERS: number;
    NUM_INFLUENCERS: number;
    MUTIFACTOR_ALPHA: number;
    NUM_NEIGHBORS: number;
    EMBEDDING_BATCH_SIZE: number;
    USE_BEHAVIORAL_DATA: boolean;
    INCLUDE_SEARCH_BEHAVIOR: boolean;
    BEHAVIORAL_WEIGHTS: BehavioralWeights;
    BEHAVIORAL_SIM_WEIGHT: number;
    SCHEDULER_ENABLED: boolean;
}

// --- Component Bật/Tắt (Toggle Switch) ---
const ToggleSwitch = ({ label, checked, onChange, description }: { label: string, checked: boolean, onChange: (checked: boolean) => void, description: string }) => (
    <div className="flex items-center justify-between py-3">
        <div>
            <label className="font-medium text-gray-700">{label}</label>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
        <button
            type="button"
            className={`${checked ? 'bg-indigo-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            onClick={() => onChange(!checked)}
        >
            <span className={`${checked ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
        </button>
    </div>
);

// --- Component Input Số (ĐÃ CẬP NHẬT PADDING VÀ ROUNDED-MD) ---
const NumberInput = ({ label, value, onChange, description, min, max, step }: { label: string, value: number, onChange: (value: number) => void, description: string, min?: number, max?: number, step?: number }) => (
    <div className="py-3">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <p className="text-sm text-gray-500 mb-2">{description}</p>
        <input
            type="number"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            min={min}
            max={max}
            step={step}
            // THAY ĐỔI Ở ĐÂY: Thêm 'p-2' và chỉnh sửa 'rounded-md'
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
        />
    </div>
);

export default function ConfigControls() {
    const [config, setConfig] = useState<PipelineConfig | null>(null);
    const [initialConfig, setInitialConfig] = useState<PipelineConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const fetchConfig = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/config`);
            if (!response.ok) throw new Error('Failed to fetch configuration');
            const data = await response.json();
            setConfig(data);
            setInitialConfig(data); // Lưu trạng thái ban đầu để so sánh
        } catch (error) {
            console.error(error);
            toast.error('Could not load pipeline configuration.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    const handleSave = async () => {
        if (!config) return;
        setIsSaving(true);
        try {
            const response = await fetch(`${API_BASE_URL}/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Failed to save configuration');
            toast.success(data.message || 'Configuration saved successfully!');
            setInitialConfig(config); // Cập nhật trạng thái ban đầu sau khi lưu thành công
        } catch (error: any) {
            toast.error(`Error: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (key: keyof PipelineConfig, value: any) => {
        setConfig(prev => prev ? { ...prev, [key]: value } : null);
    };

    const handleWeightChange = (weightKey: keyof BehavioralWeights, value: number) => {
        setConfig(prev => {
            if (!prev) return null;
            return {
                ...prev,
                BEHAVIORAL_WEIGHTS: {
                    ...prev.BEHAVIORAL_WEIGHTS,
                    [weightKey]: value,
                },
            };
        });
    };

    if (isLoading) {
        return <div className="text-center py-10"><FaSpinner className="animate-spin text-3xl text-gray-400 mx-auto" /></div>;
    }

    if (!config) {
        return <div className="text-center py-10 text-red-500">Failed to load configuration.</div>;
    }

    const isChanged = JSON.stringify(config) !== JSON.stringify(initialConfig);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaSlidersH className="mr-3 text-indigo-500" />
                Pipeline Configuration
            </h2>
            <div className="space-y-6 divide-y divide-gray-200">
                {/* --- Phần Core Parameters --- */}
                <div className="pt-6">
                    <h3 className="text-lg font-medium text-gray-900">Core Parameters</h3>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <NumberInput label="Number of Clusters" value={config.NUM_CLUSTERS} onChange={v => handleChange('NUM_CLUSTERS', v)} description="Groups users into N clusters." min={2} />
                        <NumberInput label="Number of Influencers" value={config.NUM_INFLUENCERS} onChange={v => handleChange('NUM_INFLUENCERS', v)} description="Top N active users for similarity calculation." min={10} />
                        <NumberInput label="Number of Neighbors (K)" value={config.NUM_NEIGHBORS} onChange={v => handleChange('NUM_NEIGHBORS', v)} description="Top K similar users for prediction." min={5} />
                        <NumberInput label="Embedding Batch Size" value={config.EMBEDDING_BATCH_SIZE} onChange={v => handleChange('EMBEDDING_BATCH_SIZE', v)} description="Batch size for Gemini API calls." min={1} />
                    </div>
                </div>

                {/* --- Phần Behavioral Model --- */}
                <div className="pt-6">
                    <h3 className="text-lg font-medium text-gray-900">Behavioral Model</h3>
                    <ToggleSwitch label="Use Behavioral Data" checked={config.USE_BEHAVIORAL_DATA} onChange={v => handleChange('USE_BEHAVIORAL_DATA', v)} description="Include implicit feedback (saves, shares, etc.) in similarity." />
                    {config.USE_BEHAVIORAL_DATA && (
                        <div className="pl-4 mt-4 border-l-2 border-indigo-200 space-y-4">
                            <ToggleSwitch label="Include Search Behavior" checked={config.INCLUDE_SEARCH_BEHAVIOR} onChange={v => handleChange('INCLUDE_SEARCH_BEHAVIOR', v)} description="Factor in user search results." />
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Behavioral Similarity Weight</label>
                                <p className="text-sm text-gray-500 mb-2">How much behavioral similarity impacts the final score (0 to 1).</p>
                                <div className="flex items-center gap-4">
                                    <input type="range" min="0" max="1" step="0.05" value={config.BEHAVIORAL_SIM_WEIGHT} onChange={e => handleChange('BEHAVIORAL_SIM_WEIGHT', parseFloat(e.target.value))} className="w-full" />
                                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{config.BEHAVIORAL_SIM_WEIGHT.toFixed(2)}</span>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800 mb-2">Behavioral Weights</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {Object.entries(config.BEHAVIORAL_WEIGHTS).map(([key, value]) => (
                                        <div key={key}>
                                            <label className="capitalize text-sm font-medium text-gray-600">{key.replace('_', ' ')}</label>
                                            {/* THAY ĐỔI Ở ĐÂY: Thêm 'p-2' và chỉnh sửa 'rounded-md' */}
                                            <input type="number" step="0.1" value={value} onChange={e => handleWeightChange(key as keyof BehavioralWeights, parseFloat(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- Phần General --- */}
                <div className="pt-6">
                    <h3 className="text-lg font-medium text-gray-900">General</h3>
                    <ToggleSwitch label="Enable Scheduler" checked={config.SCHEDULER_ENABLED} onChange={v => handleChange('SCHEDULER_ENABLED', v)} description="Automatically run the pipeline nightly. Changes require an API restart to take full effect." />
                </div>
            </div>

            {/* --- Nút Lưu --- */}
            <div className="mt-8 pt-5 border-t border-gray-200">
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !isChanged}
                        className="w-full md:w-auto flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isSaving ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
