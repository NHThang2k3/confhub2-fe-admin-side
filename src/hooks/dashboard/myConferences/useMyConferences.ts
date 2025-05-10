// frontend/hooks/useMyConferences.ts
import { useState, useEffect } from 'react';
import { AddedConference } from '../../../models/send/addConference.send'; //  Define this type
import { appConfig } from '@/src/middleware';
import { ConferenceInfo } from '@/src/models/response/conference.list.response';
import { ConferenceResponse } from '@/src/models/response/conference.response';

// Define the shape of the data returned by the API
interface UseMyConferencesResult {
    conferences: ConferenceResponse[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void; // Add refetch function
}

const useMyConferences = (userId: string): UseMyConferencesResult => {
    const [conferences, setConferences] = useState<ConferenceResponse[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/conference/user` ,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            if (!response.ok) {
                throw new Error(`Failed to fetch conferences: ${response.status} ${response.statusText}`);
            }
            const data: ConferenceResponse[] = await response.json();
            console.log("ata" , data);
            setConferences(data);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
           fetchData();
        }
    }, [userId]); // Only refetch if userId changes

    return { conferences, isLoading, error, refetch: fetchData };
};

export default useMyConferences;