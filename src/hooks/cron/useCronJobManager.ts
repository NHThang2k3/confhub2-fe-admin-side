import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { api } from '@/src/lib/api';
import { generateCronExpression } from '@/src/utils/utils';

// Định nghĩa kiểu dữ liệu cho cron status và update stats để code an toàn hơn
export interface CronStatus {
    isActive: boolean;
    schedule: string;
    lastRun: string;
    nextRun: string;
}

export interface UpdateStats {
    total: number;
    completed: number;
    failed: number;
    pending: number;
    running: number;
    successRate: number;
}

export const useCronJobManager = () => {
    const { toast } = useToast();
    const [cycleType, setCycleType] = useState<'daily' | 'monthly'>('daily');
    const [time, setTime] = useState('00:00');
    const [dayOfMonth, setDayOfMonth] = useState('1');
    const [batchSize, setBatchSize] = useState(10);
    const [cronStatus, setCronStatus] = useState<CronStatus | null>(null);
    const [updateStats, setUpdateStats] = useState<UpdateStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchCronStatus = useCallback(async () => {
        try {
            const response = await api.get<CronStatus>("/conference-crawl-job/cron-status");
            setCronStatus(response.data);
        } catch (error) {
            console.error("Error fetching cron status:", error);
            // Không hiển thị toast lỗi cho việc fetch tự động để tránh làm phiền người dùng
        }
    }, []);

    const fetchUpdateStats = useCallback(async () => {
        try {
            const response = await api.get<UpdateStats>("/conference-crawl-job/stats");
            setUpdateStats(response.data);
        } catch (error) {
            console.error("Error fetching update stats:", error);
        }
    }, []);

    useEffect(() => {
        fetchCronStatus();
        fetchUpdateStats();
        const interval = setInterval(() => {
            fetchCronStatus();
            fetchUpdateStats();
        }, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [fetchCronStatus, fetchUpdateStats]);

    const handleScheduleCron = async () => {
        setIsLoading(true);
        try {
            const schedule = generateCronExpression(cycleType, time, dayOfMonth);
            await api.post("/conference-crawl-job/schedule-cron", {
                schedule,
                batchSize
            });
            toast({
                title: "Success",
                description: "Cron update scheduled successfully"
            });
            await fetchCronStatus(); // Fetch status immediately after action
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to schedule cron update",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelCron = async () => {
        setIsLoading(true);
        try {
            await api.post("/conference-crawl-job/cancel-cron");
            toast({
                title: "Success",
                description: "Cron update cancelled successfully"
            });
            await fetchCronStatus(); // Fetch status immediately after action
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to cancel cron update",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return {
        // State
        cycleType,
        time,
        dayOfMonth,
        batchSize,
        cronStatus,
        updateStats,
        isLoading,
        // Setters
        setCycleType,
        setTime,
        setDayOfMonth,
        setBatchSize,
        // Handlers
        handleScheduleCron,
        handleCancelCron,
    };
};