// import { Table } from '@tanstack/react-table';
// import { Input } from '@/src/components/ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';

// interface TableFiltersProps<TData> {
//   table: Table<TData>;
// }

// export default function TableFilters<TData>({ table }: TableFiltersProps<TData>) {
//   return (
//     <div className="flex items-center gap-4">
//       <Input
//         placeholder="Filter by title..."
//         value={(table.getColumn('Title')?.getFilterValue() as string) ?? ''}
//         onChange={(event) =>
//           table.getColumn('Title')?.setFilterValue(event.target.value)
//         }
//         className="max-w-sm"
//       />
//       <Select
//         value={(table.getColumn('Type')?.getFilterValue() as string) ?? ''}
//         onValueChange={(value) => table.getColumn('Type')?.setFilterValue(value)}
//       >
//         <SelectTrigger className="w-[180px]">
//           <SelectValue placeholder="Filter by status" />
//         </SelectTrigger>
//         <SelectContent>
//           <SelectItem value="">All</SelectItem>
//           <SelectItem value="Crawled">Crawled</SelectItem>
//           <SelectItem value="Not Crawled">Not Crawled</SelectItem>
//         </SelectContent>
//       </Select>
//     </div>
//   );
// } 