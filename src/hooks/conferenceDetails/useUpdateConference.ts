// In useUpdateConference.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { appConfig } from '@/src/middleware';

interface UpdateConferenceResult {
  success: boolean;
  message?: string;
  error?: string; // More specific error message
}

const useUpdateConference = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateResult, setUpdateResult] = useState<UpdateConferenceResult | null>(null);
  const router = useRouter();

  const updateConference = async (conferenceId: string | null | undefined) => { // Add updatedData parameter
    if (!conferenceId) {
      setUpdateResult({ success: false, error: 'Conference ID is required.' });
      return;
    }

    setIsUpdating(true);
    setUpdateResult(null); // Clear previous results

    try {
      const response = await fetch(`${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/conference/update/${conferenceId}`, {
        method: 'POST', // Changed to PUT for updates (more standard RESTful practice), can also be PATCH
        headers: {
          'Content-Type': 'application/json',
        },
      });


      if (response.status === 201) {  // Check for 201 Created status
        setUpdateResult({ success: true, message: 'Conference updated successfully!' });
        window.location.reload();
      } else if (!response.ok) { // Handle errors *after* checking 201
        const errorData = await response.json();
        // More specific error handling
        const errorMessage = errorData.message || `HTTP error: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);

      }  else { // Fallback for unexpected successful response
        const data = await response.json(); // Parse JSON *only* if needed
        setUpdateResult({ success: false, error: data.message || 'Conference update failed with an unknown error.' });
      }


    } catch (error: any) {
      setUpdateResult({ success: false, error: error.message || 'An unexpected error occurred.' });
    } finally {
      setIsUpdating(false);
    }
  };

  return { isUpdating, updateResult, updateConference };
};

export default useUpdateConference;