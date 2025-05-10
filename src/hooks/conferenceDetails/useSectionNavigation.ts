// hooks/useSectionNavigation.ts
import { useEffect } from 'react';

interface UseSectionNavigationProps {
  navRef: React.RefObject<HTMLElement>;
  setActiveSection: (section: string) => void;
}

const useSectionNavigation = ({ navRef, setActiveSection }: UseSectionNavigationProps) => {
  useEffect(() => {
    const handleAnchorClick = (event: Event) => {
      event.preventDefault();
      const target = event.target as HTMLAnchorElement;
      const targetId = target.getAttribute('href')?.substring(1);

      if (targetId) {
        setActiveSection(targetId);
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
          const targetHeading = targetSection.querySelector('h2');

          if (targetHeading) {
            const navElement = navRef.current;
            const navHeight = navElement ? navElement.offsetHeight : 0;
            const offset = 10;
            const targetPosition = targetHeading.offsetTop - navHeight - offset;

            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth',
            });
          }
        }
      }
    };

    const navLinks = navRef.current?.querySelectorAll('a') || [];
    navLinks.forEach(link => {
      link.addEventListener('click', handleAnchorClick);
    });

    return () => {
      navLinks.forEach(link => {
        link.removeEventListener('click', handleAnchorClick);
      });
    };
  }, [navRef, setActiveSection]); //navRef and setActiveSection is stable, no need updatedSections
};

export default useSectionNavigation;