import React from 'react';
import { JournalWithStatus } from '@/src/hooks/crawl/useJournalCrawl';
import { Checkbox } from '@/src/components/ui/checkbox';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface JournalTableRowProps {
    journalData: JournalWithStatus;
    isSelected: boolean;
    isExpanded: boolean;
    onSelectToggle: (uniqueRowId: string) => void;
    onToggleExpand: (uniqueRowId: string) => void;
}

export const JournalTableRow: React.FC<JournalTableRowProps> = ({
    journalData,
    isSelected,
    isExpanded,
    onSelectToggle,
    onToggleExpand,
}) => {
    const handleSelectToggle = () => {
        onSelectToggle(journalData.Issn);
    };

    const handleExpandToggle = () => {
        onToggleExpand(journalData.Issn);
    };

    return (
        <>
            <tr className={isSelected ? 'bg-blue-50' : ''}>
                <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={handleSelectToggle}
                        aria-label="Select row"
                    />
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    <div className="flex items-center">
                        <button
                            onClick={handleExpandToggle}
                            className="mr-2 text-gray-400 hover:text-gray-500"
                        >
                            {isExpanded ? (
                                <ChevronDown className="h-5 w-5" />
                            ) : (
                                <ChevronRight className="h-5 w-5" />
                            )}
                        </button>
                        {journalData.Title}
                    </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {journalData.Issn}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {journalData.Publisher}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            journalData.Type === 'Crawled'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                        }`}
                    >
                        {journalData.Type}
                    </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {journalData.lastUpdated
                        ? new Date(journalData.lastUpdated).toLocaleDateString()
                        : 'N/A'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {journalData.message}
                </td>
            </tr>
            {isExpanded && (
                <tr>
                    <td colSpan={7} className="px-6 py-4 bg-gray-50">
                        <div className="text-sm text-gray-500">
                            {/* Add expanded content here if needed */}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}; 