import { useState, useEffect, useRef } from 'react'; // Thêm useRef
import { fetchVisualizationData } from '@/src/app/api/visualization/visualizationApi';
import { ConferenceDetailsListResponse } from '@/src/models/response/conference.response';

interface UseVisualizationDataReturn {
  data: ConferenceDetailsListResponse | null;
  loading: boolean;
  error: string | null;
}

const useVisualizationData = (): UseVisualizationDataReturn => {
  // console.log(`Hook executing`);
  const [data, setData] = useState<ConferenceDetailsListResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const dataRef = useRef<any | null>(null); // Để theo dõi tham chiếu

  useEffect(() => {
    // console.log(`useEffect running - Fetching data...`);
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchVisualizationData();
        // console.log(`Data fetched successfully. Result length: ${result?.length}`);
        if (dataRef.current !== result) {
            // console.log(`Data reference CHANGED after fetch.` + 'font-weight: bold;');
        } else {
            //  console.log(`Data reference is STABLE after fetch.`);
        }
        dataRef.current = result; // Cập nhật ref *trước* khi set state
        setData(result);
      } catch (err: any) {
        // console.error(`Error fetching data:`, err);
        setError(err.message || 'An unknown error occurred.');
        setData(null); // Clear data on error
        dataRef.current = null;
      } finally {
        // console.log(`Setting loading to false.`);
        setLoading(false);
      }
    };

    loadData();
    // No dependencies needed if data fetching happens only once on mount
  }, []);

  // console.log(`Returning: loading=${loading}, error=${error}, data exists=${!!data}`);
  return { data, loading, error };
};

export default useVisualizationData;