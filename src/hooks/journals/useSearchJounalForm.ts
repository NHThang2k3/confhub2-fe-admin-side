// src/hooks/useSearchJournalForm.ts
import { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from 'react';

interface SearchJournalParams {
    keyword?: string;
    country?: string | null;
    publicationType?: string | null;
    subjectAreas?: string[];
    quartile?: string | null;
    openAccessTypes?: string[];
    publisher?: string | null;
    language?: string | null;
    impactFactor?: string | null;
    hIndex?: string | null;
    citeScore?: string | null;
    sjr?: string | null;
    overallRank?: string | null;
    issn?: string | null;
}

interface UseSearchJournalFormProps {
    onSearch: (searchParams: SearchJournalParams) => void;
    onClear?: () => void; // Add onClear prop
}

const useSearchJournalForm = ({ onSearch, onClear }: UseSearchJournalFormProps) => {
    const [journalKeyword, setJournalKeyword] = useState<string>('');
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  const [selectedPublicationType, setSelectedPublicationType] = useState<string | null>(null);
  const [isPublicationTypeDropdownOpen, setIsPublicationTypeDropdownOpen] = useState(false);
  const publicationTypeDropdownRef = useRef<HTMLDivElement>(null);

  // State cho tìm kiếm nâng cao
  const [isAdvancedOptionsVisible, setIsAdvancedOptionsVisible] = useState(false);
  const [selectedSubjectAreas, setSelectedSubjectAreas] = useState<string[]>([]);
  const [selectedQuartile, setSelectedQuartile] = useState<string | null>(null);
  const [selectedOpenAccessTypes, setSelectedOpenAccessTypes] = useState<string[]>([]);
  const [selectedPublisher, setSelectedPublisher] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedImpactFactor, setSelectedImpactFactor] = useState<string | null>(null);
  const [selectedHIndex, setSelectedHIndex] = useState<string | null>(null);
  const [selectedCiteScore, setSelectedCiteScore] = useState<string | null>(null);
  const [selectedSJR, setSelectedSJR] = useState<string | null>(null);
  const [selectedOverallRank, setSelectedOverallRank] = useState<string | null>(null);
  const [selectedISSN, setSelectedISSN] = useState<string | null>(null);

  const availableCountries = ['United States', 'United Kingdom', 'Germany', 'Vietnam', 'Japan', 'China', 'France', 'Canada', 'Australia']; // Ví dụ danh sách quốc gia
  const availablePublicationTypes = ['journal', 'Conference Proceedings', 'Book Series']; // Use lowercase 'journal' to match JournalResponse "Type"

  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setJournalKeyword(event.target.value);
  };

  const filteredCountries = availableCountries.filter(country =>
    country.toLowerCase().includes(countrySearchQuery.toLowerCase())
  );

 
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearchClick();
    }
  };

  const handleCountryClick = (country: string) => {
    setSelectedCountry(country === "" ? null : country);
    setIsCountryDropdownOpen(false);
    setCountrySearchQuery("");
  };

  const handlePublicationTypeClick = (type: string) => {
    setSelectedPublicationType(type === "" ? null : type);
    setIsPublicationTypeDropdownOpen(false);
  };

  const handleCountrySearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCountrySearchQuery(event.target.value);
  };

  const toggleCountryDropdown = () => {
    setIsCountryDropdownOpen(!isCountryDropdownOpen);
  };

  const togglePublicationTypeDropdown = () => {
    setIsPublicationTypeDropdownOpen(!isPublicationTypeDropdownOpen);
  };

  const handleSearchClick = () => {
    onSearch({
      keyword: journalKeyword,
      country: selectedCountry,
      publicationType: selectedPublicationType,
      subjectAreas: selectedSubjectAreas,
      quartile: selectedQuartile,
      openAccessTypes: selectedOpenAccessTypes,
      publisher: selectedPublisher,
      language: selectedLanguage,
      impactFactor: selectedImpactFactor,
      hIndex: selectedHIndex,
      citeScore: selectedCiteScore,
      sjr: selectedSJR,
      overallRank: selectedOverallRank,
      issn: selectedISSN,
    });
  };

  const toggleAdvancedOptionsVisibility = () => {
    setIsAdvancedOptionsVisible(!isAdvancedOptionsVisible);
  };

  const handleSubjectAreasChange = (subjects: string[]) => {
    setSelectedSubjectAreas(subjects);
  };

  const handleQuartileChange = (quartile: string | null) => {
    setSelectedQuartile(quartile);
  };

  const handleOpenAccessTypesChange = (oaTypes: string[]) => {
    setSelectedOpenAccessTypes(oaTypes);
  };

  const handlePublisherChange = (publisher: string | null) => {
    setSelectedPublisher(publisher);
  };

  const handleLanguageChange = (language: string | null) => {
    setSelectedLanguage(language);
  };

  const handleImpactFactorChange = (impactFactor: string | null) => {
    setSelectedImpactFactor(impactFactor);
  };

  const handleHIndexChange = (hIndex: string | null) => {
    setSelectedHIndex(hIndex);
  };

  const handleCiteScoreChange = (citeScore: string | null) => {
    setSelectedCiteScore(citeScore);
  };

  const handleSJRChange = (sjr: string | null) => {
    setSelectedSJR(sjr);
  };

  const handleOverallRankChange = (overallRank: string | null) => {
    setSelectedOverallRank(overallRank);
  };

  const handleISSNChange = (issn: string | null) => {
    setSelectedISSN(issn);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
      if (publicationTypeDropdownRef.current && !publicationTypeDropdownRef.current.contains(event.target as Node)) {
        setIsPublicationTypeDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [countryDropdownRef, publicationTypeDropdownRef]);

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
    setJournalKeyword('');
    setCountrySearchQuery('');
    setSelectedPublicationType(null);
    setSelectedSubjectAreas([]);
    setSelectedQuartile(null);
    setSelectedISSN('');
    setSelectedOpenAccessTypes([]);
    setSelectedPublisher('');
    setSelectedLanguage(null);
    setSelectedImpactFactor('');
    setSelectedHIndex('');
    setSelectedCiteScore('');
    setSelectedSJR('');
    setSelectedOverallRank('');
  };


return {
    journalKeyword,
    selectedCountry,
    countryDropdownRef,
    filteredCountries,
    isCountryDropdownOpen,
    selectedPublicationType,
    publicationTypeDropdownRef,
    isPublicationTypeDropdownOpen,
    availablePublicationTypes,
    isAdvancedOptionsVisible,
    selectedSubjectAreas,
    selectedQuartile,
    selectedISSN,
    selectedOpenAccessTypes,
    selectedPublisher,
    selectedLanguage,
    selectedImpactFactor,
    selectedHIndex,
    selectedCiteScore,
    selectedSJR,
    selectedOverallRank,
    handleKeywordChange,
    handleCountryClick,
    handleCountrySearchChange,
    toggleCountryDropdown,
    handlePublicationTypeClick,
    togglePublicationTypeDropdown,
    handleSubjectAreasChange,
    handleQuartileChange,
    handleISSNChange,
    handleOpenAccessTypesChange,
    handlePublisherChange,
    handleLanguageChange,
    handleImpactFactorChange,
    handleHIndexChange,
    handleCiteScoreChange,
    handleSJRChange,
    handleOverallRankChange,
    handleSearchClick,
    handleKeyPress,
    toggleAdvancedOptionsVisibility,
    handleClear, // Return handleClear
  };
};

export default useSearchJournalForm;