// hooks/useConferenceData.ts
import { useState, useEffect } from 'react';
import { ConferenceResponse } from '../../models/response/conference.response'; // Adjust path as needed
import { getConferenceFromDB } from '../../app/api/conference/getConferenceDetails'; // Adjust path as needed

const useConferenceDataFromDB = (id: string | null) => {
    const [conferenceDataFromDB, setConferenceData] = useState<ConferenceResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchConferenceData = async () => {
            setLoading(true);
            setError(null);
            try {
                if (id) {
                    const conferenceInfo = await getConferenceFromDB(id);
                    setConferenceData(conferenceInfo);
                }
            } catch (err: any) {
                if (err.status === 404) {
                    setError("Conference not found");
                } else {
                    setError(err.message || 'An error occurred while fetching conference data.');
                    console.error('Error fetching conference data:', err);
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchConferenceData();
        } else {
            setLoading(false);
        }
    }, [id]);

    return { conferenceDataFromDB, error, loading };
};

export default useConferenceDataFromDB;