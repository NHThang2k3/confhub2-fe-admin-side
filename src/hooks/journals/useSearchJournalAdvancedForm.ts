// src/hooks/useSearchJournalAdvanceForm.ts

import { useState, ChangeEvent, KeyboardEvent, useEffect } from 'react'; // Add useEffect

interface UseSearchJournalAdvanceFormProps {
    isAdvancedOptionsVisible: boolean;
    toggleAdvancedOptionsVisibility: () => void;
    onSubjectAreasChange: (subjects: string[]) => void;
    selectedSubjectAreas: string[];
    onQuartileChange: (quartile: string | null) => void;
    selectedQuartile: string | null;
    onOpenAccessTypesChange: (oaTypes: string[]) => void;
    selectedOpenAccessTypes: string[];
    onPublisherChange: (publisher: string | null) => void;
    selectedPublisher: string | null;
    onLanguageChange: (language: string | null) => void;
    selectedLanguage: string | null;
    onImpactFactorChange: (impactFactor: string | null) => void; // Using string for now, can be number or range later
    selectedImpactFactor: string | null;
    onHIndexChange: (hIndex: string | null) => void; // Using string for now
    selectedHIndex: string | null;
    onCiteScoreChange: (citeScore: string | null) => void; // Using string for now
    selectedCiteScore: string | null;
    onSJRChange: (sjr: string | null) => void; // Using string for now
    selectedSJR: string | null;
    onOverallRankChange: (overallRank: string | null) => void; // Using string for now
    selectedOverallRank: string | null;
    onISSNChange: (issn: string | null) => void;
    selectedISSN: string | null;
}

