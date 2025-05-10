import { useState, useMemo, useCallback, useEffect } from 'react'; // Thêm useRef
import { EChartsOption } from 'echarts';
import { ChartConfig, ChartOptions, DataField } from '../../models/visualization/visualization';
import { ConferenceDetailsListResponse } from '@/src/models/response/conference.response';
import { getAvailableFields, generateChartOption } from '../../app/[locale]/visualization/utils'; // Import from index.ts

interface UseChartBuilderProps {
    rawData: ConferenceDetailsListResponse | null; // The data fetched from backend
}

interface UseChartBuilderReturn {
    echartsOption: EChartsOption | null;
    availableFields: DataField[];
    chartConfig: ChartConfig;
    chartOptions: ChartOptions;
    isChartReady: boolean;
    updateChartConfig: (newConfig: Partial<ChartConfig>) => void;
    updateChartOptions: (newOptions: Partial<ChartOptions>) => void;
    setChartConfig: React.Dispatch<React.SetStateAction<ChartConfig>>; // For drag-and-drop updates
}

const defaultChartConfig: ChartConfig = {
    chartType: 'bar',
    xAxis: { fieldId: null },
    yAxis: { fieldId: null },
    color: { fieldId: null },
    // size: { fieldId: null }, // Initialize if needed
};

const defaultChartOptions: ChartOptions = {
    title: 'Conference Visualization',
    showLegend: true,
    showToolbox: true,
}

const useChartBuilder = ({ rawData }: UseChartBuilderProps): UseChartBuilderReturn => {
    // console.log(`Hook executing. rawData exists: ${!!rawData}`);
    const [chartConfig, setChartConfig] = useState<ChartConfig>(defaultChartConfig);
    const [chartOptions, setChartOptions] = useState<ChartOptions>(defaultChartOptions);

    // --- Stabilized availableFields Calculation ---
    // Key can be simpler now, just based on whether data exists,
    // as getAvailableFields content is stable.
    const dataExists = useMemo(() => !!rawData && rawData.payload.length > 0, [rawData]);

    // --- Stabilized availableFields Calculation ---
    const availableFields = useMemo<DataField[]>(() => {
        // console.log(`Recalculating availableFields memo (dataExists: ${dataExists})...`);
        if (!dataExists || !rawData) {
            //  console.log(`... no data, returning [].`);
             return [];
        }
        // getAvailableFields now returns a STABLE reference if data exists
        const fields = getAvailableFields(rawData.payload[0]);
        // console.log(`... memo received ${fields.length} available fields (reference should be stable).`);
        return fields;
    }, [dataExists, rawData]); // Keep rawData dependency if getAvailableFields needs the sample


    // --- Process data and generate ECharts option (memoized) ---
    const echartsOption = useMemo<EChartsOption | null>(() => {
        // console.log(`Recalculating echartsOption memo...`);
        if (!dataExists || availableFields.length === 0 || !rawData) {
            //  console.log(`... no data or fields, returning null.`);
             return null;
        }

        try {
            // Pass the stable availableFields reference
            const option = generateChartOption(rawData.payload, chartConfig, chartOptions, availableFields);
            // console.log(`... successfully generated chart option.`);
            return option;
        } catch (error: any) { // Catch specific error
            console.error(`Error generating chart option:`, 'color: red;', error);
            // Return null or a specific error state object instead of {}
            // Returning null signals ChartDisplay to show placeholder
            return null;
            // Optionally return an error structure ECharts can understand, but null is simpler here
            // return { title: { text: `Error: ${error.message}` } };
        }
    }, [dataExists, rawData, chartConfig, chartOptions, availableFields]); // availableFields reference is now stable


    // --- isChartReady (memoized - Add optional chaining) ---
     const isChartReady = useMemo(() => {
        // console.log(`Recalculating isChartReady memo...`);
        // Check if option exists and required fields are selected
        if (!echartsOption || !rawData || !dataExists) {
            //  console.log(`... isChartReady: false (no option/data).`);
             return false;
        }
        // Check if option generation failed (if returning null on error)
        // This check is now implicitly handled by !echartsOption above.

        const { chartType, xAxis, yAxis, color } = chartConfig;
        let ready = false;
        if (chartType === 'pie') {
            ready = !!(color?.fieldId && yAxis?.fieldId);
        } else { // Covers bar, line, scatter etc.
            ready = !!(xAxis?.fieldId && yAxis?.fieldId);
        }
        //  console.log(`... isChartReady result: ${ready} (Type: ${chartType}, X: ${xAxis?.fieldId}, Y: ${yAxis?.fieldId}, Color: ${color?.fieldId})`);
        return ready;
    // }, [echartsOption, chartConfig, rawData, dataExists]); // Add dataExists dependency
     }, [echartsOption, chartConfig, dataExists]); // rawData is implicitly covered by echartsOption and dataExists

    // --- Callbacks (Keep as before) ---
    const updateChartConfig = useCallback((newConfig: Partial<ChartConfig>) => {
        setChartConfig(prev => ({ ...prev, ...newConfig }));
    }, []);
    const updateChartOptions = useCallback((newOptions: Partial<ChartOptions>) => {
        setChartOptions(prev => ({ ...prev, ...newOptions }));
    }, []);


    // console.log(`Returning values. availableFields count: ${availableFields.length}`);
    return {
        echartsOption,
        availableFields, // This reference is now stable once dataExists is true
        chartConfig,
        chartOptions,
        isChartReady,
        updateChartConfig,
        updateChartOptions,
        setChartConfig, // Pass original setter for handleDragEnd/handleRemoveField
    };
};

export default useChartBuilder;