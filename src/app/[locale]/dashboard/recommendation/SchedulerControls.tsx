'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Thêm useMemo
import { FaClock, FaSpinner, FaSave, FaGlobe } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { appConfig } from '@/src/middleware';

const API_BASE_URL = appConfig.NEXT_PUBLIC_RECOMMENDATION_SYSTEM_URL;

// --- Component Đồng hồ UTC ---
const UTClock = () => {
    const [utcTime, setUtcTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setUtcTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="text-xs text-gray-500 flex items-center justify-end">
            <FaGlobe className="mr-1" />
            Current UTC Time:
            <span className="font-mono ml-1">
                {utcTime.getUTCHours().toString().padStart(2, '0')}:
                {utcTime.getUTCMinutes().toString().padStart(2, '0')}:
                {utcTime.getUTCSeconds().toString().padStart(2, '0')}
            </span>
        </div>
    );
};

export default function SchedulerControls() {
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [schedule, setSchedule] = useState({ hour: 1, minute: 0 });
    const [initialSchedule, setInitialSchedule] = useState({ hour: 1, minute: 0 });
    const [nextRun, setNextRun] = useState('N/A');

    // THAY ĐỔI: Không cần state riêng cho localRunTime nữa

    const fetchSchedulerStatus = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/scheduler/status`);
            const data = await response.json();
            if (response.ok && data.is_running && data.jobs.length > 0) {
                const job = data.jobs[0];
                const [minute, hour] = job.cron_trigger.split(' ');
                const newSchedule = { hour: parseInt(hour), minute: parseInt(minute) };
                setSchedule(newSchedule);
                setInitialSchedule(newSchedule);

                const nextRunDate = new Date(job.next_run_time);
                setNextRun(nextRunDate.toUTCString());
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

    // THAY ĐỔI: Tính toán giờ địa phương tương đương một cách linh hoạt
    const localEquivalentTime = useMemo(() => {
        // Tạo một đối tượng Date giả lập cho ngày hôm nay
        const today = new Date();
        // Thiết lập giờ và phút UTC dựa trên state hiện tại
        today.setUTCHours(schedule.hour, schedule.minute, 0, 0);

        // Định dạng thời gian đó theo múi giờ của trình duyệt
        return new Intl.DateTimeFormat(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).format(today);
    }, [schedule.hour, schedule.minute]); // Chỉ tính toán lại khi giờ hoặc phút thay đổi

    const handleTimeChange = (part: 'hour' | 'minute', value: string) => {
        const numValue = parseInt(value);
        if (isNaN(numValue)) return;

        // Giới hạn giá trị nhập vào
        let clampedValue = numValue;
        if (part === 'hour') {
            clampedValue = Math.max(0, Math.min(23, numValue));
        } else {
            clampedValue = Math.max(0, Math.min(59, numValue));
        }

        setSchedule(prev => ({ ...prev, [part]: clampedValue }));
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
            setTimeout(() => fetchSchedulerStatus(), 1000);
        } catch (error: any) {
            toast.error(`Error: ${error.message}`);
        } finally {
            setIsUpdating(false);
        }
    };

    const isChanged = schedule.hour !== initialSchedule.hour || schedule.minute !== initialSchedule.minute;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <FaClock className="mr-3 text-indigo-500" />
                    Nightly Pipeline Scheduler
                </h2>
                <UTClock />
            </div>
            {isLoading ? (
                <div className="text-center py-4"><FaSpinner className="animate-spin text-2xl text-gray-400 mx-auto" /></div>
            ) : (
                <>
                    <p className="text-sm text-gray-600 mb-4">
                        The pipeline is scheduled to run automatically every day. Adjust the UTC time below.
                    </p>
                    <div className="bg-gray-10 p-4 rounded-md border">
                        <div className="flex items-center gap-4 mb-2">
                            <label htmlFor="hour" className="font-medium text-gray-700">Run at (UTC):</label>
                            <input
                                type="number"
                                id="hour"
                                value={schedule.hour}
                                onBlur={(e) => handleTimeChange('hour', e.target.value)} // Cập nhật khi focus ra ngoài
                                onChange={(e) => setSchedule(prev => ({ ...prev, hour: parseInt(e.target.value) || 0 }))}
                                className="w-20 text-center text-lg font-mono p-2 border border-gray-300 rounded-md"
                            />
                            <span className="text-lg font-bold">:</span>
                            <input
                                type="number"
                                id="minute"
                                value={schedule.minute}
                                onBlur={(e) => handleTimeChange('minute', e.target.value)} // Cập nhật khi focus ra ngoài
                                onChange={(e) => setSchedule(prev => ({ ...prev, minute: parseInt(e.target.value) || 0 }))}
                                className="w-20 text-center text-lg font-mono p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        {/* THAY ĐỔI: Hiển thị giá trị được tính toán động */}
                        <p className="text-xs text-gray-500 text-center transition-opacity duration-300">
                            (This is approximately <span className="font-semibold">{localEquivalentTime}</span> in your local time)
                        </p>
                    </div>
                    <div className="mt-6 mb-6">
                        <p className="text-sm text-gray-800">
                            <strong>Next scheduled run (UTC):</strong> <span className="font-mono">{nextRun}</span>
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
