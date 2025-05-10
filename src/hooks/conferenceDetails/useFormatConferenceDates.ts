// hooks/useFormatConferenceDates.ts

const useFormatConferenceDates = (dates: { type: string; fromDate?: string; toDate?: string; }[] | undefined, language:string | 'en') => {
    const conferenceDate = dates?.find(date => date.type === 'conferenceDates');
    const fromDateStr = conferenceDate?.fromDate ?? '';
    const toDateStr = conferenceDate?.toDate ?? '';
  
    const fromDateFormatted = fromDateStr ? new Date(fromDateStr).toLocaleDateString(language, { day: '2-digit', month: 'long' }).replace(/ /g, ' ') : 'TBD';
    const toDateFormatted = toDateStr ? new Date(toDateStr).toLocaleDateString(language, { day: '2-digit', month: 'long', year: 'numeric' }).replace(/ /g, ' ') : 'TBD';
    const dateDisplay = fromDateFormatted === 'TBD' || toDateFormatted === 'TBD' ? 'TBD' : `${fromDateFormatted} - ${toDateFormatted}`;
  
    return { dateDisplay };
  };
  export default useFormatConferenceDates;