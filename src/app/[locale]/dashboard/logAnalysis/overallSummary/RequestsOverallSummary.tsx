// src/app/[locale]/dashboard/logAnalysis/overallSummary/RequestsOverallSummary.tsx
import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { EChartsOption } from 'echarts';
import {
    FaListOl,
    FaCheckCircle,
    FaTimesCircle,
    FaSpinner,
    FaExclamationTriangle,
    FaStopwatch,
    FaLink,
    FaQuestionCircle
} from 'react-icons/fa';
import KpiCard from './KpiCard';
import ChartCard from './ChartCard';
import { LogAnalysisResultUnion, CrawlerType } from '@/src/hooks/logAnalysis/useLogAnalysisData';
import { RequestSummaryUnionForTable } from '../analysis/RequestsTable'; // Import type từ RequestsTable

interface RequestsOverallSummaryProps {
    data: LogAnalysisResultUnion;
    // crawlerType: CrawlerType; // Có thể không cần crawlerType nếu summary này chung cho cả hai
}

const RequestsOverallSummary: React.FC<RequestsOverallSummaryProps> = ({ data }) => {
    const t = useTranslations('RequestsOverallSummary');
    const tStatus = useTranslations('RequestsTable.statusNames'); // Để lấy tên trạng thái đã dịch

    const requestDetails = useMemo(() => {
        const allRequestIds = data.analyzedRequestIds || [];
        const requestsData = data.requests as { [key: string]: RequestSummaryUnionForTable };

        let completed = 0;
        let failed = 0;
        let processing = 0;
        let partiallyCompletedOrWithErrors = 0; // Gộp 'partiallycompleted' và 'completedwitherrors'
        let unknown = 0;
        let totalDurationSeconds = 0;
        let requestsWithDuration = 0;
        let requestsWithOriginalId = 0;

        allRequestIds.forEach(id => {
            const req = requestsData[id];
            if (req) {
                switch (req.status?.toLowerCase()) {
                    case 'completed':
                        completed++;
                        break;
                    case 'failed':
                        failed++;
                        break;
                    case 'processing':
                        processing++;
                        break;
                    case 'partiallycompleted':
                    case 'completedwitherrors':
                        partiallyCompletedOrWithErrors++;
                        break;
                    default:
                        unknown++;
                        break;
                }
                if (req.durationSeconds !== null && req.durationSeconds !== undefined) {
                    totalDurationSeconds += req.durationSeconds;
                    requestsWithDuration++;
                }
                if (req.originalRequestId) {
                    requestsWithOriginalId++;
                }
            } else {
                unknown++; // Nếu không có details, coi là unknown
            }
        });

        const avgDuration = requestsWithDuration > 0 ? (totalDurationSeconds / requestsWithDuration) : 0;

        return {
            totalRequests: allRequestIds.length,
            completed,
            failed,
            processing,
            partiallyCompletedOrWithErrors,
            unknown,
            avgDuration,
            requestsWithOriginalId,
        };
    }, [data]);

    const statusChartOption: EChartsOption = useMemo(() => ({
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            top: 'center',
            textStyle: {
                fontSize: 10,
            }
        },
        series: [
            {
                name: t('charts.statusDistribution.title'),
                type: 'pie',
                radius: ['50%', '70%'], // Doughnut chart
                center: ['65%', '50%'], // Điều chỉnh vị trí để legend không bị che
                avoidLabelOverlap: false,
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '14',
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: [
                    { value: requestDetails.completed, name: tStatus('completed', {defaultMessage: 'Completed'}) },
                    { value: requestDetails.failed, name: tStatus('failed', {defaultMessage: 'Failed'}) },
                    { value: requestDetails.processing, name: tStatus('processing', {defaultMessage: 'Processing'}) },
                    { value: requestDetails.partiallyCompletedOrWithErrors, name: tStatus('partiallycompleted', {defaultMessage: 'With Errors'}) }, // Cần key dịch chung
                    { value: requestDetails.unknown, name: tStatus('unknown', {defaultMessage: 'Unknown'}) },
                ].filter(item => item.value > 0), // Chỉ hiển thị nếu có giá trị
                itemStyle: {
                    borderRadius: 5,
                    borderColor: '#fff',
                    borderWidth: 1
                }
            }
        ]
    }), [requestDetails, t, tStatus]);

    const hasStatusDataForChart = useMemo(() =>
        requestDetails.completed > 0 ||
        requestDetails.failed > 0 ||
        requestDetails.processing > 0 ||
        requestDetails.partiallyCompletedOrWithErrors > 0 ||
        requestDetails.unknown > 0
    , [requestDetails]);


    if (!data || requestDetails.totalRequests === 0) {
        return (
            <div className="p-4 text-center text-gray-500">{t('noRequestData')}</div>
        );
    }

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{t('title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                <KpiCard
                    icon={<FaListOl className="text-3xl text-blue-500" />}
                    label={t('kpi.totalRequests')}
                    value={requestDetails.totalRequests}
                />
                <KpiCard
                    icon={<FaCheckCircle className="text-3xl text-green-500" />}
                    label={t('kpi.completed')}
                    value={requestDetails.completed}
                    valueDenominator={requestDetails.totalRequests}
                />
                <KpiCard
                    icon={<FaTimesCircle className="text-3xl text-red-500" />}
                    label={t('kpi.failed')}
                    value={requestDetails.failed}
                    valueDenominator={requestDetails.totalRequests}
                />
                <KpiCard
                    icon={<FaSpinner className="text-3xl text-blue-500 animate-spin" />}
                    label={t('kpi.processing')}
                    value={requestDetails.processing}
                    valueDenominator={requestDetails.totalRequests}
                />
                <KpiCard
                    icon={<FaExclamationTriangle className="text-3xl text-yellow-500" />}
                    label={t('kpi.withErrors')}
                    value={requestDetails.partiallyCompletedOrWithErrors}
                    valueDenominator={requestDetails.totalRequests}
                />
                <KpiCard
                    icon={<FaQuestionCircle className="text-3xl text-gray-400" />}
                    label={t('kpi.unknown')}
                    value={requestDetails.unknown}
                     valueDenominator={requestDetails.totalRequests}
                />
                <KpiCard
                    icon={<FaStopwatch className="text-3xl text-indigo-500" />}
                    label={t('kpi.avgDuration')}
                    value={`${requestDetails.avgDuration.toFixed(2)}s`}
                />
                <KpiCard
                    icon={<FaLink className="text-3xl text-purple-500" />}
                    label={t('kpi.withOriginalId')}
                    value={requestDetails.requestsWithOriginalId}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6"> {/* Đặt biểu đồ vào 1 cột để rộng hơn */}
                 <ChartCard
                    option={statusChartOption}
                    dataExists={hasStatusDataForChart}
                    noDataMessage={t('charts.statusDistribution.noData')}
                    chartHeight="280px" // Giảm chiều cao một chút
                    className="min-h-[320px]" // Đảm bảo chiều cao tối thiểu
                />
                {/* 
                // Placeholder for Duration Buckets Chart (implement later if needed)
                <ChartCard
                    option={{}} // Replace with actual duration chart option
                    dataExists={false} // Replace with actual data check
                    noDataMessage="Duration distribution data not yet available"
                    chartHeight="280px"
                />
                */}
            </div>
        </div>
    );
};

export default RequestsOverallSummary;