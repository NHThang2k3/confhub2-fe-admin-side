// import React from 'react';
// import { useTranslations } from 'next-intl';

// interface GlobalActionControlsProps {
//   globalActionType: 'crawl' | 'update';
//   onGlobalActionTypeChange: (type: 'crawl' | 'update') => void;
//   onApplyGlobalActionToAllSelected: () => void;
//   onApplyGlobalActionToPageSelected: () => void;
//   totalSelectedRowCount: number;
//   pageSelectedRowCount: number;
//   canApplyToPage: boolean;
//   onSelectAllDataRows: () => void;
//   onDeselectAllDataRows: () => void;
//   isAllDataSelected: boolean;
//   totalDataRowsCount: number;
// }

// const GlobalActionControls: React.FC<GlobalActionControlsProps> = ({
//   globalActionType,
//   onGlobalActionTypeChange,
//   onApplyGlobalActionToAllSelected,
//   onApplyGlobalActionToPageSelected,
//   totalSelectedRowCount,
//   pageSelectedRowCount,
//   canApplyToPage,
//   onSelectAllDataRows,
//   onDeselectAllDataRows,
//   isAllDataSelected,
//   totalDataRowsCount,
// }) => {
//   const t = useTranslations('JournalSelectionStep');

//   return (
//     <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//       <div className="flex items-center gap-4">
//         <div className="flex items-center gap-2">
//           <select
//             value={globalActionType}
//             onChange={(e) => onGlobalActionTypeChange(e.target.value as 'crawl' | 'update')}
//             className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
//           >
//             <option value="crawl">{t('actions.crawl')}</option>
//             <option value="update">{t('actions.update')}</option>
//           </select>
//           <button
//             onClick={onApplyGlobalActionToAllSelected}
//             disabled={totalSelectedRowCount === 0}
//             className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {t('actions.applyToAllSelected')}
//           </button>
//           <button
//             onClick={onApplyGlobalActionToPageSelected}
//             disabled={!canApplyToPage || pageSelectedRowCount === 0}
//             className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {t('actions.applyToPageSelected')}
//           </button>
//         </div>
//       </div>

//       <div className="flex items-center gap-4">
//         <div className="flex items-center gap-2">
//           <button
//             onClick={onSelectAllDataRows}
//             className="text-sm text-blue-600 hover:text-blue-800"
//           >
//             {t('actions.selectAll')}
//           </button>
//           <button
//             onClick={onDeselectAllDataRows}
//             className="text-sm text-blue-600 hover:text-blue-800"
//           >
//             {t('actions.deselectAll')}
//           </button>
//         </div>
//         <div className="text-sm text-gray-600">
//           {totalSelectedRowCount} of {totalDataRowsCount} selected
//         </div>
//       </div>
//     </div>
//   );
// };

// export default GlobalActionControls; 