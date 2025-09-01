// src/app/[locale]/dashboard/recommendation/SchedulerControls.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FaClock, FaSpinner, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { appConfig } from '@/src/middleware';

const API_BASE_URL = appConfig.NEXT_PUBLIC_RECOMMENDATION_SYSTEM_URL;

export default function SchedulerControls() {
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [schedule, setSchedule] = useState({ hour: 1, minute: 0 });
    const [initialSchedule, setInitialSchedule] = useState({ hour: 1, minute: 0 });
    const [nextRun, setNextRun] = useState('N/A');

    const fetchSchedulerStatus = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/scheduler/status`);
            const data = await response.json();
            if (response.ok && data.is_running && data.jobs.length > 0) {
                const job = data.jobs[0]; // Giả sử chỉ có 1 job
                const [minute, hour] = job.cron_trigger.split(' ');
                const newSchedule = { hour: parseInt(hour), minute: parseInt(minute) };
                setSchedule(newSchedule);
                setInitialSchedule(newSchedule); // Lưu lại trạng thái ban đầu
                setNextRun(new Date(job.next_run_time).toLocaleString());
            }
        } catch (error) {
            console.error('Failed to fetch scheduler status', error);
            toast.error('Could not fetch scheduler status.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSchedulerStatus();
    }, [fetchSchedulerStatus]);

    const handleTimeChange = (part: 'hour' | 'minute', value: string) => {
        const numValue = parseInt(value) || 0;
        setSchedule(prev => ({ ...prev, [part]: numValue }));
    };

    const handleUpdateSchedule = async () => {
        setIsUpdating(true);
        try {
            const response = await fetch(`${API_BASE_URL}/scheduler/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(schedule),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || 'Failed to update schedule');
            }
            toast.success(data.message);
            fetchSchedulerStatus(); // Fetch lại để cập nhật next_run_time
        } catch (error: any) {
            toast.error(`Error: ${error.message}`);
        } finally {
            setIsUpdating(false);
        }
    };
    
    const isChanged = schedule.hour !== initialSchedule.hour || schedule.minute !== initialSchedule.minute;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaClock className="mr-3 text-indigo-500" />
                Nightly Pipeline Scheduler
            </h2>
            {isLoading ? (
                <div className="text-center py-4"><FaSpinner className="animate-spin text-2xl text-gray-400 mx-auto" /></div>
            ) : (
                <>
                    <p className="text-sm text-gray-600 mb-4">
                        The pipeline is scheduled to run automatically every day. You can adjust the time below.
                    </p>
                    <div className="flex items-center gap-4 mb-4">
                        <label htmlFor="hour" className="font-medium text-gray-700">Run at:</label>
                        <input
                            type="number"
                            id="hour"
                            min="0"
                            max="23"
                            value={schedule.hour.toString().padStart(2, '0')}
                            onChange={(e) => handleTimeChange('hour', e.target.value)}
                            className="w-20 text-center text-lg font-mono p-2 border border-gray-300 rounded-md"
                        />
                        <span className="text-lg font-bold">:</span>
                        <input
                            type="number"
                            id="minute"
                            min="0"
                            max="59"
                            value={schedule.minute.toString().padStart(2, '0')}
                            onChange={(e) => handleTimeChange('minute', e.target.value)}
                            className="w-20 text-center text-lg font-mono p-2 border border-gray-300 rounded-md"
                        />
                        <span className="text-gray-500">(24h format)</span>
                    </div>
                    <div className="mb-6">
                        <p className="text-sm text-gray-800">
                            <strong>Next scheduled run:</strong> <span className="font-mono">{nextRun}</span>
                        </p>
                    </div>
                    <button
                        onClick={handleUpdateSchedule}
                        disabled={isUpdating || !isChanged}
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                    >
                        {isUpdating ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
                        Save Changes
                    </button>
                </>
            )}
        </div>
    );
}