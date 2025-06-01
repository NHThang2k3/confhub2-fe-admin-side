import React from 'react';
import { FaTable, FaBookOpen, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { CrawlerType } from '../logAnalysis/Analysis'; // Assuming CrawlerType is exported from Analysis.tsx
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import axios from 'axios';
import { api } from '@/src/lib/api';

const apiUrl = process.env.NEXT_PUBLIC_DATABASE_URL || 'http://localhost:3000' + '/api/v1';
interface CrawlerToolsProps {
    isExpanded: boolean;
    onToggle: () => void;
    activeCrawler: CrawlerType;
    onSetCrawler: (crawler: CrawlerType) => void;
    ConferenceCrawlUploaderComponent: React.FC;
    JournalCrawlUploaderComponent: React.FC;
}

const CrawlerTools: React.FC<CrawlerToolsProps> = ({
    isExpanded,
    onToggle,
    activeCrawler,
    onSetCrawler,
    ConferenceCrawlUploaderComponent,
    JournalCrawlUploaderComponent
}) => {
    const t = useTranslations('CrawlerTools');
    const { toast } = useToast();
    const [schedule, setSchedule] = useState("0 0 * * *"); // Default: daily at midnight
    const [batchSize, setBatchSize] = useState(10);
    const [cronStatus, setCronStatus] = useState<any>(null);
    const [updateStats, setUpdateStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchCronStatus = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/v1/conference-crawl-job/cron-status`);
            setCronStatus(response.data);
        } catch (error) {
            console.error("Error fetching cron status:", error);
        }
    };

    const fetchUpdateStats = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/v1/conference-crawl-job/stats`);
            setUpdateStats(response.data);
        } catch (error) {
            console.error("Error fetching update stats:", error);
        }
    };

    useEffect(() => {
        fetchCronStatus();
        fetchUpdateStats();
        const interval = setInterval(() => {
            fetchCronStatus();
            fetchUpdateStats();
        }, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const handleScheduleCron = async () => {
        setIsLoading(true);
        try {
            await axios.post(`${apiUrl}/api/v1/conference-crawl-job/schedule-cron`, {
                schedule,
                batchSize
            });
            toast({
                title: "Success",
                description: "Cron update scheduled successfully"
            });
            fetchCronStatus();
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
            await axios.post(`${apiUrl}/api/v1/conference-crawl-job/cancel-cron`);
            toast({
                title: "Success",
                description: "Cron update cancelled successfully"
            });
            fetchCronStatus();
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

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div
                className="flex justify-between items-center p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-5"
                onClick={onToggle}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onToggle()}
                aria-expanded={isExpanded}
                aria-controls="crawler-tools-content"
            >
                <h2 className="text-lg font-semibold text-gray-800">{t('dataCrawlingToolsTitle')}</h2>
                <button
                    className="text-gray-500 hover:text-blue-600 focus:outline-none p-1 rounded-full"
                    aria-label={isExpanded ? t('collapseCrawlerToolsLabel') : t('expandCrawlerToolsLabel')}
                >
                    {isExpanded ? <FaChevronUp size={18} /> : <FaChevronDown size={18} />}
                </button>
            </div>
            <div
                id="crawler-tools-content"
                className={`transition-max-height duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1500px] opacity-100 visible' : 'max-h-0 opacity-0 invisible'}`}
            >
                <div className="p-4">
                    <div className="flex border-b border-gray-200 mb-4">
                        <button
                            onClick={() => onSetCrawler('conference')}
                            className={`flex items-center py-2 px-4 text-sm font-medium border-b-2 focus:outline-none transition-colors duration-150 ${activeCrawler === 'conference' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            <FaTable className="mr-2" /> {t('crawlConferencesButton')}
                        </button>
                        <button
                            onClick={() => onSetCrawler('journal')}
                            className={`flex items-center py-2 px-4 text-sm font-medium border-b-2 focus:outline-none transition-colors duration-150 ${activeCrawler === 'journal' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            <FaBookOpen className="mr-2" /> {t('crawlJournalsButton')}
                        </button>
                    </div>
                    <div>
                        {activeCrawler === 'conference' && <ConferenceCrawlUploaderComponent />}
                        {activeCrawler === 'journal' && <JournalCrawlUploaderComponent />}
                    </div>
                    <div className="mt-4">
                        <CronUpdateCard />
                    </div>
                </div>
            </div>
        </div>
    );
};

const CronUpdateCard = () => {
    const { toast } = useToast();
    const [cycleType, setCycleType] = useState<'daily' | 'monthly'>('daily');
    const [time, setTime] = useState('00:00');
    const [dayOfMonth, setDayOfMonth] = useState('1');
    const [batchSize, setBatchSize] = useState(10);
    const [cronStatus, setCronStatus] = useState<any>(null);
    const [updateStats, setUpdateStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const generateCronExpression = () => {
        const [hours, minutes] = time.split(':');
        if (cycleType === 'daily') {
            return `${minutes} ${hours} * * *`;
        } else {
            return `${minutes} ${hours} ${dayOfMonth} * *`;
        }
    };

    const fetchCronStatus = async () => {
        try {
            const response = await api.get(apiUrl+"api/v1/conference-crawl-job/cron-status");
            setCronStatus(response.data);
        } catch (error) {
            console.error("Error fetching cron status:", error);
        }
    };

    const fetchUpdateStats = async () => {
        try {
            const response = await api.get(apiUrl+"/api/v1/conference-crawl-job/stats");
            setUpdateStats(response.data);
        } catch (error) {
            console.error("Error fetching update stats:", error);
        }
    };

    useEffect(() => {
        fetchCronStatus();
        fetchUpdateStats();
        const interval = setInterval(() => {
            fetchCronStatus();
            fetchUpdateStats();
        }, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const handleScheduleCron = async () => {
        setIsLoading(true);
        try {
            const schedule = generateCronExpression();
            await api.post(apiUrl+"/api/v1/conference-crawl-job/schedule-cron", {
                schedule,
                batchSize
            });
            toast({
                title: "Success",
                description: "Cron update scheduled successfully"
            });
            fetchCronStatus();
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
            await api.post(apiUrl+"/conference-crawl-job/cancel-cron");
            toast({
                title: "Success",
                description: "Cron update cancelled successfully"
            });
            fetchCronStatus();
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

    return (
        <div className='mx-auto rounded-lg border border-gray-200 bg-white p-4 shadow-lg md:p-6'>
            <h2 className='mb-6 border-b border-gray-300 pb-3 text-xl font-semibold text-gray-700'>
                Automatic Updates
            </h2>

            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-gray-700">Update Cycle</Label>
                        <div className="flex space-x-2">
                            <Button
                                variant={cycleType === 'daily' ? 'default' : 'outline'}
                                onClick={() => setCycleType('daily')}
                                className={`${
                                    cycleType === 'daily' 
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                Daily
                            </Button>
                            <Button
                                variant={cycleType === 'monthly' ? 'default' : 'outline'}
                                onClick={() => setCycleType('monthly')}
                                className={`${
                                    cycleType === 'monthly' 
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                Monthly
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="time" className="text-gray-700">Time</Label>
                        <Input
                            id="time"
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {cycleType === 'monthly' && (
                    <div className="space-y-2">
                        <Label htmlFor="dayOfMonth" className="text-gray-700">Day of Month</Label>
                        <Input
                            id="dayOfMonth"
                            type="number"
                            min="1"
                            max="31"
                            value={dayOfMonth}
                            onChange={(e) => setDayOfMonth(e.target.value)}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="batchSize" className="text-gray-700">Batch Size</Label>
                    <Input
                        id="batchSize"
                        type="number"
                        value={batchSize}
                        onChange={(e) => setBatchSize(Number(e.target.value))}
                        min={1}
                        max={50}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>

                {cronStatus && (
                    <Alert className="border-gray-200 bg-gray-50">
                        <AlertTitle className="text-gray-700">Current Status</AlertTitle>
                        <AlertDescription>
                            <div className="space-y-2 text-gray-600">
                                <p>Active: {cronStatus.isActive ? "Yes" : "No"}</p>
                                {cronStatus.isActive && (
                                    <>
                                        <p>Schedule: {cronStatus.schedule}</p>
                                        <p>Last Run: {new Date(cronStatus.lastRun).toLocaleString()}</p>
                                        <p>Next Run: {new Date(cronStatus.nextRun).toLocaleString()}</p>
                                    </>
                                )}
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {updateStats && (
                    <div className="space-y-3">
                        <h4 className="font-medium text-gray-700">Update Statistics</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-gray-600">Total Jobs: {updateStats.total}</p>
                                <p className="text-gray-600">Completed: {updateStats.completed}</p>
                                <p className="text-gray-600">Failed: {updateStats.failed}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-gray-600">Pending: {updateStats.pending}</p>
                                <p className="text-gray-600">Running: {updateStats.running}</p>
                                <p className="text-gray-600">Success Rate: {updateStats.successRate.toFixed(1)}%</p>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                                className="bg-blue-600 h-2.5 rounded-full" 
                                style={{ width: `${updateStats.successRate}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                    {cronStatus?.isActive ? (
                        <Button
                            variant="destructive"
                            onClick={handleCancelCron}
                            disabled={isLoading}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Cancel Update
                        </Button>
                    ) : (
                        <Button
                            onClick={handleScheduleCron}
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Schedule Update
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CrawlerTools;