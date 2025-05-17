'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import parser from 'any-date-parser';
import { 
  AllCommunityModule, 
  ColDef, 
  GridReadyEvent, 
  ICellRendererParams, 
  ModuleRegistry, 
  RowSelectionModule,
} from 'ag-grid-community';
import axios from 'axios';

interface Conference {
  id: string;
  title: string;
  acronym: string;
  sources: string[];
  researchFields: string[];
  ranks: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  organizationHistory: Organization[];
}

interface Organization {
  id: string;
  year: number;
  accessType: string;
  isAvailable: boolean;
  publisher: string;
  summerize: string;
  callForPaper: string;
  link: string;
  cfpLink: string;
  impLink: string;
  locations: Location[];
  topics: string[];
  dates: ConferenceDate[];
}

interface Location {
  address: string;
  cityStateProvince: string;
  country: string;
  continent: string;
}

interface ConferenceDate {
  type: string;
  startDate: string;
  endDate: string;
}

interface PaginationMeta {
  total: number;
  lastPage: number;
  currentPage: number;
  perPage: number;
  prev: number | null;
  next: number | null;
}

interface PaginationResponse {
  data: Conference[];
  meta: PaginationMeta;
}

interface FilterState {
  search: string;
  status: string;
  source: string;
  researchFields: string;
  rank: string;
}

interface FilterOptions {
  status: string[];
  sources: string[];
  researchFields: string[];
  ranks: string[];
}

const DATA_API_URL = process.env.NEXT_PUBLIC_DATABASE_URL;
ModuleRegistry.registerModules([AllCommunityModule, RowSelectionModule]);

const TagRenderer = ({ value, color }: { value: string; color: string }) => (
  <span className={`px-2 py-1 rounded text-sm ${color}`}>
    {value}
  </span>
);

