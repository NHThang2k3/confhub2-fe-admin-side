// hooks/useSequentialConferenceData.ts
import { useState, useEffect } from 'react';
import { ConferenceResponse } from '../../models/response/conference.response';
import { getConferenceFromDB } from '../../app/api/conference/getConferenceDetails';

const useSequentialConferenceData = (id: string | null) => {
    const [conferenceDataFromDB, setDbData] = useState<ConferenceResponse | null>(null);
    const [conferenceDataFromJSON, setJsonData] = useState<ConferenceResponse | null>(null);
    const [dbError, setDbError] = useState<string | null>(null);
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true); // Tổng trạng thái loading

    useEffect(() => {
        const fetchAllData = async () => {
            if (!id) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setDbData(null);
            setJsonData(null);
            setDbError(null);
            setJsonError(null);

            try {
                // --- Bước 1: Fetch từ DB ---
                console.log("Fetching from DB...");
                const dbInfo = await getConferenceFromDB(id);
                setDbData(dbInfo);
                console.log("Fetched from DB successfully.");

                // --- Bước 2: Fetch từ JSON (chỉ khi DB thành công) ---

            } catch (dbErr: any) {
                console.error('Error fetching DB data:', dbErr);
                if (dbErr.status === 404) {
                    setDbError("Conference not found in DB");
                } else {
                    setDbError(dbErr.message || 'An error occurred while fetching DB data.');
                }
                // Nếu lỗi DB, không cần fetch JSON nữa
            } finally {
                setLoading(false);
                console.log("Finished all fetching attempts.");
            }
        };

        fetchAllData();

    }, [id]); // Chạy lại khi id thay đổi

    return {
        conferenceDataFromDB,
        conferenceDataFromJSON,
        dbError,
        jsonError,
        loading // Trạng thái loading tổng
    };
};

export default useSequentialConferenceData;