'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import PipelineStatus from '@/src/app/[locale]/dashboard/recommendation/PipelineStatus';
import PipelineControls from '@/src/app/[locale]/dashboard/recommendation/PipelineControls';
import { toast } from 'react-toastify';
import { appConfig } from '@/src/middleware';
import ArtifactSummary from '@/src/app/[locale]/dashboard/recommendation/ArtifactSummary';
import UserDetails from '@/src/app/[locale]/dashboard/recommendation/UserDetails';
import SchedulerControls from '@/src/app/[locale]/dashboard/recommendation/SchedulerControls';
// THÊM MỚI: Import component ConfigControls
import ConfigControls from '@/src/app/[locale]/dashboard/recommendation/ConfigControls';

// THÊM MỚI: Import icons cho các tab
import { FaCogs, FaClock, FaBoxOpen, FaUser, FaSlidersH } from 'react-icons/fa'; // Thêm FaSlidersH

const API_BASE_URL = appConfig.NEXT_PUBLIC_RECOMMENDATION_SYSTEM_URL;

// THÊM MỚI: Cập nhật kiểu cho các tab
type Tab = 'control' | 'config' | 'scheduler' | 'artifacts' | 'user';

export default function RecommendationPage({ params: { locale } }: { params: { locale: string } }) {
    const t = useTranslations('RecommendationPage');
    const { isLoggedIn, isInitializing, isLoading } = useAuth();
    const router = useRouter();

    const [statusData, setStatusData] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<Tab>('control');

    const fetchStatus = useCallback(async () => {
        // ... (hàm này giữ nguyên không đổi)
        try {
            const response = await fetch(`${API_BASE_URL}/pipeline-status`);
            if (!response.ok) {
                throw new Error('Failed to fetch status');
            }
            const data = await response.json();
            setStatusData(data);
        } catch (error) {
            console.error('Error fetching pipeline status:', error);
            toast.error('Could not fetch pipeline status.');
        }
    }, []);

    useEffect(() => {
        // ... (hook này giữ nguyên không đổi)
        if (isInitializing) return;
        if (!isLoggedIn) {
            router.replace(`/${locale}/auth/login`);
            return;
        }

        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);

        return () => clearInterval(interval);
    }, [isLoggedIn, isInitializing, locale, router, fetchStatus]);

    const handleRunPipeline = async (options: any) => {
        // ... (hàm này giữ nguyên không đổi)
        try {
            const response = await fetch(`${API_BASE_URL}/run-pipeline`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(options),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || 'Failed to start pipeline');
            }
            toast.success('Pipeline run has been successfully triggered!');
            fetchStatus();
        } catch (error: any) {
            console.error('Error running pipeline:', error);
            toast.error(`Error: ${error.message}`);
        }
    };

    if (isInitializing || isLoading) {
        return <div className="flex items-center justify-center w-full min-h-[50vh]">{t('AuthStatus_Loading')}</div>;
    }

    if (!isLoggedIn) return null;

    // THAY ĐỔI: Thêm tab "Configuration" vào mảng tabs
    const tabs = [
        { id: 'control', label: 'Control Panel', icon: FaCogs },
        { id: 'config', label: 'Configuration', icon: FaSlidersH },
        { id: 'scheduler', label: 'Scheduler', icon: FaClock },
        { id: 'artifacts', label: 'Artifacts', icon: FaBoxOpen },
        { id: 'user', label: 'User Lookup', icon: FaUser },
    ];

    return (
        <div className="space-y-6 p-6 bg-gray-10 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Recommendation Management</h1>
                <p className="text-gray-600 mt-1">Monitor status, control the pipeline, and analyze model artifacts.</p>
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={`
                                ${activeTab === tab.id
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                            `}
                        >
                            <tab.icon className="-ml-0.5 mr-2 h-5 w-5" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="mt-6">
                {activeTab === 'control' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <PipelineControls
                            isRunning={statusData?.is_running || false}
                            onRunPipeline={handleRunPipeline}
                            adminActionRequired={statusData?.last_run?.admin_action_required || null}
                        />
                        <PipelineStatus statusData={statusData} />
                    </div>
                )}

                {/* THÊM MỚI: Render component ConfigControls khi tab 'config' được chọn */}
                {activeTab === 'config' && (
                    <ConfigControls />
                )}

                {activeTab === 'scheduler' && (
                    <div className="max-w-3xl mx-auto">
                        <SchedulerControls />
                    </div>
                )}

                {activeTab === 'artifacts' && (
                    <div className="max-w-5xl mx-auto">
                        <ArtifactSummary />
                    </div>
                )}

                {activeTab === 'user' && (
                    <div className="max-w-5xl mx-auto">
                        <UserDetails />
                    </div>
                )}
            </div>
        </div>
    );
}
