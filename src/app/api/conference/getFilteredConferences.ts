import { appConfig } from '@/src/middleware';
import { ConferenceListResponse } from '@/src/models/response/conference.list.response';

const API_FILTERED_CONFERENCES_ENDPOINT = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/conference`;
export interface FetchConferencesParams {
  keyword?: string;
  title?: string;
  acronym?: string;
  country?: string;
  type?: 'Online' | 'Offline' | 'Hybrid';
  fromDate?: string;
  toDate?: string;
  rank?: string;
  source?: string;
  topics?: string[];
  publisher?: string;
  page?: string;
  sortBy?: 'date' | 'rank' | 'name' | 'submissionDate' | 'fromDate' | 'toDate';
  sortOrder?: 'asc' | 'desc';
  perPage?: string;
}


export const fetchConferences = async (params: FetchConferencesParams): Promise<ConferenceListResponse> => {
  const queryParams = new URLSearchParams();

  // Thêm tất cả tham số vào query string,  kiểm tra undefined/null
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(item => queryParams.append(key, item));
      } else {
        queryParams.append(key, String(value));
      }
    }
  });

  const url = `${API_FILTERED_CONFERENCES_ENDPOINT}?${queryParams.toString()}`;
  console.log(`Query: ${url}`);

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('No conferences found matching your criteria.'); // Rõ ràng lỗi.
    }
    throw new Error(`HTTP error! status: ${response.status}`); // Giữ lại thông tin lỗi chung.
  }

  const data: ConferenceListResponse = await response.json(); // Rõ ràng kiểu dữ liệu trả về.

  // 2. Send the received data to your backend (3000)
  
  // // 2. Send the received data to your backend (3000)
  // const saveResponse = await fetch(API_SAVE_CONFERENCE_ENDPOINT, {
  //   method: 'POST', // Use POST for sending data
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(data), // Send the ENTIRE responseData
  // });

  // if (!saveResponse.ok) {
  //   // Handle errors from the save operation
  //   throw new Error(`Save operation failed! status: ${saveResponse.status}`);
  // }
  // const saveResult = await saveResponse.json(); //get save success message
  // console.log(saveResult.message); // log save success message

  return data;
};