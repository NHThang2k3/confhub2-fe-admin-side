'use client';
import { useState, useCallback } from 'react'; // Bỏ import useEffect vì không dùng nữa
import { Conference, ConferenceForAction } from '../../../models/logAnalysis/importConferenceCrawl';

const LOG_PREFIX = '[useSelectionManager]';

export const getConferenceIdentifier = (conference: Partial<Conference>): string | undefined => {
    return conference.id || conference.acronym;
};

export const useSelectionManager = (
    parsedData: Conference[] | null,
    setParsedData: (data: Conference[] | null) => void
) => {
    const [selectedCsvRows, setSelectedCsvRows] = useState<ConferenceForAction[]>([]);

    // === XÓA BỎ HOÀN TOÀN useEffect GÂY LỖI Ở ĐÂY ===
    // useEffect(() => {
    //     console.log(`${LOG_PREFIX} Source data (parsedData) changed. Resetting selected rows.`);
    //     setSelectedCsvRows([]);
    // }, [parsedData]);
    // Việc reset `selectedCsvRows` giờ sẽ được xử lý một cách tự nhiên khi
    // `onCsvSelectionChanged` được gọi với một mảng rỗng từ component cha.

    const onCsvSelectionChanged = useCallback((selectedRows: Conference[]) => {
        console.log(`${LOG_PREFIX} onCsvSelectionChanged triggered with ${selectedRows.length} rows.`);
        const selectedIdentifiers = selectedRows.map(r => getConferenceIdentifier(r) || 'NO_ID');
        console.log(`${LOG_PREFIX} Identifiers of selected rows:`, selectedIdentifiers);

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

    // Hàm này đã đúng, giữ nguyên
    const updateActionTypeOfSelectedRows = useCallback((
        actionType: 'crawl' | 'update',
        selectedRowsToUpdate: Conference[]
    ): { updatedCount: number } => {
        console.log(`${LOG_PREFIX} updateActionTypeOfSelectedRows called for action: '${actionType}' on ${selectedRowsToUpdate.length} rows.`);

        if (selectedRowsToUpdate.length === 0 || !parsedData) {
            console.warn(`${LOG_PREFIX} Aborting update: No rows to update or no parsed data.`);
            return { updatedCount: 0 };
        }

        const selectedIdentifiers = new Set(
            selectedRowsToUpdate.map(getConferenceIdentifier).filter(Boolean) as string[]
        );

        console.log(`${LOG_PREFIX} Created a Set of identifiers to update:`, selectedIdentifiers);

        if (selectedIdentifiers.size === 0) {
            console.warn(`${LOG_PREFIX} Aborting update: No valid identifiers found in selected rows.`);
            return { updatedCount: 0 };
        }

        let updatedCount = 0;

        const newParsedData = parsedData.map((conf, index) => {
            const currentIdentifier = getConferenceIdentifier(conf);
            if (currentIdentifier && selectedIdentifiers.has(currentIdentifier)) {
                updatedCount++;
                if (updatedCount <= 5) {
                    console.log(`${LOG_PREFIX} Match found! Updating row with identifier '${currentIdentifier}' (index ${index}) to type '${actionType}'.`);
                }
                return { ...conf, crawlType: actionType };
            }
            return conf;
        });

        if (updatedCount > 0) {
            console.log(`${LOG_PREFIX} Update complete. ${updatedCount} rows were modified. Calling setParsedData with new data array.`);
            setParsedData(newParsedData);
        } else {
            console.warn(`${LOG_PREFIX} No rows were matched for update. Data was not changed.`);
        }

        return { updatedCount };
    }, [parsedData, setParsedData]);

    const reset = useCallback(() => {
        console.log(`${LOG_PREFIX} Reset called. Clearing selected rows.`);
        setSelectedCsvRows([]);
    }, []);

    return {
        selectedCsvRows,
        selectedCsvRowsCount: selectedCsvRows.length,
        onCsvSelectionChanged,
        updateActionTypeOfSelectedRows,
        reset,
    };
};