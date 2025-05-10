// hooks/useActiveSection.ts
import { useEffect, useState } from 'react';

interface UseActiveSectionProps {
  navRef: React.RefObject<HTMLElement>;
  updatedSections: string[];
}
const useActiveSection = ({ navRef, updatedSections }: UseActiveSectionProps) => {
    const [activeSection, setActiveSection] = useState<string>('');

    useEffect(() => {
        const handleScroll = () => {
            if (!navRef.current) return;

            let currentSection = '';
            for (const sectionId of updatedSections) {
                const section = document.getElementById(sectionId);
                if (section) {
                    const navElement = navRef.current;
                    const navHeight = navElement ? navElement.offsetHeight : 0;
                    const rect = section.getBoundingClientRect();
                    if (rect.top <= navHeight + 10) {
                        currentSection = sectionId;
                    }
                }
            }
            setActiveSection(currentSection);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [navRef, updatedSections]); //navRef is stable,  updatedSections is a dependency

    return { activeSection, setActiveSection }; // Return both the value and the setter
};

export default useActiveSection;