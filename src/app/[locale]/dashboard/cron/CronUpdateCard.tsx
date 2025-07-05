import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCronJobManager } from '@/src/hooks/cron/useCronJobManager';

const CronUpdateCard: React.FC = () => {
    const {
        cycleType,
        time,
        dayOfMonth,
        batchSize,
        cronStatus,
        updateStats,
        isLoading,
        setCycleType,
        setTime,
        setDayOfMonth,
        setBatchSize,
        handleScheduleCron,
        handleCancelCron,
    } = useCronJobManager();

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
                                className={`${cycleType === 'daily' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-5'}`}
                            >
                                Daily
                            </Button>
                            <Button
                                variant={cycleType === 'monthly' ? 'default' : 'outline'}
                                onClick={() => setCycleType('monthly')}
                                className={`${cycleType === 'monthly' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-5'}`}
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
                    <Alert className="border-gray-200 bg-gray-5">
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

export default CronUpdateCard;