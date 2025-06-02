import { ColumnDef } from '@tanstack/react-table';
import { JournalWithStatus } from '@/src/hooks/crawl/journal/useJournalCrawl';
import { Checkbox } from '@/src/components/ui/checkbox';
import { useTranslations } from 'next-intl';

type HandleUpdateActionType = (actionType: 'crawl' | 'update', journal: JournalWithStatus) => void;

export const getJournalTableColumns = (handleUpdateActionTypeForRow: HandleUpdateActionType): ColumnDef<JournalWithStatus>[] => {
  const t = useTranslations('JournalSelectionStep');

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: boolean) => row.toggleSelected(value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'Title',
      header: 'Title',
      cell: ({ row }) => <div className="font-medium">{row.getValue('Title')}</div>,
    },
    {
      accessorKey: 'Issn',
      header: 'ISSN',
      cell: ({ row }) => <div>{row.getValue('Issn')}</div>,
    },
    {
      accessorKey: 'Publisher',
      header: 'Publisher',
      cell: ({ row }) => <div>{row.getValue('Publisher')}</div>,
    },
    {
      accessorKey: 'Type',
      header: 'Status',
      cell: ({ row }) => (
        <div className={`font-medium ${row.getValue('Type') === 'Crawled' ? 'text-green-600' : 'text-orange-600'}`}>
          {row.getValue('Type')}
        </div>
      ),
    },
    {
      accessorKey: 'lastUpdated',
      header: 'Last Updated',
      cell: ({ row }) => {
        const date = row.getValue('lastUpdated');
        return date ? new Date(date as string).toLocaleDateString() : 'N/A';
      },
    },
    {
      accessorKey: 'message',
      header: 'Message',
      cell: ({ row }) => {
        const message = row.getValue('message') as string | undefined;
        return (
          <div className={`${message?.includes('Error') ? 'text-red-600' : ''}`}>
            {message}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: t('actions.title'),
      cell: ({ row }) => {
        const journal = row.original;
        return (
          <div className="flex items-center gap-2">
            <select
              value={journal.actionType || 'crawl'}
              onChange={(e) => handleUpdateActionTypeForRow(e.target.value as 'crawl' | 'update', journal)}
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="crawl">{t('actions.crawl')}</option>
              <option value="update">{t('actions.update')}</option>
            </select>
          </div>
        );
      },
      enableSorting: false,
    },
  ];
}; 