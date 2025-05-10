// hooks/useTopicsDisplay.ts
import { useState } from 'react';

const useTopicsDisplay = (topics: string[] | undefined) => {
    const [showAllTopics, setShowAllTopics] = useState(false);
    const displayedTopics = showAllTopics ? topics || [] : (topics || []).slice(0, 10);
    const hasMoreTopics = (topics || []).length > 10;

    return { displayedTopics, hasMoreTopics, showAllTopics, setShowAllTopics };
};

export default useTopicsDisplay;