
// components/Header/hooks/useClickOutsideHeader.ts (Simplified exclusion check)
import { useEffect, RefObject } from 'react';
import { debounce } from './debounce';

export const useClickOutside = (
  ref: RefObject<HTMLElement>,
  callback: () => void,
  excludeClassName: string
) => {
  useEffect(() => {
    const handleClickOutside = debounce((event: MouseEvent) => {
      const target = event.target as Node;

      // Simplified exclusion check
      if (ref.current && !ref.current.contains(target) &&
          !(target instanceof Element && target.closest(`.${excludeClassName}`))) {
        callback();
      }
    }, 200);

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback, excludeClassName]);
};