const useSearchJournalAdvanceForm = ({
    isAdvancedOptionsVisible,
    toggleAdvancedOptionsVisibility,
    onSubjectAreasChange,
    selectedSubjectAreas,
    onQuartileChange,
    selectedQuartile,
    onISSNChange,
    selectedISSN,
    onOpenAccessTypesChange,
    selectedOpenAccessTypes,
    onPublisherChange,
    selectedPublisher,
    onLanguageChange,
    selectedLanguage,
    onImpactFactorChange,
    selectedImpactFactor,
    onHIndexChange,
    selectedHIndex,
    onCiteScoreChange,
    selectedCiteScore,
    onSJRChange,
    selectedSJR,
    onOverallRankChange,
    selectedOverallRank
  }: UseSearchJournalAdvanceFormProps) => {

    const [subjectAreaInput, setSubjectAreaInput] = useState('');
  const [subjectAreaSuggestions, setSubjectAreaSuggestions] = useState<string[]>([]);
  const [openAccessTypeInput, setOpenAccessTypeInput] = useState('');
  const [openAccessTypeSuggestions, setOpenAccessTypeSuggestions] = useState<string[]>([]);

  // Example lists - replace with your actual lists
  const availableSubjectAreas = [
    "Agricultural and Biological Sciences",
    "Arts and Humanities",
    "Biochemistry, Genetics and Molecular Biology",
    "Business, Management and Accounting",
    "Chemical Engineering",
    "Chemistry",
    "Computer Science",
    "Decision Sciences",
    "Dentistry",
    "Earth and Planetary Sciences",
    "Economics, Econometrics and Finance",
    "Energy",
    "Engineering",
    "Environmental Science",
    "Health Professions",
    "Immunology and Microbiology",
    "Materials Science",
    "Mathematics",
    "Medicine",
    "Multidisciplinary",
    "Neuroscience",
    "Nursing",
    "Pharmacology, Toxicology and Pharmaceutics",
    "Physics and Astronomy",
    "Psychology",
    "Social Sciences",
    "Veterinary",
  ];
  const availableOpenAccessTypes = [
    "Gold Open Access", "Green Open Access", "Hybrid Open Access", "Diamond Open Access", "Closed Access"
  ];
  const availableLanguages = [
    "English", "Vietnamese", "Chinese", "French", "Spanish", "German", "Japanese", "Korean", "Russian", "Arabic"
  ];
  const availableQuartiles = ["Q1", "Q2", "Q3", "Q4", "Q1 or Q2"];


  const handleSubjectAreaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setSubjectAreaInput(inputValue);
    if (inputValue.trim()) {
      const suggestions = availableSubjectAreas.filter(subject =>
        subject.toLowerCase().includes(inputValue.toLowerCase()) && !selectedSubjectAreas.includes(subject)
      );
      setSubjectAreaSuggestions(suggestions);
    } else {
      setSubjectAreaSuggestions([]);
    }
  };

  const handleSubjectAreaSuggestionClick = (suggestion: string) => {
    if (!selectedSubjectAreas.includes(suggestion)) {
      onSubjectAreasChange([...selectedSubjectAreas, suggestion]); // Update parent state
    }
    setSubjectAreaInput('');
    setSubjectAreaSuggestions([]);
  };

  const handleSubjectAreaInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (subjectAreaInput.trim()) {
        const trimmedInput = subjectAreaInput.trim();
        if (!selectedSubjectAreas.includes(trimmedInput) && availableSubjectAreas.includes(trimmedInput)) {
          onSubjectAreasChange([...selectedSubjectAreas, trimmedInput]); // Update parent state
          setSubjectAreaInput('');
          setSubjectAreaSuggestions([]);
        } else if (subjectAreaSuggestions.length > 0) {
          handleSubjectAreaSuggestionClick(subjectAreaSuggestions[0]);
        } else {
          setSubjectAreaInput('');
          setSubjectAreaSuggestions([]);
        }
      }
    }
  };

  const handleRemoveSubjectArea = (subjectToRemove: string) => {
    onSubjectAreasChange(selectedSubjectAreas.filter(subject => subject !== subjectToRemove)); // Update parent state
  };


  const handleOpenAccessTypeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setOpenAccessTypeInput(inputValue);
    if (inputValue.trim()) {
      const suggestions = availableOpenAccessTypes.filter(type =>
        type.toLowerCase().includes(inputValue.toLowerCase()) && !selectedOpenAccessTypes.includes(type)
      );
      setOpenAccessTypeSuggestions(suggestions);
    } else {
      setOpenAccessTypeSuggestions([]);
    }
  };

  const handleOpenAccessTypeSuggestionClick = (suggestion: string) => {
    if (!selectedOpenAccessTypes.includes(suggestion)) {
      onOpenAccessTypesChange([...selectedOpenAccessTypes, suggestion]);
    }
    setOpenAccessTypeInput('');
    setOpenAccessTypeSuggestions([]);
  };

  const handleOpenAccessTypeInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (openAccessTypeInput.trim()) {
        const trimmedInput = openAccessTypeInput.trim();
        if (!selectedOpenAccessTypes.includes(trimmedInput) && availableOpenAccessTypes.includes(trimmedInput)) {
          onOpenAccessTypesChange([...selectedOpenAccessTypes, trimmedInput]);
          setOpenAccessTypeInput('');
          setOpenAccessTypeSuggestions([]);
        } else if (openAccessTypeSuggestions.length > 0) {
          handleOpenAccessTypeSuggestionClick(openAccessTypeSuggestions[0]);
        } else {
          setOpenAccessTypeInput('');
          setOpenAccessTypeSuggestions([]);
        }
      }
    }
  };

  const handleRemoveOpenAccessType = (typeToRemove: string) => {
    onOpenAccessTypesChange(selectedOpenAccessTypes.filter(type => type !== typeToRemove));
  };


  const handleQuartileChangeInput = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onQuartileChange(event.target.value === "" ? null : event.target.value);
  };

  const handlePublisherChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    onPublisherChange(event.target.value === "" ? null : event.target.value);
  };

  const handleLanguageChangeInput = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onLanguageChange(event.target.value === "" ? null : event.target.value);
  };

  const handleImpactFactorChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    onImpactFactorChange(event.target.value === "" ? null : event.target.value);
  };

  const handleHIndexChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    onHIndexChange(event.target.value === "" ? null : event.target.value);
  };

  const handleCiteScoreChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    onCiteScoreChange(event.target.value === "" ? null : event.target.value);
  };

  const handleSJRChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSJRChange(event.target.value === "" ? null : event.target.value);
  };

  const handleOverallRankChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    onOverallRankChange(event.target.value === "" ? null : event.target.value);
  };

  const handleISSNChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    onISSNChange(event.target.value === "" ? null : event.target.value);
  }

  return {
    subjectAreaInput,
    subjectAreaSuggestions,
    openAccessTypeInput,
    openAccessTypeSuggestions,
    availableSubjectAreas,
    availableLanguages,
    availableOpenAccessTypes,
    availableQuartiles,
    handleCiteScoreChangeInput,
    handleHIndexChangeInput,
    handleISSNChangeInput,
    handleImpactFactorChangeInput,
    handleLanguageChangeInput,
    handleOpenAccessTypeInputChange,
    handleOpenAccessTypeInputKeyDown,
    handleOpenAccessTypeSuggestionClick,
    handleOverallRankChangeInput,
    handlePublisherChangeInput,
    handleQuartileChangeInput,
    handleRemoveOpenAccessType,
    handleRemoveSubjectArea,
    handleSJRChangeInput,
    handleSubjectAreaInputChange,
    handleSubjectAreaInputKeyDown,
    handleSubjectAreaSuggestionClick
  };
};

export default useSearchJournalAdvanceForm;

