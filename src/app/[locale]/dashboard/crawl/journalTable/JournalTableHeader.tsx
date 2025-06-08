import React from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/src/components/ui/input';
import { Checkbox } from '@/src/components/ui/checkbox';
import { JournalWithStatus } from '@/src/models/logAnalysis/importJournalCrawl';

type SortableColumn = keyof JournalWithStatus;

interface JournalTableHeaderProps {
    sortColumn: SortableColumn | null;
    sortDirection: 'asc' | 'desc';
    onSort: (column: SortableColumn) => void;
    columnFilters: Record<SortableColumn, string>;
    onColumnFilterChange: (column: SortableColumn, value: string) => void;
    totalRowsCount: number;
    selectedRowsCount: number;
    onSelectAll: () => void;
}

export const JournalTableHeader: React.FC<JournalTableHeaderProps> = ({
    sortColumn,
    sortDirection,
    onSort,
    columnFilters,
    onColumnFilterChange,
    totalRowsCount,
    selectedRowsCount,
    onSelectAll,
}) => {
    const t = useTranslations('JournalTable');

    const handleSort = (column: SortableColumn) => {
        onSort(column);
    };

    const handleFilterChange = (column: SortableColumn, value: string) => {
        onColumnFilterChange(column, value);
    };

    return (
        <thead className="bg-background border-b border-border">
            <tr>
                <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
                    <Checkbox
                        checked={selectedRowsCount > 0 && selectedRowsCount === totalRowsCount}
                        onCheckedChange={onSelectAll}
                        aria-label="Select all"
                    />
                </th>
                <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort('Title')}
                >
                    {t('title')}
                    {sortColumn === 'Title' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                </th>
                <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort('Issn')}
                >
                    {t('issn')}
                    {sortColumn === 'Issn' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                </th>
                <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort('Publisher')}
                >
                    {t('publisher')}
                    {sortColumn === 'Publisher' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                </th>
                <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort('Type')}
                >
                    {t('status')}
                    {sortColumn === 'Type' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                </th>
                <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort('lastUpdated')}
                >
                    {t('lastUpdated')}
                    {sortColumn === 'lastUpdated' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                </th>
                <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-foreground"
                >
                    {t('message')}
                </th>
            </tr>
            <tr>
                <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
                    {/* Empty cell for checkbox column */}
                </th>
                <th scope="col" className="px-3 py-2">
                    <Input
                        type="text"
                        placeholder={t('filterByTitle')}
                        value={columnFilters.Title || ''}
                        onChange={(e) => handleFilterChange('Title', e.target.value)}
                        className="h-8"
                    />
                </th>
                <th scope="col" className="px-3 py-2">
                    <Input
                        type="text"
                        placeholder={t('filterByIssn')}
                        value={columnFilters.Issn || ''}
                        onChange={(e) => handleFilterChange('Issn', e.target.value)}
                        className="h-8"
                    />
                </th>
                <th scope="col" className="px-3 py-2">
                    <Input
                        type="text"
                        placeholder={t('filterByPublisher')}
                        value={columnFilters.Publisher || ''}
                        onChange={(e) => handleFilterChange('Publisher', e.target.value)}
                        className="h-8"
                    />
                </th>
                <th scope="col" className="px-3 py-2">
                    <Input
                        type="text"
                        placeholder={t('filterByStatus')}
                        value={columnFilters.Type || ''}
                        onChange={(e) => handleFilterChange('Type', e.target.value)}
                        className="h-8"
                    />
                </th>
                <th scope="col" className="px-3 py-2">
                    {/* No filter for lastUpdated */}
                </th>
                <th scope="col" className="px-3 py-2">
                    {/* No filter for message */}
                </th>
            </tr>
        </thead>
    );
}; 