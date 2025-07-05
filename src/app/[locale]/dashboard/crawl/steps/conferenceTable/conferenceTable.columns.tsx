// src/app/[locale]/dashboard/logAnalysis/steps/conferenceTable/conferenceTable.columns.ts
import { ColumnDef, SortingFn, sortingFns, filterFns, CellContext } from '@tanstack/react-table';
import { Conference } from '@/src/models/logAnalysis/importConferenceCrawl';

// Custom sorting function for dates that might be strings
const dateStringSort: SortingFn<Conference> = (rowA, rowB, columnId) => {
  const valA = rowA.getValue<string | null | undefined>(columnId);
  const valB = rowB.getValue<string | null | undefined>(columnId);

  if (valA == null && valB == null) return 0;
  if (valA == null) return 1; // nulls last
  if (valB == null) return -1; // nulls last

  const dateA = new Date(valA).getTime();
  const dateB = new Date(valB).getTime();

  // Handle cases where date parsing might fail (e.g., invalid date strings)
  if (isNaN(dateA) && isNaN(dateB)) return String(valA).localeCompare(String(valB)); // Fallback to string compare
  if (isNaN(dateA)) return 1; // Invalid dates last
  if (isNaN(dateB)) return -1; // Invalid dates last

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
          // getIsAllPageRowsSelected: Checks if all rows on the current page are selected.
          // This is correct for a "select page" checkbox in the header.
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          aria-label="Select all rows on this page"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          aria-label={`Select row ${row.id}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 60, // Kích thước cho cột checkbox
    },
    {
      accessorKey: 'acronym',
      header: 'Acronym',
      // CHANGE: Loại bỏ `whitespace-nowrap`
      cell: ({ row }) => <div className="font-medium">{row.getValue('acronym')}</div>,
      sortingFn: sortingFns.alphanumeric,
      filterFn: filterFns.includesString,
      size: 150,
    },
    {
      accessorKey: 'title',
      header: 'Title',
      // Cột này giữ nguyên là đúng vì chúng ta muốn có hiệu ứng "..."
      cell: (info: CellContext<Conference, unknown>) => (
        <div
          className="font-medium overflow-hidden whitespace-nowrap text-ellipsis"
          style={{ maxWidth: `${info.cell.column.getSize()}px` }}
          title={info.row.getValue('title') as string}
        >
          {info.row.getValue('title')}
        </div>
      ),
      sortingFn: sortingFns.text,
      filterFn: filterFns.includesString,
      size: 250,
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
            // CHANGE: Loại bỏ `whitespace-nowrap`
            className={`font-semibold w-full py-1 px-2 rounded border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 text-sm ${crawlType === 'crawl' ? 'text-blue-700 bg-blue-50' : 'text-green-700 bg-green-50'
              } hover:bg-gray-100`}
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
      // Cột này đã đúng, giữ nguyên
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {(row.getValue('sources') as string[])?.map((source: string, index: number) => (
            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
              {source}
            </span>
          ))}
        </div>
      ),
      sortingFn: sortingFns.text,
      filterFn: filterFns.includesString,
      size: 150,
    },
    {
      accessorKey: 'ranks',
      header: 'Ranks',
      // Cột này đã đúng, giữ nguyên
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {(row.getValue('ranks') as string[])?.map((rank: string, index: number) => (
            <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
              {rank}
            </span>
          ))}
        </div>
      ),
      sortingFn: sortingFns.text,
      filterFn: filterFns.includesString,
      size: 100,
    },
    {
      accessorKey: 'researchFields',
      header: 'Research Fields',
      // Cột này là nguyên nhân chính và code đã đúng, giữ nguyên
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {(row.getValue('researchFields') as string[])?.map((field: string, index: number) => (
            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
              {field}
            </span>
          ))}
        </div>
      ),
      sortingFn: sortingFns.text,
      filterFn: filterFns.includesString,
      size: 200,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        let statusColor = 'text-gray-700';
        if (status === 'CRAWLED') {
          statusColor = 'text-green-700';
        } else if (status === 'NOT CRAWLED') {
          statusColor = 'text-red-700';
        }
        // CHANGE: Loại bỏ `whitespace-nowrap`
        return <div className={`font-medium ${statusColor}`}>{status}</div>;
      },
      sortingFn: sortingFns.alphanumeric,
      filterFn: filterFns.equalsString,
      size: 120,
    },
    {
      accessorKey: 'updatedAt',
      header: 'Updated At',
      cell: ({ row }) => {
        const dateVal = row.getValue('updatedAt');
        // CHANGE: Loại bỏ `whitespace-nowrap`
        return <div>{dateVal ? new Date(dateVal as string | number).toLocaleString() : 'N/A'}</div>;
      },
      sortingFn: dateStringSort,
      size: 200,
    },
    // Các cột link cũng được bỏ `whitespace-nowrap`
    {
      accessorKey: 'link',
      header: 'Link (for Update)',
      cell: ({ row }) => {
        const crawlType = row.original.crawlType;
        const linkValue = row.getValue('link') as string | null | undefined;
        return (
          <div className={`${crawlType === 'crawl' ? 'italic text-gray-400' : ''}`}>
            {linkValue || (crawlType === 'crawl' ? 'N/A for Crawl' : 'Not Provided')}
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
        const crawlType = row.original.crawlType;
        const impLinkValue = row.getValue('impLink') as string | null | undefined;
        return (
          <div className={`${crawlType === 'crawl' ? 'italic text-gray-400' : ''}`}>
            {impLinkValue || (crawlType === 'crawl' ? 'N/A for Crawl' : 'Not Provided')}
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
        const crawlType = row.original.crawlType;
        const cfpLinkValue = row.getValue('cfpLink') as string | null | undefined;
        return (
          <div className={`${crawlType === 'crawl' ? 'italic text-gray-400' : ''}`}>
            {cfpLinkValue || (crawlType === 'crawl' ? 'N/A for Crawl' : 'Not Provided')}
          </div>
        );
      },
      enableSorting: false,
      size: 250,
    },
  ];