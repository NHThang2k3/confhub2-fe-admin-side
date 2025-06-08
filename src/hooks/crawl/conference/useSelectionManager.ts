// src/hooks/crawl/conference/useSelectionManager.ts
'use client';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Conference, ConferenceForAction } from '../../../models/logAnalysis/importConferenceCrawl';

export const useSelectionManager = (
    parsedData: Conference[] | null,
    setParsedData: (data: Conference[] | null) => void
) => {
    const [selectedCsvRows, setSelectedCsvRows] = useState<ConferenceForAction[]>([]);

    // Reset selections if the source data changes (e.g., new file uploaded)
    useEffect(() => {
        setSelectedCsvRows([]);
    }, [parsedData]);

    const onCsvSelectionChanged = useCallback((selectedRows: Conference[]) => {
        const selectedActions: ConferenceForAction[] = selectedRows.map(confData => ({
            id: confData.id,
            Title: confData.title,
            Acronym: confData.acronym,
            crawlType: confData.crawlType,
            link: confData.link,
            cfpLink: confData.cfpLink,
            impLink: confData.impLink,
        }));
        setSelectedCsvRows(selectedActions);
    }, []);

    const updateActionTypeOfSelectedRows = useCallback((
        actionType: 'crawl' | 'update',
        selectedRowsToUpdate: Conference[]
    ): { updatedCount: number } => {
        if (selectedRowsToUpdate.length === 0 || !parsedData) return { updatedCount: 0 };

        const selectedIds = new Set(selectedRowsToUpdate.map(row => row.id));
        let updatedCount = 0;

        const newParsedData = parsedData.map(conf => {
            if (selectedIds.has(conf.id)) {
                updatedCount++;
                return { ...conf, crawlType: actionType };
            }
            return conf;
        });

        if (updatedCount > 0) {
            setParsedData(newParsedData);

            const newSelectedCsvRows = selectedCsvRows.map(selRow => {
                if (selectedIds.has(selRow.id)) {
                    return { ...selRow, crawlType: actionType };
                }
                return selRow;
            });
            setSelectedCsvRows(newSelectedCsvRows);
        }
        return { updatedCount };
    }, [parsedData, setParsedData, selectedCsvRows]);

    const selectedCsvRowsCount = useMemo(() => selectedCsvRows.length, [selectedCsvRows]);

    const reset = useCallback(() => {
        setSelectedCsvRows([]);
    }, []);

    return {
        selectedCsvRows,
        selectedCsvRowsCount,
        onCsvSelectionChanged,
        updateActionTypeOfSelectedRows,
        reset,
    };
};