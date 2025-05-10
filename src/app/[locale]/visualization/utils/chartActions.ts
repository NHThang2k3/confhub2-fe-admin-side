// src/utils/chartActions.ts
import { MutableRefObject } from 'react';
import type { EChartsType } from '@/src/models/visualization/echarts';
import { saveAs } from 'file-saver';

const logPrefixCA = "[ChartActions]";

/**
 * Downloads the current state of an ECharts instance as an SVG file.
 *
 * @param chartInstanceRef - A React ref object containing the ECharts instance.
 * @param filename - The desired filename for the downloaded SVG (without extension). Defaults to 'chart'.
 */
export const downloadChartAsSvg = (
    // --- This type should now match the ref in VisualizationPage ---
    chartInstanceRef: MutableRefObject<EChartsType | null | undefined>,
    filename: string = 'chart'
) => {
    console.log(`${logPrefixCA} Attempting to download chart as SVG: ${filename}.svg`);
    const instance = chartInstanceRef.current;

    if (!instance || typeof instance.getDataURL !== 'function') {
        console.error(`${logPrefixCA} Chart instance not available or doesn't support getDataURL.`);
        alert("Could not download chart: Instance not ready or invalid.");
        return;
    }

    try {
        console.log(`${logPrefixCA} Generating SVG Data URL...`);
        const svgDataUrl = instance.getDataURL({
            type: 'svg',
            pixelRatio: 2,
            backgroundColor: '#fff',
            excludeComponents: ['toolbox']
        });

        if (!svgDataUrl || !svgDataUrl.startsWith('data:image/svg+xml')) {
             console.error(`${logPrefixCA} Failed to generate valid SVG Data URL.`);
             alert("Error creating SVG file: Could not generate valid SVG data.");
             return;
        }

        console.log(`${logPrefixCA} Converting Data URL to Blob...`);
        fetch(svgDataUrl)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Failed to fetch SVG data: ${res.status} ${res.statusText}`);
                }
                return res.blob();
            })
            .then(blob => {
                console.log(`${logPrefixCA} Triggering download using file-saver...`);
                saveAs(blob, `${filename}.svg`);
                console.log(`${logPrefixCA} SVG download initiated successfully.`);
            })
            .catch(error => {
                console.error(`${logPrefixCA} Error converting SVG Data URL to Blob or saving:`, error);
                alert(`Error preparing SVG file for download: ${error instanceof Error ? error.message : String(error)}`);
            });

    } catch (error) {
        console.error(`${logPrefixCA} Error generating SVG Data URL:`, error);
        alert(`Error creating SVG file: ${error instanceof Error ? error.message : String(error)}.`);
    }
};