// useEventFiltering.ts
import { useState, useEffect } from 'react';
import { CalendarEvent } from '../../../app/[locale]/dashboard/note/Calendar'; // Adjust path

const useEventFiltering = (initialDate: Date) => {
  const [searchText, setSearchText] = useState('');
  const [currentDate, setCurrentDate] = useState(initialDate);

    useEffect(() => {
      // This effect ONLY handles jumping to the closest date.
      // It NO LONGER handles filtering.
    if (searchText.length > 0) {
        // The filtering logic now happens OUTSIDE this hook.
        // This effect needs to run AFTER filtering, so we use a timeout.
        // This is a workaround, and a better solution might involve
        // coordinating the search and date jumping more tightly.
        setTimeout(() => { // Use a timeout
          const events = JSON.parse(localStorage.getItem('calendarEvents') || '[]')  as CalendarEvent[];
          const lowerCaseSearchText = searchText.toLowerCase();
          const filtered: CalendarEvent[] = events.filter(event =>
            (event.conference && event.conference.toLowerCase().includes(lowerCaseSearchText)) ||
            (event.type && event.type.toLowerCase().includes(lowerCaseSearchText)) ||
            (event.title && event.title.toLowerCase().includes(lowerCaseSearchText)) // Include title
            );

            if (filtered.length > 0)
            {
                let closestEvent = filtered[0];
                let closestDiff = Math.abs(new Date(closestEvent.year, closestEvent.month - 1, closestEvent.day).getTime() - currentDate.getTime());

                for (let i = 1; i < filtered.length; i++) {
                    const eventDate = new Date(filtered[i].year, filtered[i].month - 1, filtered[i].day);
                    const diff = Math.abs(eventDate.getTime() - currentDate.getTime());
                    if (diff < closestDiff) {
                        closestDiff = diff;
                        closestEvent = filtered[i];
                    }
                }

                const eventDate = new Date(closestEvent.year, closestEvent.month - 1, closestEvent.day);
                setCurrentDate(eventDate);
            }
        }, 0);

    }
  }, [searchText, currentDate]); // Keep currentDate here

  return { searchText, setSearchText, currentDate, setCurrentDate };
};

export default useEventFiltering;