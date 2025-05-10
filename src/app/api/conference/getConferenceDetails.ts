// "use client";
// // api/getConferenceDetails/getConferenceDetails.ts
// import { ConferenceResponse, ConferenceIdentity, Organization, Location, ImportantDate, Rank, Feedback, FollowerInfo } from '../../../models/response/conference.response';

// const API_GET_CONFERENCE_ENDPOINT = 'http://confhub.engineer/api/v1/conference'; //  3005 for details
// const API_SAVE_CONFERENCE_DETAILS_ENDPOINT = `${process.env.NEXT_PUBLIC_DATABASE_URL}/api/v1/conferences/details/save`;


// async function getConferenceFromDB(id: string): Promise<ConferenceResponse> {
//   let responseData: any;
//   try {
//     console.log(`Fetching conference details for ID: ${id} from ${API_GET_CONFERENCE_ENDPOINT}`);
//     const response = await fetch(`${API_GET_CONFERENCE_ENDPOINT}/${id}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       cache: 'no-store',
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error(`HTTP error fetching conference! Status: ${response.status}, Body: ${errorText}`);
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     responseData = await response.json();
//     console.log("Successfully fetched data from GET API (raw):", JSON.stringify(responseData, null, 2)); // Log raw data

//     // --- *** THAY ĐỔI QUAN TRỌNG: Xác định Primary Organization *** ---
//     let primaryOrganization: any = null; // Dùng 'any' hoặc định nghĩa type cụ thể nếu có

//     if (responseData.organizations && Array.isArray(responseData.organizations)) {
//         console.log(`Found ${responseData.organizations.length} organizations. Searching for primary one...`);
//         // Chiến lược: Tìm organization đầu tiên có conferenceDates chứa ít nhất 1 fromDate hợp lệ
//         primaryOrganization = responseData.organizations.find((org: any) => {
//             const hasValidDates = org.conferenceDates &&
//                                   Array.isArray(org.conferenceDates) &&
//                                   org.conferenceDates.length > 0 && // Phải có ít nhất 1 date
//                                   org.conferenceDates.some((date: any) => date && date.fromDate); // Ít nhất 1 date có fromDate
//             if (hasValidDates) {
//                 console.log(`Found potential primary organization (ID: ${org.id}) with valid dates.`);
//             }
//             return hasValidDates;
//         });

//         // Fallback nếu không tìm thấy org nào có date hợp lệ, nhưng vẫn có organizations
//         if (!primaryOrganization && responseData.organizations.length > 0) {
//             console.warn("No organization found with valid 'fromDate' in 'conferenceDates'. Falling back to the first organization.");
//             primaryOrganization = responseData.organizations[0];
//         } else if (!primaryOrganization) {
//              console.warn("No organizations found in the response data at all.");
//              // primaryOrganization vẫn là null
//         }
//     } else {
//         console.warn("responseData.organizations is missing or not an array.");
//     }

//     if (!primaryOrganization) {
//         console.error("Could not determine a primary organization to extract data from. Proceeding with potentially incomplete data.");
//         // Quyết định: throw lỗi hay tiếp tục với dữ liệu rỗng?
//         // throw new Error("Failed to find primary organization data.");
//     } else {
//         console.log(`Using organization (ID: ${primaryOrganization.id}) as the primary source.`);
//     }
//     // --- Kết thúc xác định Primary Organization ---


//     // --- Tiếp tục ánh xạ dữ liệu, nhưng sử dụng primaryOrganization thay vì responseData.organizations[0] ---

//     const conferenceIdentity: ConferenceIdentity = {
//       id: responseData.id,
//       title: responseData.title ?? null,
//       acronym: responseData.acronym ?? null,
//       creatorId: responseData.creatorId ?? null,
//       createdAt: responseData.createdAt ?? null,
//       updatedAt: responseData.updatedAt ?? null,
//     };

//     // Dùng primaryOrganization để tạo targetOrganization
//     const targetOrganization: Organization | null = primaryOrganization ? {
//       id: primaryOrganization.id,
//       year: primaryOrganization.year ?? null,
//       accessType: primaryOrganization.accessType ?? null,
//       isAvailable: primaryOrganization.isAvailable ?? null,
//       conferenceId: conferenceIdentity.id,
//       summerize: primaryOrganization.summary ?? primaryOrganization.summerize ?? null,
//       callForPaper: primaryOrganization.callForPaper ?? null,
//       publisher: primaryOrganization.publisher ?? null,
//       link: primaryOrganization.link ?? null,
//       cfpLink: primaryOrganization.cfpLink ?? null,
//       impLink: primaryOrganization.impLink ?? null,
//       topics: primaryOrganization.topics ?? [],
//       createdAt: primaryOrganization.createdAt ?? null,
//       updatedAt: primaryOrganization.updatedAt ?? null,
//     } : null;