const PaginationControls = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  pageSize, 
  onPageSizeChange 
}: { 
  currentPage: number; 
  totalPages: number; 
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}) => {
  const pageNumbers = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="flex items-center gap-2">
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="border rounded px-2 py-1"
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
          <option value={100}>100 per page</option>
        </select>
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          First
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-1 border rounded"
            >
              1
            </button>
            {startPage > 2 && <span>...</span>}
          </>
        )}
        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 border rounded ${
              currentPage === page ? 'bg-blue-500 text-white' : ''
            }`}
          >
            {page}
          </button>
        ))}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span>...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-3 py-1 border rounded"
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Last
        </button>
      </div>
    </div>
  );
};

const FilterSection = ({ 
  filters, 
  onFilterChange, 
  onReset 
}: { 
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: any) => void;
  onReset: () => void;
}) => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: [],
    sources: [],
    researchFields: [],
    ranks: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [statusRes, sourcesRes, researchFieldsRes, ranksRes] = await Promise.all([
          axios.get(`${DATA_API_URL}/api/v1/admin/conferences/filter-options/status`),
          axios.get(`${DATA_API_URL}/api/v1/admin/conferences/filter-options/sources`),
          axios.get(`${DATA_API_URL}/api/v1/admin/conferences/filter-options/research-fields`),
          axios.get(`${DATA_API_URL}/api/v1/admin/conferences/filter-options/ranks`)
        ]);

        setFilterOptions({
          status: statusRes.data,
          sources: sourcesRes.data,
          researchFields: researchFieldsRes.data,
          ranks: ranksRes.data
        });
      } catch (error) {
        console.error('Error fetching filter options:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  const handleSourceChange = async (source: string) => {
    // If source is selected, fetch its specific ranks
    try {
      const response = await axios.get(
        `${DATA_API_URL}/api/v1/admin/conferences/filter-options/ranks/${source}`
      );
      const sourceRanks = response.data;
      
      // Update rank filter with the new source's ranks
      const currentRank = filters.rank ? filters.rank.split(',').filter(Boolean) : [];
      const newRanks = [...new Set([...currentRank, ...sourceRanks])];
      onFilterChange('rank', newRanks.join(','));
    } catch (error) {
      console.error('Error fetching ranks for source:', error);
    }
  };

  if (loading) {
    return (
      <div className="mb-4 p-4 bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        <button
          onClick={onReset}
          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
        >
          Reset Filters
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Search by title or acronym..."
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {filterOptions.status.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sources
          </label>
          <select
            value={filters.source}
            onChange={(e) => {
              onFilterChange('source', e.target.value);
              if (e.target.value) {
                handleSourceChange(e.target.value);
              }
            }}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Sources</option>
            {filterOptions.sources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Research Fields
          </label>
          <select
            value={filters.researchFields}
            onChange={(e) => onFilterChange('researchFields', e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Research Fields</option>
            {filterOptions.researchFields.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rank
          </label>
          <select
            value={filters.rank}
            onChange={(e) => onFilterChange('rank', e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Ranks</option>
            {filterOptions.ranks.map((rank) => (
              <option key={rank} value={rank}>
                {rank}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default function ConferencesPage() {
  const [rowData, setRowData] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConference, setSelectedConference] = useState<Conference | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    lastPage: 0
  });
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    source: '',
    researchFields: '',
    rank: ''
  });

  const columnDefs: ColDef[] = useMemo(() => [
    { 
      field: 'title', 
      headerName: 'Title',
      flex: 2,
      filter: 'agTextColumnFilter',
      minWidth: 200,
    },
    { 
      field: 'acronym', 
      headerName: 'Acronym',
      flex: 1,
      filter: 'agTextColumnFilter',
      minWidth: 120,
    },
    { 
      field: 'sources', 
      headerName: 'Sources',
      flex: 1,
      minWidth: 150,
      cellRenderer: (params: ICellRendererParams) => (
        <div className="flex flex-wrap gap-1">
          {params.value?.map((source: string) => (
            <TagRenderer 
              key={source} 
              value={source} 
              color="bg-blue-100 text-blue-800" 
            />
          ))}
        </div>
      ),
    },
    { 
      field: 'researchFields', 
      headerName: 'Research Fields',
      flex: 1,
      minWidth: 150,
      cellRenderer: (params: ICellRendererParams) => (
        <div className="flex flex-wrap gap-1">
          {params.value?.map((field: string) => (
            <TagRenderer 
              key={field} 
              value={field} 
              color="bg-green-100 text-green-800" 
            />
          ))}
        </div>
      ),
    },
    { 
      field: 'ranks', 
      headerName: 'Ranks',
      flex: 1,
      minWidth: 120,
      cellRenderer: (params: ICellRendererParams) => (
        <div className="flex flex-wrap gap-1">
          {params.value?.map((rank: string) => (
            <TagRenderer 
              key={rank} 
              value={rank} 
              color="bg-purple-100 text-purple-800" 
            />
          ))}
        </div>
      ),
    },
    { 
      field: 'status', 
      headerName: 'Status',
      flex: 1,
      minWidth: 120,
      cellRenderer: (params: ICellRendererParams) => (
        <TagRenderer 
          value={params.value} 
          color={params.value === 'PUBLISHED' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
          } 
        />
      ),
    },
    {
      headerName: 'Actions',
      flex: 1,
      minWidth: 120,
      cellRenderer: (params: ICellRendererParams) => (
        <button 
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={() => {
            setSelectedConference(params.data);
            setIsModalVisible(true);
          }}
        >
          View History
        </button>
      ),
    },
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
  }), []);

  const fetchConferences = useCallback(async () => {
    try {
      setLoading(true);
      
      // Create params object with only non-empty values
      const params: Record<string, any> = {
        page: pagination.page,
        perPage: pagination.pageSize,
      };

      // Only add filters if they have values
      if (filters.search) {
        params.search = filters.search;
      }
      if (filters.status) {
        params.status = filters.status;
      }
      if (filters.source) {
        params.source = filters.source;
      }
      if (filters.researchFields) {
        params.researchFields = filters.researchFields;
      }
      if (filters.rank) {
        params.rank = filters.rank;
      }

      const response = await axios.get<PaginationResponse>(
        `${DATA_API_URL}/api/v1/admin/conferences/get`, {
          params
        }
      );
      setRowData(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.meta.total,
        lastPage: response.data.meta.lastPage
      }));
    } catch (error) {
      console.error('Error fetching conferences:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, filters]);

  useEffect(() => {
    fetchConferences();
  }, [fetchConferences]);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPagination(prev => ({
      ...prev,
      page: 1,
      pageSize: newPageSize
    }));
  }, []);

  const handleFilterChange = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({
      ...prev,
      page: 1 // Reset to first page when filter changes
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: '',
      source: '',
      researchFields: '',
      rank: ''
    });
    setPagination(prev => ({
      ...prev,
      page: 1
    }));
  }, []);

  const renderOrganizationHistory = useCallback((organization: Organization) => (
    <div key={organization.id} className="mb-4 p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Year {organization.year}</h3>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <span className="font-medium">Access Type:</span> {organization.accessType}
        </div>
        <div>
          <span className="font-medium">Publisher:</span> {organization.publisher}
        </div>
        <div>
          <span className="font-medium">Summary:</span> {organization.summerize}
        </div>
        <div>
          <span className="font-medium">Call for Papers:</span> {organization.callForPaper}
        </div>
        <div>
          <span className="font-medium">Links:</span>
          <div className="flex flex-col gap-1 mt-1">
            {organization.link && (
              <a href={organization.link} target="_blank" rel="noopener noreferrer" 
                 className="text-blue-500 hover:underline">Main Link</a>
            )}
            {organization.cfpLink && (
              <a href={organization.cfpLink} target="_blank" rel="noopener noreferrer"
                 className="text-blue-500 hover:underline">CFP Link</a>
            )}
            {organization.impLink && (
              <a href={organization.impLink} target="_blank" rel="noopener noreferrer"
                 className="text-blue-500 hover:underline">Important Link</a>
            )}
          </div>
        </div>
        <div>
          <span className="font-medium">Locations:</span>
          {organization.locations.map((location, index) => (
            <div key={index} className="mt-1">
              {location.address}, {location.cityStateProvince}, {location.country}, {location.continent}
            </div>
          ))}
        </div>
        <div>
          <span className="font-medium">Topics:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {organization.topics.map((topic, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 rounded text-sm">
                {topic}
              </span>
            ))}
          </div>
        </div>
        <div>
          <span className="font-medium">Dates:</span>
          {organization.dates.map((date, index) => (
            <div key={index} className="mt-1">
              <strong>{date.type}:</strong> {String(parser.fromString(date.startDate))} - {String(parser.fromString(date.endDate))}
            </div>
          ))}
        </div>
      </div>
    </div>
  ), []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Conferences Management</h1>
      
      <FilterSection
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      <div className="w-full h-[600px]">
        <AgGridReact
          className='ag-theme-alpine'
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          loading={loading}
          rowModelType="clientSide"
          getRowId={(params) => params.data.id}
          rowSelection="single"
          animateRows={true}
          suppressPaginationPanel={true}
        />
      </div>

      <PaginationControls
        currentPage={pagination.page}
        totalPages={pagination.lastPage}
        onPageChange={handlePageChange}
        pageSize={pagination.pageSize}
        onPageSizeChange={handlePageSizeChange}
      />

      {isModalVisible && selectedConference && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-4">
              <h2 className="text-xl font-bold">Conference History - {selectedConference.title}</h2>
              <button 
                onClick={() => setIsModalVisible(false)}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                ✕
              </button>
            </div>
            {selectedConference.organizationHistory.map(renderOrganizationHistory)}
          </div>
        </div>
      )}
    </div>
  );
}
