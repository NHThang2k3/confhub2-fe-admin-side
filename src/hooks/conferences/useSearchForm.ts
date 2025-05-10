// src/hooks/conferences/useSearchForm.ts
import { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import continentList from '../../models/data/locations-list.json';

// --- Type Definitions ---
type SearchFieldType = 'keyword' | 'title' | 'acronym';
type ConferenceType = 'Online' | 'Offline' | 'Hybrid';
const AVAILABLE_TYPES: ReadonlyArray<ConferenceType> = ['Online', 'Offline', 'Hybrid'];

// Add types for advanced options if needed for validation (optional)
// Example:
// type RankType = 'A*' | 'A' | 'B' | 'AustralasianB' | 'C' | 'AustralasianC' | 'Other';
// const VALID_RANKS: ReadonlyArray<RankType> = ['A*', 'A', 'B', 'AustralasianB', 'C', 'AustralasianC', 'Other'];

interface SearchParams {
  keyword?: string;
  title?: string;
  acronym?: string;
  fromDate?: Date | null;
  toDate?: Date | null;
  location?: string | null;
  type?: ConferenceType | null;
  // submissionDate?: Date | null; // Keep Date | null
  submissionStartDate?: Date | null; // NEW
  submissionEndDate?: Date | null;   // NEW
  publisher?: string | null;
  rank?: string | null; // Keep string | null unless validating strictly
  source?: string | null;
  averageScore?: string | null;
  topics?: string[]; // Keep string[]
  fieldOfResearch?: string[]; // Keep string[]
}

interface UseSearchFormProps {
  onSearch: (searchParams: SearchParams) => void;
  onClear?: () => void;
}

// --- Helper Functions for Initialization ---

// Generic helper for single string parameters
const getInitialStringParam = (
    searchParams: URLSearchParams,
    paramName: string
): string | null => {
    return searchParams.get(paramName); // Returns null if not present
};

// Generic helper for array parameters (like topics)
const getInitialArrayParam = (
    searchParams: URLSearchParams,
    paramName: string
): string[] => {
    return searchParams.getAll(paramName) || []; // Returns empty array if not present
}

const getInitialLocationFromUrl = (
  searchParams: URLSearchParams,
  availableLocations: string[]
): string | null => {
  const countryParam = searchParams.get('country');
  if (!countryParam) return null;
  return availableLocations.find(
    (loc) => loc.toLowerCase() === countryParam.toLowerCase()
  ) || null;
};

const getInitialTypeFromUrl = (
  searchParams: URLSearchParams,
  availableTypes: ReadonlyArray<ConferenceType>
): ConferenceType | null => {
    const typeParam = searchParams.get('type');
    if (!typeParam) return null;
    const foundType = availableTypes.find(
        (t) => t.toLowerCase() === typeParam.toLowerCase()
    );
    return foundType ? (foundType as ConferenceType) : null;
};

const getInitialSearchConfig = (
    searchParams: URLSearchParams
): { type: SearchFieldType; value: string } => {
    const title = searchParams.get('title');
    if (title !== null) return { type: 'title', value: title };
    const acronym = searchParams.get('acronym');
    if (acronym !== null) return { type: 'acronym', value: acronym };
    const keyword = searchParams.get('keyword');
    if (keyword !== null) return { type: 'keyword', value: keyword };
    return { type: 'keyword', value: '' };
};

const getInitialDateFromUrl = (
    searchParams: URLSearchParams,
    paramName: string
): Date | null => {
    const dateString = searchParams.get(paramName);
    if (dateString && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        try {
            const timestamp = Date.parse(dateString);
            if (!isNaN(timestamp)) return new Date(timestamp);
        } catch (e) {
             console.error(`Error parsing date parameter "${paramName}":`, e);
        }
    }
    return null;
};

// Helper to check if any advanced params exist to auto-show the section
const shouldShowAdvancedOptionsInitially = (searchParams: URLSearchParams): boolean => {
    const advancedParams = ['submissionDate', 'publisher', 'rank', 'source', 'averageScore', 'topics', 'fieldOfResearch', 'subStartDate', 'subEndDate'];
    return advancedParams.some(param => searchParams.has(param));
};


// --- Custom Hook ---
const useSearchForm = ({ onSearch, onClear }: UseSearchFormProps) => {
  // --- State Initialization ---
  const searchParams = new URLSearchParams(useSearchParams().toString());

  const countriesFromContinentList: string[] = continentList.flatMap(
    (continent) => continent.countries
  );
  const [availableLocations] = useState<string[]>(countriesFromContinentList);

  // Initialize Basic Fields
  const initialSearchConfig = getInitialSearchConfig(searchParams);
  const initialLocation = getInitialLocationFromUrl(searchParams, availableLocations);
  const initialType = getInitialTypeFromUrl(searchParams, AVAILABLE_TYPES);
  const initialFromDate = getInitialDateFromUrl(searchParams, 'fromDate');
  const initialToDate = getInitialDateFromUrl(searchParams, 'toDate');

  // Initialize Advanced Fields
  // const initialSubmissionDate = getInitialDateFromUrl(searchParams, 'submissionDate');
  const initialPublisher = getInitialStringParam(searchParams, 'publisher');
  const initialRank = getInitialStringParam(searchParams, 'rank'); // Add validation if needed
  const initialSource = getInitialStringParam(searchParams, 'source'); // Add validation if needed
  const initialAverageScore = getInitialStringParam(searchParams, 'averageScore'); // Add validation if needed
  const initialTopics = getInitialArrayParam(searchParams, 'topics');
  const initialFieldsOfResearch = getInitialArrayParam(searchParams, 'fieldOfResearch');
  const initialShowAdvanced = shouldShowAdvancedOptionsInitially(searchParams);
  const initialSubmissionStartDate =  getInitialDateFromUrl(searchParams, 'subStartDate');
  const initialSubmissionEndDate =  getInitialDateFromUrl(searchParams, 'subEndDate');

  // --- State Variables ---
  // Basic
  const [selectSearchType, setSelectSearchType] = useState<SearchFieldType>(initialSearchConfig.type);
  const [confKeyword, setConfKeyword] = useState<string>(initialSearchConfig.value);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(initialLocation);
  const [selectedType, setSelectedType] = useState<ConferenceType | null>(initialType);
  const [fromDate, setStartDate] = useState<Date | null>(initialFromDate);
  const [toDate, setEndDate] = useState<Date | null>(initialToDate);
  const [isSearchTypeDropdownOpen, setIsSearchTypeDropdownOpen] = useState(false);
  const searchTypeDropdownRef = useRef<HTMLDivElement>(null);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [typeSearchQuery, setTypeSearchQuery] = useState('');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);

  // Advanced
  const [isAdvancedOptionsVisible, setIsAdvancedOptionsVisible] = useState<boolean>(initialShowAdvanced);
  // const [submissionDate, setSubmissionDate] = useState<Date | null>(initialSubmissionDate);
  const [submissionStartDate, setSubmissionStartDate] = useState<Date | null>(initialSubmissionStartDate); // NEW
  const [submissionEndDate, setSubmissionEndDate] = useState<Date | null>(initialSubmissionEndDate);     // NEW
  const [selectedPublisher, setSelectedPublisher] = useState<string | null>(initialPublisher);
  const [selectedRank, setSelectedRank] = useState<string | null>(initialRank);
  const [selectedSource, setSelectedSource] = useState<string | null>(initialSource);
  const [selectedAverageScore, setSelectedAverageScore] = useState<string | null>(initialAverageScore);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(initialTopics);
  const [selectedFieldsOfResearch, setSelectedFieldsOfResearch] = useState<string[]>(initialFieldsOfResearch);

  // --- Effects --- (Keep the existing useEffect for closing dropdowns)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
       if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
            setIsLocationDropdownOpen(false);
        }
        if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
            setIsTypeDropdownOpen(false);
        }
        if (searchTypeDropdownRef.current && !searchTypeDropdownRef.current.contains(event.target as Node)) {
            setIsSearchTypeDropdownOpen(false);
        }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // No dependency change needed here

  // --- Handlers ---

  // Basic Handlers (keyword, search type, location, type, dates) - No change needed
  const handleKeywordChange = (event: ChangeEvent<HTMLInputElement>) => { setConfKeyword(event.target.value); };
  const handleSearchTypeChange = (type: SearchFieldType) => { setSelectSearchType(type); setIsSearchTypeDropdownOpen(false); };
  const toggleSearchTypeDropdown = () => { setIsSearchTypeDropdownOpen(!isSearchTypeDropdownOpen); };
  const handleLocationClick = (location: string) => { setSelectedLocation(location === '' ? null : location); setIsLocationDropdownOpen(false); setLocationSearchQuery(''); };
  const handleTypeClick = (type: string) => { const newType = type === "" ? null : type as ConferenceType | null; setSelectedType(newType); setIsTypeDropdownOpen(false); setTypeSearchQuery(''); };
  const handleLocationSearchChange = (event: ChangeEvent<HTMLInputElement>) => { setLocationSearchQuery(event.target.value); setIsLocationDropdownOpen(true); };
  const handleTypeSearchChange = (event: ChangeEvent<HTMLInputElement>) => { setTypeSearchQuery(event.target.value); setIsTypeDropdownOpen(true); };
  const handleStartDateInputChange = (event: ChangeEvent<HTMLInputElement>) => { const dateValue = event.target.value; setStartDate(dateValue ? new Date(dateValue) : null); };
  const handleEndDateInputChange = (event: ChangeEvent<HTMLInputElement>) => { const dateValue = event.target.value; setEndDate(dateValue ? new Date(dateValue) : null); };
  const toggleLocationDropdown = () => { setIsLocationDropdownOpen(!isLocationDropdownOpen); };
  const toggleTypeDropdown = () => { setIsTypeDropdownOpen(!isTypeDropdownOpen); };

  // Advanced Handlers (Pass state setters directly)
  const toggleAdvancedOptionsVisibility = () => { setIsAdvancedOptionsVisible(!isAdvancedOptionsVisible); };
  // const handleSubmissionDateChange = (date: Date | null) => { setSubmissionDate(date); };
  // NEW Handler for Date Range Picker
  const handleSubmissionDateRangeChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setSubmissionStartDate(start);
    setSubmissionEndDate(end);
};
  const handlePublisherChange = (publisher: string | null) => { setSelectedPublisher(publisher); };
  const handleRankChange = (rank: string | null) => { setSelectedRank(rank); };
  const handleSourceChange = (source: string | null) => { setSelectedSource(source); };
  const handleAverageScoreChange = (averageScore: string | null) => { setSelectedAverageScore(averageScore); };
  const handleTopicsChange = (topics: string[]) => { setSelectedTopics(topics); };
  const handleFieldsOfResearchChange = (fields: string[]) => { setSelectedFieldsOfResearch(fields); };

  // Combined Search/Clear
  const handleSearchClick = () => {
    // Consolidate all current state into search params
    const searchParamsData: SearchParams = {
      fromDate,
      toDate,
      location: selectedLocation,
      type: selectedType,
      // submissionDate,
      submissionStartDate, // NEW
      submissionEndDate,   // NEW
      publisher: selectedPublisher,
      rank: selectedRank,
      source: selectedSource,
      averageScore: selectedAverageScore,
      topics: selectedTopics && selectedTopics.length > 0 ? selectedTopics : undefined, // Only include if non-empty
      fieldOfResearch: selectedFieldsOfResearch && selectedFieldsOfResearch.length > 0 ? selectedFieldsOfResearch : undefined, // Only include if non-empty
    };

    // Add correct search field based on selected type
    if (confKeyword) {
        searchParamsData[selectSearchType] = confKeyword;
    }

    onSearch(searchParamsData);
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearchClick();
    }
  };

  const handleClear = () => {
    // Reset Basic state
    setSelectSearchType('keyword');
    setConfKeyword('');
    setSelectedLocation(null);
    setSelectedType(null);
    setStartDate(null);
    setEndDate(null);
    setLocationSearchQuery('');
    setTypeSearchQuery('');

    // Reset Advanced state
    // setSubmissionDate(null);
    setSubmissionStartDate(null); // NEW
    setSubmissionEndDate(null);   // NEW
    setSelectedPublisher(null);
    setSelectedRank(null);
    setSelectedSource(null);
    setSelectedAverageScore(null);
    setSelectedTopics([]);
    setSelectedFieldsOfResearch([]);
    // Optionally reset advanced visibility, or leave it as is
    // setIsAdvancedOptionsVisible(false);

    // Call the parent's onClear AFTER resetting local state
    if (onClear) {
      onClear();
    }
  };

  // Filtering Logic (no changes needed)
  const filteredLocations = availableLocations.filter((location) =>
    location.toLowerCase().includes(locationSearchQuery.toLowerCase())
  );
  const filteredTypes = AVAILABLE_TYPES.filter((type) =>
    type.toLowerCase().includes(typeSearchQuery.toLowerCase())
  );

  // --- Return Values ---
  return {
    // Basic Search State & Handlers
    confKeyword,
    selectSearchType,
    selectedLocation,
    selectedType,
    fromDate,
    toDate,
    isSearchTypeDropdownOpen,
    searchTypeDropdownRef,
    locationSearchQuery,
    typeSearchQuery,
    isLocationDropdownOpen,
    isTypeDropdownOpen,
    locationDropdownRef,
    typeDropdownRef,
    availableLocations,
    availableTypes: AVAILABLE_TYPES,
    filteredLocations,
    filteredTypes,
    handleKeywordChange,
    handleSearchTypeChange,
    toggleSearchTypeDropdown,
    handleLocationClick,
    handleTypeClick,
    handleLocationSearchChange,
    handleTypeSearchChange,
    handleStartDateInputChange,
    handleEndDateInputChange,
    toggleLocationDropdown,
    toggleTypeDropdown,
    handleKeyPress,

    // Advanced Search State & Handlers
    isAdvancedOptionsVisible, // Initialized based on URL
    // submissionDate,         // Initialized from URL
    submissionStartDate, // NEW
    submissionEndDate,   // NEW
    selectedPublisher,      // Initialized from URL
    selectedRank,           // Initialized from URL
    selectedSource,         // Initialized from URL
    selectedAverageScore,   // Initialized from URL
    selectedTopics,         // Initialized from URL
    selectedFieldsOfResearch, // Initialized from URL
    toggleAdvancedOptionsVisibility,
    // handleSubmissionDateChange,
    handleSubmissionDateRangeChange, // NEW
    handlePublisherChange,
    handleRankChange,
    handleSourceChange,
    handleAverageScoreChange,
    handleTopicsChange,
    handleFieldsOfResearchChange,

    // General Actions
    handleSearchClick,
    handleClear,
  };
};

export default useSearchForm;