//     // Dùng primaryOrganization để tạo targetLocation
//     const sourceLocation = primaryOrganization?.locations?.[0];
//     const targetLocation: Location | null = sourceLocation ? {
//           id: sourceLocation.id ?? undefined,
//           address: sourceLocation.address ?? null,
//           cityStateProvince: sourceLocation.cityStateProvince ?? null,
//           country: sourceLocation.country ?? null,
//           continent: sourceLocation.continent ?? null,
//           createdAt: sourceLocation.createdAt ?? null,
//           updatedAt: sourceLocation.updatedAt ?? null,
//           isAvailable: sourceLocation.isAvailable ?? null,
//           organizeId: targetOrganization?.id ?? null,
//         }
//       : null;

//     // Dùng primaryOrganization để xử lý targetDates
//     console.log("Processing dates from primaryOrganization.conferenceDates:", primaryOrganization?.conferenceDates);
//     const targetDates: ImportantDate[] | null = primaryOrganization?.conferenceDates // <--- SỬ DỤNG primaryOrganization
//         ? primaryOrganization.conferenceDates
//           .map((date: any, index: number) => {
//             // console.log(`  [Date Map] Processing source date [${index}]:`, JSON.stringify(date)); // Có thể bật lại nếu cần debug sâu

//             if (!date || typeof date !== 'object' || !date.type) {
//                 // console.warn(`  [Date Map] Skipping invalid/null date object at index ${index}.`);
//                 return null;
//             }

//             let fromDateISO: string | null = null;
//             let toDateISO: string | null = null;
//             try {
//                 // Chỉ chuyển đổi nếu fromDate/toDate có giá trị và là string
//                 if (date.fromDate && typeof date.fromDate === 'string') {
//                     fromDateISO = new Date(date.fromDate).toISOString();
//                 }
//                  if (date.toDate && typeof date.toDate === 'string') {
//                     toDateISO = new Date(date.toDate).toISOString();
//                 }
//             } catch (e: any) {
//                 console.error(`  [Date Map] Error converting date at index ${index}: ${e.message}. Date object:`, JSON.stringify(date));
//                 return null;
//             }

//             const transformedDate: ImportantDate = {
//                 id: date.id ?? undefined,
//                 organizedId: targetOrganization?.id ?? null,
//                 fromDate: fromDateISO,
//                 toDate: toDateISO, // Có thể là null nếu date.toDate là null hoặc không hợp lệ
//                 type: date.type ?? null,
//                 name: date.name ?? null,
//                 createdAt: date.createdAt ?? null,
//                 updatedAt: date.updatedAt ?? null,
//                 isAvailable: date.isAvailable ?? null,
//             };
//             // console.log(`  [Date Map] Transformed date [${index}]:`, JSON.stringify(transformedDate));
//             return transformedDate;
//           })
//           .filter((d: ImportantDate | null): d is ImportantDate => d !== null)
//         : null;

//     console.log("Final targetDates array after map/filter:", JSON.stringify(targetDates)); // Log kết quả dates cuối cùng

//     // Xử lý Ranks (vẫn lấy từ responseData gốc)
//     const targetRanks: Rank[] | null = responseData.ranks && Array.isArray(responseData.ranks)
//         ? responseData.ranks.map((rank: any) => ({
//               rank: rank.rank ?? null,
//               source: rank.source ?? null,
//               fieldOfResearch: rank.fieldOfResearch ?? null
//           }))
//         : null;

//     // Xử lý Feedbacks (vẫn lấy từ responseData gốc)
//     const targetFeedBacks: Feedback[] | null = responseData.feedbacks && Array.isArray(responseData.feedbacks)
//       ? responseData.feedbacks.map((fb: any) => ({
//           id: fb.id ?? undefined,
//           organizedId: targetOrganization?.id ?? null, // Gán ID của primaryOrganization
//           creatorId: fb.creatorId ?? fb.user?.id ?? null,
//           firstName: fb.user?.firstName ?? null,
//           lastName: fb.user?.lastName ?? null,
//           avatar: fb.user?.avatar ?? null,
//           description: fb.description ?? null,
//           star: (typeof fb.star === 'number') ? fb.star : null,
//           createdAt: fb.createdAt ?? null,
//           updatedAt: fb.updatedAt ?? null,
//         }))
//       : [];


//     // Xử lý FollowedBy (vẫn lấy từ responseData gốc)
//     const targetFollowedBy: FollowerInfo[] | null = responseData.followBy && Array.isArray(responseData.followBy)
//         ? responseData.followBy.map((follower: any) => ({
//               id: follower.user?.id ?? follower.id ?? undefined,
//               email: follower.user?.email ?? null,
//               firstName: follower.user?.firstName ?? null,
//               lastName: follower.user?.lastName ?? null,
//               avatar: follower.user?.avatar ?? null,
//               createdAt: follower.createdAt ?? null,
//               updatedAt: follower.updatedAt ?? null,
//           }))
//         : [];

