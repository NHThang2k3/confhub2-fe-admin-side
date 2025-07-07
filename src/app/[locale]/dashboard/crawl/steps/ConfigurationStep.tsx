// src/components/crawl/steps/ConfigurationStep.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ApiName, CrawlModelType } from '@/src/models/logAnalysis/crawl.types';

const MIN_CHUNK_SIZE = 1;
const MAX_CHUNK_SIZE = 50;
const MIN_CHUNK_DELAY = 5;
const MAX_CHUNK_DELAY = 300;

interface ApiStepConfig {
    name: ApiName;
    displayName: string;
}

interface ConfigurationStepProps {
    enableChunking: boolean;
    setEnableChunking: (enabled: boolean) => void;
    chunkSize: number;
    setChunkSize: (size: number) => void;
    chunkDelay: number;
    setChunkDelay: (delay: number) => void;
    recordFile: boolean;
    setRecordFile: (enabled: boolean) => void;
    apiModels: Record<ApiName, CrawlModelType | null>;
    setApiModel: (apiName: ApiName, modelType: CrawlModelType) => void;
    apiStepsForUploader: ApiStepConfig[];
    isCrawling: boolean;
    allModelsSelected: boolean;
    onNext: () => void;
    onPrev: () => void;
    canProceed: boolean;
}

