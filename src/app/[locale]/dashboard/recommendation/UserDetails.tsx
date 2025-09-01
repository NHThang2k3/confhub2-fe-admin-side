// src/app/[locale]/dashboard/recommendation/UserDetails.tsx
'use client';

import React, { useState } from 'react';
import { FaSearch, FaSpinner, FaExclamationCircle, FaUser, FaUsers, FaThumbsUp, FaThumbsDown, FaProjectDiagram } from 'react-icons/fa';
import { appConfig } from '@/src/middleware';

const API_BASE_URL = appConfig.NEXT_PUBLIC_RECOMMENDATION_SYSTEM_URL;

export default function UserDetails() {
    const [userIdInput, setUserIdInput] = useState('');
    const [modelType, setModelType] = useState('mutifactor');
    const [userData, setUserData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!userIdInput.trim()) {
            setError('Please enter a User ID.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setUserData(null);

        try {
            const response = await fetch(`${API_BASE_URL}/user-details/${modelType}/${userIdInput.trim()}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || 'Failed to fetch user details');
            }
            setUserData(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">User Specific Details</h2>
            
            {/* Search Form */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 pb-6 border-b border-gray-200">
                <input
                    type="text"
                    value={userIdInput}
                    onChange={(e) => setUserIdInput(e.target.value)}
                    placeholder="Enter User ID (e.g., user_31)"
                    className="flex-grow block w-full pl-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
                <select
                    value={modelType}
                    onChange={(e) => setModelType(e.target.value)}
                    className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                    <option value="mutifactor">Mutifactor Model</option>
                    <option value="pearson">Pearson Model</option>
                </select>
                <button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                >
                    {isLoading ? <FaSpinner className="animate-spin mr-2" /> : <FaSearch className="mr-2" />}
                    Search
                </button>
            </div>

            {/* Results Area */}
            <div>
                {isLoading && <div className="text-center p-8"><FaSpinner className="animate-spin text-4xl text-gray-400 mx-auto" /></div>}
                {error && <div className="text-center p-8 text-red-600 flex items-center justify-center"><FaExclamationCircle className="mr-2" /> {error}</div>}
                {!isLoading && !error && !userData && <div className="text-center p-8 text-gray-500">Enter a User ID and click Search to see details.</div>}
                
                {userData && !userData.is_found && <div className="text-center p-8 text-orange-600">User '{userData.user_id}' not found in the model.</div>}

                {userData && userData.is_found && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* General Info */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg text-gray-700 flex items-center"><FaUser className="mr-2 text-indigo-500"/> General Info</h3>
                            <p><strong>Cluster ID:</strong> {userData.cluster_info?.cluster_id ?? 'N/A'}</p>
                            <p><strong>Cluster Size:</strong> {userData.cluster_info?.cluster_size ?? 'N/A'} users</p>
                            <p><strong>Has Embedding:</strong> {userData.has_embedding ? 'Yes' : 'No'}</p>
                        </div>

                        {/* Top Predictions */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg text-gray-700 flex items-center"><FaThumbsUp className="mr-2 text-green-500"/> Top 10 Recommendations</h3>
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100"><tr><th className="p-2">Conference ID</th><th className="p-2">Score</th></tr></thead>
                                <tbody>
                                    {userData.top_predictions?.map((p: any) => (
                                        <tr key={p.conference_id} className="border-b"><td className="p-2 truncate">{p.conference_id}</td><td className="p-2 font-mono">{p.predicted_rating}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Top Neighbors */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg text-gray-700 flex items-center"><FaUsers className="mr-2 text-blue-500"/> Top 10 Neighbors</h3>
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100"><tr><th className="p-2">User ID</th><th className="p-2">Similarity</th></tr></thead>
                                <tbody>
                                    {userData.similarity_info?.map((n: any) => (
                                        <tr key={n.user_id} className="border-b"><td className="p-2 truncate">{n.user_id}</td><td className="p-2 font-mono">{n.similarity_score}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}