//     // Tạo đối tượng cuối cùng
//     const defaultOrganization: Organization = { id: '', year: null, accessType: null, isAvailable: null, conferenceId: conferenceIdentity.id, summerize: null, callForPaper: null, publisher: null, link: null, cfpLink: null, impLink: null, topics: [], createdAt: null, updatedAt: null };
//     const defaultLocation: Location | null = null;

//     const dataToSendToSaveAPI: ConferenceResponse = {
//       conference: conferenceIdentity,
//       organization: targetOrganization ?? defaultOrganization, // Sử dụng targetOrganization từ primary
//       location: targetLocation ?? defaultLocation,           // Sử dụng targetLocation từ primary
//       dates: targetDates ?? [],                             // Sử dụng targetDates từ primary
//       ranks: targetRanks ?? [],
//       feedBacks: targetFeedBacks ?? [],
//       followedBy: targetFollowedBy ?? [],
//     };

//     console.log("--- Data transformed (using primary org) and ready to send to SAVE API: ---");
//     console.log(JSON.stringify(dataToSendToSaveAPI, null, 2));
//     console.log("-------------------------------------------------------------------------");

//     // Gửi đến API SAVE
//     console.log(`Sending transformed data to SAVE endpoint: ${API_SAVE_CONFERENCE_DETAILS_ENDPOINT}`);
//     const saveResponse = await fetch(API_SAVE_CONFERENCE_DETAILS_ENDPOINT, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(dataToSendToSaveAPI),
//     });

//     if (!saveResponse.ok) {
//       const errorText = await saveResponse.text();
//       console.error(`Save operation failed! Status: ${saveResponse.status}, Body: ${errorText}`);
//       throw new Error(`Save operation failed! Status: ${saveResponse.status}`);
//     }

//     const saveResult = await saveResponse.json();
//     console.log("Save API Response:", saveResult);

//     return dataToSendToSaveAPI; // Trả về dữ liệu đã gửi đi

//   } catch (error: any) {
//     console.error('--- Error in getConferenceFromDB ---');
//     console.error('Error message:', error.message);
//     if (error.cause) { console.error('Error cause:', error.cause); }
//     console.error('Stack trace:', error.stack);
//     if (responseData) { console.error('Response data received before error:', responseData); }
//     console.error('------------------------------------');
//     throw error;
//   }
// }

// const API_GET_JSON_CONFERENCE_ENDPOINT = `${process.env.NEXT_PUBLIC_DATABASE_URL}/api/v1/conference`;

// async function getConferenceFromJSON(id: string): Promise<ConferenceResponse> {
//   try {
//     const response = await fetch(`${API_GET_JSON_CONFERENCE_ENDPOINT}/${id}`, {  // Removed /api/v1/conference
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const responseData: ConferenceResponse = await response.json();

//     // Date handling (important: check for null/undefined for each date)
//     if (responseData.dates) {
//       responseData.dates = responseData.dates.map(date => {
//           if (date && date.fromDate) {
//               date.fromDate = new Date(date.fromDate).toISOString(); //convert to ISO string before passing in request body
//           }
//           if(date && date.toDate) {
//               date.toDate = new Date(date.toDate).toISOString(); //convert to ISO string before passing in request body
//           }
//           return date;
//       })
//     }

//     return responseData;

//   } catch (error: any) {
//     console.error('Error fetching and saving conference details:', error.message);
//     if (error instanceof TypeError) {
//       console.error('Network error:', error.message);
//     }
//     throw error; // Re-throw for the caller
//   }
// }

// export { getConferenceFromDB, getConferenceFromJSON };

// api/getConferenceDetails/getConferenceDetails.ts
import { appConfig } from '@/src/middleware';
import { ConferenceResponse} from '../../../models/response/conference.response';
const API_GET_CONFERENCE_ENDPOINT = appConfig.NEXT_PUBLIC_DATABASE_URL || "http://confhub.engineer"; //  3005 for details


async function getConferenceFromDB(id: string): Promise<ConferenceResponse> {
  let responseData: any;
  try {
    const response = await fetch(`${API_GET_CONFERENCE_ENDPOINT}/api/v1/conference/${id}`, {  // Removed /api/v1/confeence
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error fetching conference! Status: ${response.status}, Body: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData: ConferenceResponse = await response.json();
    return responseData; // Trả về dữ liệu đã gửi đi

  } catch (error: any) {
    console.error('--- Error in getConferenceFromDB ---');
    console.error('Error message:', error.message);
    if (error.cause) { console.error('Error cause:', error.cause); }
    console.error('Stack trace:', error.stack);
    if (responseData) { console.error('Response data received before error:', responseData); }
    console.error('------------------------------------');
    throw error;
  }
}


export { getConferenceFromDB };