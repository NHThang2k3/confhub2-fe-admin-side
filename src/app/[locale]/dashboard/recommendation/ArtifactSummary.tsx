// src/app/[locale]/dashboard/recommendation/ArtifactSummary.tsx
'use client';

import React, { useState, useEffect } from 'react';
// --- THÊM MỚI: Import các icon cho nút toggle ---
import { FaBoxOpen, FaCheckCircle, FaTimesCircle, FaSpinner, FaChartBar, FaUsers, FaProjectDiagram, FaBrain, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { appConfig } from '@/src/middleware';

const API_BASE_URL = appConfig.NEXT_PUBLIC_RECOMMENDATION_SYSTEM_URL;

const ICONS: { [key: string]: React.ElementType } = {
    Clustering: FaUsers,
    Embeddings: FaBrain,
    Similarity: FaProjectDiagram,
    Predictions: FaChartBar,
};

const ArtifactCard = ({ artifact }: { artifact: any }) => {
    const Icon = ICONS[artifact.artifact_name] || FaBoxOpen;

    // --- THAY ĐỔI: Thay thế hàm formatValue bằng một hàm render mạnh mẽ hơn ---
    const renderSummary = (summary: any) => {
        if (!summary) return <p className="text-sm text-gray-500">No summary data.</p>;

        return (
            <ul className="space-y-2 text-sm text-gray-600">
                {Object.entries(summary).map(([key, value]: [string, any]) => {
                    
                    // --- Case 1: Hiển thị "Users Per Cluster" dưới dạng các tag (pill) ---
                    if (key === 'users_per_cluster' && Array.isArray(value)) {
                        return (
                            <li key={key}>
                                <span className="font-medium capitalize text-gray-700">Users Per Cluster:</span>
                                <div className="mt-1.5 flex flex-wrap gap-2">
                                    {value.map(([clusterName, count]) => (
                                        <span key={clusterName} className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full">
                                            {clusterName}: {count}
                                        </span>
                                    ))}
                                </div>
                            </li>
                        );
                    }

                    // --- Case 2: Hiển thị "Top 5 Neighbors" dưới dạng danh sách rõ ràng ---
                    if (key === 'sample_top_5_neighbors' && Array.isArray(value)) {
                        return (
                            <li key={key}>
                                <span className="font-medium capitalize text-gray-700">Sample Top 5 Neighbors:</span>
                                <ul className="mt-1.5 pl-2 space-y-1">
                                    {value.map(([userId, score]) => (
                                        <li key={userId} className="text-xs font-mono flex justify-between items-center bg-gray-20 p-1 rounded">
                                            <span className="text-gray-600 truncate pr-2">{userId}</span>
                                            <span className="font-semibold text-gray-900 bg-gray-200 px-2 py-0.5 rounded">
                                                {score}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        );
                    }

                    // --- Case 3: Hiển thị "Matrix Shape" với định dạng "rows x cols" ---
                    if (key === 'matrix_shape' && Array.isArray(value)) {
                         return (
                            <li key={key} className="flex justify-between items-center">
                                <span className="font-medium capitalize text-gray-700">Matrix Shape:</span>
                                <span className="text-gray-800 font-semibold">{value.join(' x ')}</span>
                            </li>
                         );
                    }

                    // --- Default: Hiển thị các cặp key-value khác ---
                    return (
                        <li key={key} className="flex justify-between items-center">
                            <span className="font-medium capitalize text-gray-700">{key.replace(/_/g, ' ')}:</span>
                            <span className="text-gray-800 font-semibold text-right break-all">{String(value)}</span>
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center mb-3">
                <Icon className={`mr-3 text-xl ${artifact.exists ? 'text-indigo-500' : 'text-gray-400'}`} />
                <h3 className="text-lg font-semibold text-gray-800">{artifact.artifact_name}</h3>
                {artifact.exists ? (
                    <FaCheckCircle className="ml-auto text-green-500" title="Artifact exists" />
                ) : (
                    <FaTimesCircle className="ml-auto text-red-500" title="Artifact not found" />
                )}
            </div>
            {artifact.exists ? (
                renderSummary(artifact.data_summary)
            ) : (
                <p className="text-sm text-red-600">{artifact.data_summary?.message || 'File not found.'}</p>
            )}
            {artifact.error && <p className="text-sm text-red-600 mt-2">Error: {artifact.error}</p>}
        </div>
    );
};


export default function ArtifactSummary() {
    const [summaryData, setSummaryData] = useState<any[] | null>(null);
    const [isLoading, setIsLoading] = useState(false); // Đặt là false ban đầu
    const [modelType, setModelType] = useState('mutifactor');
    // --- THÊM MỚI: State để quản lý trạng thái expand/collapse, mặc định là collapse (false) ---
    const [isExpanded, setIsExpanded] = useState(false);

    // --- THAY ĐỔI: Chỉ fetch dữ liệu khi người dùng mở rộng nó lần đầu tiên ---
    useEffect(() => {
        // Chỉ fetch khi isExpanded là true và chưa có dữ liệu
        if (isExpanded && !summaryData) {
            const fetchSummary = async () => {
                setIsLoading(true);
                try {
                    const response = await fetch(`${API_BASE_URL}/artifact-summary/${modelType}`);
                    if (!response.ok) throw new Error('Failed to fetch artifact summary');
                    const data = await response.json();
                    setSummaryData(data);
                } catch (error) {
                    console.error('Error fetching artifact summary:', error);
                    setSummaryData([]); // Đặt là mảng rỗng nếu có lỗi
                } finally {
                    setIsLoading(false);
                }
            };
            fetchSummary();
        }
    }, [isExpanded, summaryData, modelType]);

    // --- THAY ĐỔI: Reset dữ liệu khi đổi model type để fetch lại ---
    const handleModelTypeChange = (newModelType: string) => {
        setModelType(newModelType);
        setSummaryData(null); // Reset data để trigger fetch lại khi mở rộng
        setIsLoading(false);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            {/* --- CẬP NHẬT: Phần Header với nút Toggle --- */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Artifacts Overview</h2>
                <div className="flex items-center gap-4">
                    <select
                        value={modelType}
                        onChange={(e) => handleModelTypeChange(e.target.value)}
                        className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                        <option value="mutifactor">Mutifactor Model</option>
                        <option value="pearson">Pearson Model</option>
                    </select>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none"
                        aria-expanded={isExpanded}
                    >
                        {isExpanded ? 'Hide' : 'Show'} Details
                        {isExpanded ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
                    </button>
                </div>
            </div>

            {/* --- CẬP NHẬT: Render có điều kiện cho phần nội dung --- */}
            {isExpanded && (
                <div className="mt-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center min-h-[200px]">
                            <FaSpinner className="animate-spin text-gray-400 text-2xl" />
                            <p className="ml-4 text-gray-500">Loading summary...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {summaryData && summaryData.map((artifact, index) => (
                                <ArtifactCard key={index} artifact={artifact} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}