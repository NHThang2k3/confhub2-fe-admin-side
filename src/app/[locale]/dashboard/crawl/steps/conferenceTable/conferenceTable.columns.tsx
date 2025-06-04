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
      cell: ({ row }) => <div className="font-medium whitespace-nowrap">{row.getValue('acronym')}</div>,
      sortingFn: sortingFns.alphanumeric, // Built-in alphanumeric sort
      filterFn: filterFns.includesString, // Default text filter (contains)
      size: 150,
    },
    {
      accessorKey: 'title',
      header: 'Title',
      // cell: ({ row, cell }) => ( // Sửa ở đây: thêm `cell` vào props
      // Hoặc nếu bạn chỉ cần column size, có thể dùng cell.column.getSize()
      cell: (info: CellContext<Conference, unknown>) => ( // Sử dụng CellContext để có type an toàn hơn
        <div
          className="font-medium overflow-hidden whitespace-nowrap text-ellipsis"
          // SỬA Ở ĐÂY: sử dụng info.cell.column.getSize()
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
              // Only call update if the value actually changed
              if (newValue !== crawlType) {
                onUpdateActionTypeForRow(newValue, row.original);
              }
            }}
            onClick={(e) => e.stopPropagation()} // Prevent row selection when clicking the select
            className={`font-semibold w-full py-1 px-2 rounded border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 text-sm ${crawlType === 'crawl' ? 'text-blue-700 bg-blue-50' : 'text-green-700 bg-green-50'
              } hover:bg-gray-100 whitespace-nowrap`}
          >
            <option value="crawl">Crawl</option>
            <option value="update">Update</option>
          </select>
        );
      },
      sortingFn: sortingFns.alphanumeric,
      // No filterFn needed here as it's not a typical filterable column from UI
      size: 120,
    },
    {
      accessorKey: 'sources',
      header: 'Sources',
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
        // Add more conditions for other statuses if needed
        return <div className={`whitespace-nowrap font-medium ${statusColor}`}>{status}</div>;
      },
      sortingFn: sortingFns.alphanumeric,
      filterFn: filterFns.equalsString, // Use exact match for status filter
      // If you need case-insensitive exact match:
      // filterFn: (row, columnId, filterValue) => {
      //   if (filterValue === undefined || filterValue === null || String(filterValue).trim() === '') {
      //     return true;
      //   }
      //   const rowValue = String(row.getValue(columnId) ?? '').toLowerCase();
      //   const filter = String(filterValue).toLowerCase();
      //   return rowValue === filter;
      // },
      size: 120, // Adjusted size
    },
    {
      accessorKey: 'updatedAt',
      header: 'Updated At',
      cell: ({ row }) => {
        const dateVal = row.getValue('updatedAt');
        // Ensure dateVal is a string or number before passing to new Date()
        return <div className="whitespace-nowrap">{dateVal ? new Date(dateVal as string | number).toLocaleString() : 'N/A'}</div>;
      },
      sortingFn: dateStringSort, // Use custom date sort
      size: 200,
    },
    {
      accessorKey: 'link',
      header: 'Link (for Update)',
      cell: ({ row }) => {
        const crawlType = row.original.crawlType; // Access from original data for consistency
        const linkValue = row.getValue('link') as string | null | undefined;
        return (
          <div className={`whitespace-nowrap ${crawlType === 'crawl' ? 'italic text-gray-400' : ''}`}>
            {linkValue || (crawlType === 'crawl' ? 'N/A for Crawl' : 'Not Provided')}
          </div>
        );
      },
      enableSorting: false, // Links are usually not sorted
      size: 250,
    },
    {
      accessorKey: 'impLink',
      header: 'Imp Link (for Update)',
      cell: ({ row }) => {
        const crawlType = row.original.crawlType;
        const impLinkValue = row.getValue('impLink') as string | null | undefined;
        return (
          <div className={`whitespace-nowrap ${crawlType === 'crawl' ? 'italic text-gray-400' : ''}`}>
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
          <div className={`whitespace-nowrap ${crawlType === 'crawl' ? 'italic text-gray-400' : ''}`}>
            {cfpLinkValue || (crawlType === 'crawl' ? 'N/A for Crawl' : 'Not Provided')}
          </div>
        );
      },
      enableSorting: false,
      size: 250,
    },
  ];