const ConfigurationStep: React.FC<ConfigurationStepProps> = ({
    enableChunking,
    setEnableChunking,
    chunkSize,
    setChunkSize,
    chunkDelay,
    setChunkDelay,
    recordFile,
    setRecordFile,
    apiModels,
    setApiModel,
    apiStepsForUploader,
    isCrawling,
    allModelsSelected,
    onNext,
    onPrev,
    canProceed,
}) => {
    const t = useTranslations('ConfigurationStep');

    const [displayChunkSize, setDisplayChunkSize] = useState<string | number>(chunkSize);
    const [displayChunkDelay, setDisplayChunkDelay] = useState<string | number>(chunkDelay);

    useEffect(() => {
        setDisplayChunkSize(chunkSize);
    }, [chunkSize]);

    useEffect(() => {
        setDisplayChunkDelay(chunkDelay);
    }, [chunkDelay]);

    // THAY ĐỔI LỚN NHẤT Ở ĐÂY:
    // Sử dụng useEffect để set cứng model về 'non-tuned' khi component mount hoặc apiStepsForUploader thay đổi
    useEffect(() => {
        apiStepsForUploader.forEach(step => {
            // Chỉ set nếu model hiện tại không phải là 'non-tuned'
            // Điều này giúp tránh re-render không cần thiết nếu đã đúng
            if (apiModels[step.name] !== 'non-tuned') {
                setApiModel(step.name, 'non-tuned');
            }
        });
    }, [apiStepsForUploader, apiModels, setApiModel]); // Thêm apiModels và setApiModel vào dependency array

    const handleChunkSizeBlur = () => {
        let value = parseInt(String(displayChunkSize), 10);

        if (isNaN(value)) {
            value = MIN_CHUNK_SIZE;
        }

        const clampedValue = Math.max(MIN_CHUNK_SIZE, Math.min(MAX_CHUNK_SIZE, value));

        setChunkSize(clampedValue);
        setDisplayChunkSize(clampedValue);
    };

    const handleChunkDelayBlur = () => {
        let value = parseInt(String(displayChunkDelay), 10);

        if (isNaN(value)) {
            value = MIN_CHUNK_DELAY;
        }

        const clampedValue = Math.max(MIN_CHUNK_DELAY, Math.min(MAX_CHUNK_DELAY, value));

        setChunkDelay(clampedValue);
        setDisplayChunkDelay(clampedValue);
    };


    const modelDescriptions: Record<CrawlModelType, string> = useMemo(() => ({
        'non-tuned': t('modelDescriptions.nonTuned'),
        'tuned': t('modelDescriptions.tuned'),
    }), [t]);

    const apiDescriptions: Record<ApiName, { name: string; purpose: string }> = useMemo(() => ({
        determineLinks: { name: t('apiDescriptions.determineLinks.name'), purpose: t('apiDescriptions.determineLinks.purpose') },
        extractInfo: { name: t('apiDescriptions.extractInfo.name'), purpose: t('apiDescriptions.extractInfo.purpose') },
        extractCfp: { name: t('apiDescriptions.extractCfp.name'), purpose: t('apiDescriptions.extractCfp.purpose') },
    }), [t]);

    const [openApiDescriptions, setOpenApiDescriptions] = useState<Record<ApiName, boolean>>(() =>
        apiStepsForUploader.reduce((acc, step) => ({ ...acc, [step.name]: false }), {} as Record<ApiName, boolean>)
    );

    const toggleDescription = (apiName: ApiName) => {
        setOpenApiDescriptions(prev => ({ ...prev, [apiName]: !prev[apiName] }));
    };

    return (
        <div className="space-y-6 rounded-lg border border-gray-200 p-5 bg-white shadow-md mb-6">
            <div className="pb-3 border-b border-gray-200 mb-5">
                <h3 className="text-xl font-semibold leading-6 text-gray-900">{t('header.title')}</h3>
                <p className="mt-1 text-sm text-gray-600">{t('header.description')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-6">
                    <div className='rounded-md border border-gray-200 bg-gray-5 p-5 space-y-4 shadow-sm'>
                        <h4 className='text-base font-semibold text-gray-800'>{t('chunking.title')}</h4>
                        <p className="text-sm text-gray-600 mb-3">{t('chunking.description')}</p>
                        <div className='flex items-center mb-2'>
                            <input id='enable-chunking' type='checkbox' className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed' checked={enableChunking} onChange={e => setEnableChunking(e.target.checked)} disabled={isCrawling} />
                            <label htmlFor='enable-chunking' className={`ml-2 text-sm font-medium text-gray-900 ${isCrawling ? 'opacity-60' : 'cursor-pointer'}`}>{t('chunking.enableCheckbox')}</label>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">{t('chunking.enableDescription')}</p>
                        <div className={`space-y-4 transition-opacity duration-300 ${!enableChunking ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div>
                                <label htmlFor='chunk-size' className='block text-sm font-medium text-gray-700'>{t('chunking.sizeLabel', { min: MIN_CHUNK_SIZE, max: MAX_CHUNK_SIZE })}</label>
                                <div className="mt-1">
                                    <input
                                        id='chunk-size'
                                        type='number'
                                        min={MIN_CHUNK_SIZE}
                                        max={MAX_CHUNK_SIZE}
                                        defaultValue={MAX_CHUNK_SIZE}
                                        className='w-24 rounded-md border border-gray-300 py-1.5 px-2 shadow-sm'
                                        value={displayChunkSize}
                                        onChange={e => setDisplayChunkSize(e.target.value)}
                                        onBlur={handleChunkSizeBlur}
                                        disabled={!enableChunking || isCrawling}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{t('chunking.sizeDescription')}</p>
                            </div>
                            <div>
                                <label htmlFor='chunk-delay' className='block text-sm font-medium text-gray-700'>{t('chunking.delayLabel', { min: MIN_CHUNK_DELAY, max: MAX_CHUNK_DELAY })}</label>
                                <div className="mt-1">
                                    <input
                                        id='chunk-delay'
                                        type='number'
                                        min={MIN_CHUNK_DELAY}
                                        max={MAX_CHUNK_DELAY}
                                        defaultValue={MAX_CHUNK_DELAY}
                                        className='w-24 rounded-md border border-gray-300 py-1.5 px-2 shadow-sm'
                                        value={displayChunkDelay}
                                        onChange={e => setDisplayChunkDelay(e.target.value)}
                                        onBlur={handleChunkDelayBlur}
                                        disabled={!enableChunking || isCrawling}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{t('chunking.delayDescription')}</p>
                            </div>
                        </div>
                    </div>

                    <div className='rounded-md border border-gray-200 bg-gray-5 p-5 space-y-4 shadow-sm'>
                        <h4 className='text-base font-semibold text-gray-800'>{t('output.title')}</h4>
                        <div className='flex items-center'>
                            <input
                                id='record-file'
                                type='checkbox'
                                className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed'
                                checked={recordFile}
                                onChange={e => setRecordFile(e.target.checked)}
                                disabled={isCrawling}
                            />
                            <label htmlFor='record-file' className={`ml-2 text-sm font-medium text-gray-900 ${isCrawling ? 'opacity-60' : 'cursor-pointer'}`}>
                                {t('output.recordFileLabel')}
                            </label>
                        </div>
                        <p className="text-xs text-gray-500">{t('output.recordFileDescription')}</p>
                    </div>
                </div>

                <div>
                    <div className="rounded-md border border-gray-200 bg-gray-5 p-5 space-y-4 shadow-sm h-full">
                        <h4 className='text-base font-semibold text-gray-800'>{t('apiSelection.title')}</h4>
                        <p className="text-sm font-medium text-gray-700 mb-3">{t('apiSelection.description')} <span className="text-red-500">*</span></p>
                        <p className="text-xs text-gray-500 mb-4">{t('apiSelection.modelTypeHint')}</p>
                        <div className="space-y-4">
                            {apiStepsForUploader.map(step => (
                                <div key={step.name} className="p-3 bg-white rounded-md border border-gray-100 shadow-sm">
                                    <label className='block text-xs font-semibold text-gray-700 mb-1.5'>{step.displayName}:</label>
                                    <div className='flex flex-wrap gap-x-5 gap-y-2'>
                                        {(['non-tuned', 'tuned'] as CrawlModelType[]).map(modelValue => {
                                            // THAY ĐỔI: Luôn disabled các lựa chọn model
                                            const isDisabled = true; // Luôn disabled
                                            return (
                                                <div key={modelValue} className='flex items-center'>
                                                    <input
                                                        id={`model-${step.name}-${modelValue}`}
                                                        name={`model-${step.name}`}
                                                        type='radio'
                                                        value={modelValue}
                                                        // THAY ĐỔI: Luôn kiểm tra 'non-tuned'
                                                        checked={apiModels[step.name] === 'non-tuned' && modelValue === 'non-tuned'}
                                                        // THAY ĐỔI: Không cho phép thay đổi qua onChange
                                                        onChange={() => { /* Do nothing, as it's disabled */ }}
                                                        disabled={isDisabled} // Sử dụng biến isDisabled mới
                                                        className='h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed'
                                                    />
                                                    <label htmlFor={`model-${step.name}-${modelValue}`} className={`ml-2 block text-sm font-medium text-gray-900 capitalize ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                                                        {t(`modelValues.${modelValue}`)}
                                                    </label>
                                                    {/* THAY ĐỔI: Hiển thị thông báo disabled chung cho cả hai lựa chọn */}
                                                    {/* {isDisabled && (<span className="ml-2 px-1.5 py-0.5 text-xs font-medium text-red-700 bg-red-100 rounded-full">{t('apiSelection.temporarilyDisabled')}</span>)} */}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-3">
                                        <button type="button" onClick={() => toggleDescription(step.name)} className="flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 focus:outline-none">
                                            {openApiDescriptions[step.name] ? t('details.hide') : t('details.show')}
                                            <svg className={`ml-1 h-3 w-3 transition-transform duration-200 ${openApiDescriptions[step.name] ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </button>
                                        {openApiDescriptions[step.name] && (
                                            <div className={`mt-2 transition-all duration-300 ease-in-out ${isCrawling ? 'opacity-60' : ''}`}>
                                                <p className="text-xs text-gray-600 mb-1"><span className="font-semibold">{apiDescriptions[step.name].name}:</span> {apiDescriptions[step.name].purpose}</p>
                                                <p className="text-xs text-gray-600">
                                                    <span className="font-semibold">{t('details.modelCapabilities')}:</span><br />
                                                    <span className="font-semibold capitalize">{t('modelValues.non-tuned')}:</span> {modelDescriptions['non-tuned']}<br />
                                                    {/* Giữ nguyên phần này nếu bạn muốn hiển thị thông tin về tuned model nhưng vẫn disabled */}
                                                    {step.name !== 'extractCfp' && (<><span className="font-semibold capitalize">{t('modelValues.tuned')}:</span> {modelDescriptions['tuned']}</>)}
                                                    {/* {step.name === 'extractCfp' && (<span className="text-red-500 italic">({t('apiSelection.cfpTunedUnavailable')})</span>)} */}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    {/* Cảnh báo này có thể không cần thiết nữa vì model luôn được chọn */}
                                    {/* {apiModels[step.name] === null && !isCrawling && (<p className="text-xs text-red-600 mt-1.5">{t('apiSelection.selectModelWarning', { apiName: step.displayName.replace(' Model', '') })}</p>)} */}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cảnh báo này cũng có thể không cần thiết nữa vì model luôn được chọn */}
            {/* {!allModelsSelected && !isCrawling && (
                <p className="text-sm text-red-600 mt-3 p-2.5 bg-red-50 border border-red-200 rounded-md">
                    <span className="font-semibold">{t('warning.important')}:</span> {t('warning.selectModelsBeforeProceeding')}
                </p>
            )} */}

            <div className="mt-6 flex justify-between">
                <button type="button" onClick={onPrev} disabled={isCrawling} className="inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none">{t('navigation.previousStep')}</button>
                <button type="button" onClick={onNext} disabled={!canProceed || isCrawling} className="inline-flex items-center px-5 py-2.5 border transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-blue-400 disabled:shadow-none">{t('navigation.nextStep')}</button>
            </div>
        </div>
    );
};

export default ConfigurationStep;