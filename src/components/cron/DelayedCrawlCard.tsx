import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Clock, Calendar, Database, Infinity } from 'lucide-react';
import { useDelayedCrawl } from '@/src/hooks/cron';

const DelayedCrawlCard: React.FC = () => {
    const {
        delayHours,
        delayMinutes,
        delaySeconds,
        batchSize,
        take,
        takeAll,
        isLoading,
        totalDelaySeconds,
        scheduledTime,
        setDelayHours,
        setDelayMinutes,
        setDelaySeconds,
        setBatchSize,
        setTake,
        setTakeAll,
        handleScheduleDelayedCrawl,
    } = useDelayedCrawl();

    const formatDuration = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        const parts = [];
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (seconds > 0) parts.push(`${seconds}s`);
        
        return parts.length > 0 ? parts.join(' ') : '0s';
    };

    return (
        <div className='mx-auto rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 shadow-xl md:p-6 backdrop-blur-sm'>
            <h2 className='mb-6 border-b border-blue-200 pb-3 text-xl font-semibold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent flex items-center gap-2'>
                <Clock className="w-5 h-5 text-blue-600" />
                Delayed Crawl Scheduler
            </h2>

            <div className="space-y-6">
                {/* Delay Configuration */}
                <div className="space-y-4 bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-blue-100">
                    <h3 className="text-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        Schedule Delay
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="delayHours" className="text-blue-700 font-medium">Hours</Label>
                            <Input
                                id="delayHours"
                                type="number"
                                min="0"
                                max="23"
                                value={delayHours}
                                onChange={(e) => setDelayHours(Number(e.target.value))}
                                className="border-blue-200 focus:border-blue-500 focus:ring-blue-500 bg-white/80"
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="delayMinutes" className="text-blue-700 font-medium">Minutes</Label>
                            <Input
                                id="delayMinutes"
                                type="number"
                                min="0"
                                max="59"
                                value={delayMinutes}
                                onChange={(e) => setDelayMinutes(Number(e.target.value))}
                                className="border-blue-200 focus:border-blue-500 focus:ring-blue-500 bg-white/80"
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="delaySeconds" className="text-blue-700 font-medium">Seconds</Label>
                            <Input
                                id="delaySeconds"
                                type="number"
                                min="0"
                                max="59"
                                value={delaySeconds}
                                onChange={(e) => setDelaySeconds(Number(e.target.value))}
                                className="border-blue-200 focus:border-blue-500 focus:ring-blue-500 bg-white/80"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>

                {/* Conference Configuration */}
                <div className="space-y-4 bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-indigo-100">
                    <h3 className="text-lg font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                        <Database className="w-4 h-4 text-indigo-500" />
                        Conference Configuration
                    </h3>
                    <div className="max-w-md">
                        <div className="space-y-3">
                            <Label htmlFor="take" className="text-blue-700 font-medium">Take Count</Label>
                            <Input
                                id="take"
                                type="number"
                                min="1"
                                max="100"
                                value={take}
                                onChange={(e) => setTake(Number(e.target.value))}
                                className="border-blue-200 focus:border-blue-500 focus:ring-blue-500 bg-white/80"
                                disabled={takeAll}
                            />
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="takeAll"
                                    checked={takeAll}
                                    onCheckedChange={(checked) => setTakeAll(!!checked)}
                                />
                                <Label htmlFor="takeAll" className="text-sm text-blue-700 flex items-center gap-1 font-medium">
                                    <Infinity className="w-3 h-3 text-indigo-500" />
                                    Take All Conferences
                                </Label>
                            </div>
                            <p className="text-sm text-blue-600">
                                {takeAll ? "Will process all available conferences" : "Total conferences to fetch"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Preview */}
                {totalDelaySeconds > 0 && scheduledTime && (
                    <Alert className="border-blue-200 bg-blue-50">
                        <Clock className="h-4 w-4" />
                        <AlertTitle className="text-blue-800">Scheduled Execution</AlertTitle>
                        <AlertDescription>
                            <div className="space-y-2 text-blue-700">
                                <p><strong>Delay:</strong> {formatDuration(totalDelaySeconds)}</p>
                                <p><strong>Scheduled for:</strong> {scheduledTime.toLocaleString()}</p>
                                <p><strong>Will process:</strong> {takeAll ? "all available conferences" : `${take} conferences`}</p>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Validation Warning */}
                {totalDelaySeconds <= 0 && (
                    <Alert className="border-yellow-200 bg-yellow-50">
                        <AlertTitle className="text-yellow-800">Set Delay Time</AlertTitle>
                        <AlertDescription className="text-yellow-700">
                            Please set a delay time greater than 0 to schedule the crawl job.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Action Button */}
                <div className="flex justify-end pt-4">
                    <Button
                        onClick={handleScheduleDelayedCrawl}
                        disabled={isLoading || totalDelaySeconds <= 0}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Scheduling...
                            </>
                        ) : (
                            <>
                                <Clock className="w-4 h-4" />
                                Schedule Delayed Crawl
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DelayedCrawlCard;
