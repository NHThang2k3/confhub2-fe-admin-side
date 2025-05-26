// src/app/[locale]/dashboard/logAnalysis/steps/conferenceTable/conferenceTable.columns.ts
import { ColumnDef, SortingFn, sortingFns } from '@tanstack/react-table';
import { Conference } from '@/src/models/logAnalysis/importConferenceCrawl';

// Custom sorting function for dates that might be strings
const dateStringSort: SortingFn<Conference> = (rowA, rowB, columnId) => {
  const valA = rowA.getValue<string | null | undefined>(columnId);
  const valB = rowB.getValue<string | null | undefined>(columnId);

  if (valA == null && valB == null) return 0;
  if (valA == null) return 1; // nulls/undefined to the end
  if (valB == null) return -1; // nulls/undefined to the end

  const dateA = new Date(valA).getTime();
  const dateB = new Date(valB).getTime();

  if (isNaN(dateA) && isNaN(dateB)) return String(valA).localeCompare(String(valB)); // fallback to string compare if both invalid
  if (isNaN(dateA)) return 1; // invalid dates to the end
  if (isNaN(dateB)) return -1; // invalid dates to the end

  return dateA - dateB;
};

export const getConferenceTableColumns = (
  onUpdateActionTypeForRow: (actionType: 'crawl' | 'update', conference: Conference) => void
): ColumnDef<Conference>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 60,
  },
  {
    accessorKey: 'acronym',
    header: 'Acronym',
    cell: ({ row }) => <div className="font-medium">{row.getValue('acronym')}</div>,
    sortingFn: sortingFns.alphanumeric, // Robust alphanumeric sort
    size: 150,
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => <div className="font-medium">{row.getValue('title')}</div>,
    sortingFn: sortingFns.text, // Case-insensitive text sort
    size: 300,
  },
  {
    accessorKey: 'crawlType',
    header: 'Action Type',
    cell: ({ row }) => {
      const crawlType = row.getValue('crawlType') as 'crawl' | 'update';
      return (
        <select
          value={crawlType}
          onChange={(e) => {
            const newValue = e.target.value as 'crawl' | 'update';
            if (newValue !== crawlType) {
              onUpdateActionTypeForRow(newValue, row.original);
            }
          }}
          onClick={(e) => e.stopPropagation()}
          className={`font-semibold ${
            crawlType === 'crawl' ? 'text-blue-700' : 'text-green-700'
          } bg-transparent border-none focus:ring-0 p-1 rounded hover:bg-gray-100`}
        >
          <option value="crawl">Crawl</option>
          <option value="update">Update</option>
        </select>
      );
    },
    sortingFn: sortingFns.alphanumeric,
    size: 120,
  },
  {
    accessorKey: 'sources',
    header: 'Sources',
    cell: ({ row }) => row.getValue('sources'), // Keep it simple if it's just a string
    sortingFn: sortingFns.text,
    size: 150,
  },
  {
    accessorKey: 'ranks',
    header: 'Ranks',
    cell: ({ row }) => row.getValue('ranks'),
    sortingFn: sortingFns.text, // Or 'alphanumeric' if they can be numbers/text mix
    size: 100,
  },
  {
    accessorKey: 'researchFields',
    header: 'Research Fields',
    cell: ({ row }) => row.getValue('researchFields'),
    sortingFn: sortingFns.text,
    size: 200,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => row.getValue('status'),
    sortingFn: sortingFns.alphanumeric,
    size: 100,
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated At',
    cell: ({ row }) => {
      const dateVal = row.getValue('updatedAt');
      // Ensure dateVal is treated as a string or number for new Date()
      return dateVal ? new Date(dateVal as string | number).toLocaleString() : '';
    },
    sortingFn: dateStringSort,
    size: 200,
  },
  {
    accessorKey: 'link',
    header: 'Link (for Update)',
    cell: ({ row }) => {
      const crawlType = row.getValue('crawlType') as 'crawl' | 'update';
      return (
        <div className={crawlType === 'crawl' ? 'italic text-gray-500' : ''}>
          {row.getValue('link') || (crawlType === 'crawl' ? 'N/A for Crawl' : '')}
        </div>
      );
    },
    enableSorting: false,
    size: 250,
  },
  {
    accessorKey: 'impLink',
    header: 'Imp Link (for Update)',
    cell: ({ row }) => {
      const crawlType = row.getValue('crawlType') as 'crawl' | 'update';
      return (
        <div className={crawlType === 'crawl' ? 'italic text-gray-500' : ''}>
          {row.getValue('impLink') || (crawlType === 'crawl' ? 'N/A for Crawl' : '')}
        </div>
      );
    },
    enableSorting: false,
    size: 250,
  },
  {
    accessorKey: 'cfpLink',
    header: 'Cfp Link (for Update)',
    cell: ({ row }) => {
      const crawlType = row.getValue('crawlType') as 'crawl' | 'update';
      return (
        <div className={crawlType === 'crawl' ? 'italic text-gray-500' : ''}>
          {row.getValue('cfpLink') || (crawlType === 'crawl' ? 'N/A for Crawl' : '')}
        </div>
      );
    },
    enableSorting: false,
    size: 250,
  },
];