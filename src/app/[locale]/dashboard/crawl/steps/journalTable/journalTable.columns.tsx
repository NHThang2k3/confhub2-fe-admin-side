import { ColumnDef } from '@tanstack/react-table';
import { JournalWithStatus } from '@/src/hooks/crawl/useJournalCrawl';
import { Checkbox } from '@/src/components/ui/checkbox';

export const getJournalTableColumns = (): ColumnDef<JournalWithStatus>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
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
    cell: ({ row }) => (
      <div className={`${row.getValue('message')?.includes('Error') ? 'text-red-600' : ''}`}>
        {row.getValue('message')}
      </div>
    ),
  },
]; 