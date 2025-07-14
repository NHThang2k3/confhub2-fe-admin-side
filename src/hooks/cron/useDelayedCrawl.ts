import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { api } from '@/src/lib/api';

export interface DelayedCrawlRequest {
    delaySeconds: number;
    delayMinutes: number;
    delayHours: number;
    batchSize: number;
    take: number;
}

export interface DelayedCrawlResponse {
    success: boolean;
    message: string;
    scheduledFor: string;
}

export const useDelayedCrawl = () => {
    const { toast } = useToast();
    const [delayHours, setDelayHours] = useState(0);
    const [delayMinutes, setDelayMinutes] = useState(0);
    const [delaySeconds, setDelaySeconds] = useState(0);
    const [batchSize, setBatchSize] = useState(1);
    const [take, setTake] = useState(10);
    const [takeAll, setTakeAll] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const calculateTotalDelay = useCallback(() => {
        return delayHours * 3600 + delayMinutes * 60 + delaySeconds;
    }, [delayHours, delayMinutes, delaySeconds]);

    const getScheduledTime = useCallback(() => {
        const totalDelayMs = calculateTotalDelay() * 1000;
        if (totalDelayMs <= 0) return null;
        return new Date(Date.now() + totalDelayMs);
    }, [calculateTotalDelay]);

    const handleScheduleDelayedCrawl = async () => {
        const totalDelay = calculateTotalDelay();
        
        if (totalDelay <= 0) {
            toast({
                title: "Invalid Delay",
                description: "Please set a delay greater than 0",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        try {
            const requestData: DelayedCrawlRequest = {
                delaySeconds,
                delayMinutes,
                delayHours,
                batchSize,
                take: takeAll ? 999999 : take // Use a very large number to indicate "take all"
            };

            await api.post("/api/v1/conference-crawl-job/schedule-delayed", requestData);
            
            const scheduledTime = getScheduledTime();
            const conferenceCount = takeAll ? "all" : take;
            toast({
                title: "Success",
                description: `Delayed crawl scheduled for ${scheduledTime?.toLocaleString()} (${conferenceCount} conferences)`
            });

            // Reset form after successful scheduling
            setDelayHours(0);
            setDelayMinutes(0);
            setDelaySeconds(0);
            setBatchSize(1);
            setTake(10);
            setTakeAll(false);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to schedule delayed crawl",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return {
        // State
        delayHours,
        delayMinutes,
        delaySeconds,
        batchSize,
        take,
        takeAll,
        isLoading,
        // Setters
        setDelayHours,
        setDelayMinutes,
        setDelaySeconds,
        setBatchSize,
        setTake,
        setTakeAll,
        // Computed values
        totalDelaySeconds: calculateTotalDelay(),
        scheduledTime: getScheduledTime(),
        // Handlers
        handleScheduleDelayedCrawl,
    };
};
