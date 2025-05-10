// // src/app/[locale]/chatbot/LiveChatAPIConfig.tsx
// "use client";
// import { useEffect, memo, useCallback } from "react";
// import { usePathname } from 'next/navigation';

// // --- Import Namespace for LiveChat specific items ---
// import * as LiveChat from '@/src/app/[locale]/chatbot/livechat/index';

// // --- Import types chung và config ---
// import { OutputModality, PrebuiltVoice, Language, ToolCall } from '@/src/app/[locale]/chatbot/lib/live-chat.types';
// import { transformConferenceData } from './utils/transformApiData'; // Giả sử giữ lại helper này
// import { appConfig } from "@/src/middleware"; // Giả sử giữ lại config này

// // --- !!! Import hàm và type cấu hình TẬP TRUNG !!! ---
// // !!! Đảm bảo đường dẫn này chính xác tới file languageConfig.ts của bạn !!!
// import { getAgentLanguageConfig, AgentId } from '@/src/app/[locale]/chatbot/utils/languageConfig';

// // --- KHÔNG cần import trực tiếp function/instruction nữa ---
// // import { EN_routeToAgentDeclaration, EN_hostAgentSystemInstructions } from './lib/functionDeclarations';

// // --- Types cho Tool Call Handling (giữ nguyên) ---
// interface RouteToAgentArgs { targetAgent: AgentId; taskDescription: string; inputData?: Record<string, any> | string; }
// interface ConferenceAgentInput { searchQuery?: string; }
// interface JournalAgentInput { searchQuery?: string; }
// interface NavigationAgentInput { url: string; }
// // interface WebsiteInfoInput { /*...*/ }
// interface OriginalLiveChatResponseFormat { response: { content: any; }; id: string; }
// interface ErrorPayload { type: "error"; message: string; }

// // --- Props Interface (Không cần hostAgentSystemInstructions) ---
// interface LiveChatAPIConfigProps {
//   outputModality: OutputModality;
//   selectedVoice: PrebuiltVoice;
//   language: Language; // Vẫn cần ngôn ngữ để chọn config phù hợp
// }

// function LiveChatAPI({ outputModality, selectedVoice, language }: LiveChatAPIConfigProps) {
//   const { client, setConfig } = LiveChat.useLiveAPIContext();
//   const pathname = usePathname();
//   const currentLocale = pathname.split('/')[1] as Language;

//   // --- Effect 1: Configure API Client using Central Config ---
//   useEffect(() => {
//     // Xác định ngôn ngữ và agent ID
//     // const activeLanguage = currentLocale || language;
//     const agentId: AgentId = 'HostAgent'; // Component này luôn là HostAgent

//     console.log(`[LiveChatAPIConfig] Configuring API as ${agentId} for: Modality=${outputModality}, Voice=${selectedVoice}, Language=${language}`);

//     // --- Lấy cấu hình (instructions & functions) từ hàm tập trung ---
//     const agentConfig = getAgentLanguageConfig(language, agentId);
//     const { systemInstructions, functionDeclarations } = agentConfig;

//     if (!systemInstructions || systemInstructions.startsWith("Error:")) {
//         console.error(`[LiveChatAPIConfig] Failed to get valid system instructions for ${agentId}/${language}. Using fallback.`);
//         // Cung cấp fallback cứng nếu cần, hoặc dựa vào fallback trong getAgentLanguageConfig
//     }
//      if (!functionDeclarations || functionDeclarations.length === 0) {
//         console.warn(`[LiveChatAPIConfig] No function declarations found for ${agentId}/${language}. Tools might not work.`);
//     }

//     console.log(`[LiveChatAPIConfig] Using instructions for ${agentId}/${language}:`, systemInstructions);
//     console.log(`[LiveChatAPIConfig] Using functions for ${agentId}/${language}:`, functionDeclarations);

//     // --- Cấu hình API Client ---
//     const modalitiesConfig = outputModality === 'audio' ? ["AUDIO"] : ["TEXT"];
//     const generationConfig: any = { responseModalities: modalitiesConfig };
//     if (outputModality === 'audio') {
//       generationConfig.speechConfig = { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } } };
//     }

//     // --- Tạo config cuối cùng ---
//     const finalConfig = {
//       model: "models/gemini-2.0-flash-live-001", // Hoặc model bạn dùng
//       generationConfig: generationConfig,
//       systemInstruction: { parts: [{ text: systemInstructions }] }, // <-- Sử dụng instruction lấy được
//       tools: functionDeclarations && functionDeclarations.length > 0
//              ? [{ functionDeclarations: functionDeclarations }]
//              : undefined, // <-- Sử dụng functions lấy được
//     };

//     console.log("[LiveChatAPIConfig] Setting final Host Agent config:", JSON.stringify(finalConfig, null, 2));
//     setConfig(finalConfig);

//     // Dependencies: Các giá trị ảnh hưởng đến việc lấy config hoặc cấu hình client
//   }, [setConfig, outputModality, selectedVoice, language, currentLocale, getAgentLanguageConfig]);


//   // --- Effect 2: Handle Tool Calls (Logic xử lý tool call giữ nguyên) ---
//   const handleToolCall = useCallback(async (toolCall: ToolCall) => {
//     console.log(`[LiveChatAPIConfig] Host Agent received toolcall:`, toolCall);
//     const NEXT_PUBLIC_DATABASE_URL = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1` || "http://confhub.engineer/api/v1";
//     const BASE_WEB_URL = typeof window !== 'undefined' ? window.location.origin : "http://localhost:8386"; // Lấy origin động
//     const responses: OriginalLiveChatResponseFormat[] = [];
//     const activeLanguage = currentLocale || language; // Ngôn ngữ dùng cho navigation URL

//     for (const fc of toolCall.functionCalls) {
//       let responseContentPart: any;
//       try {
//         // Chỉ xử lý routeToAgent vì đây là HostAgent
//         if (fc.name === 'routeToAgent') {
//           const args = fc.args as RouteToAgentArgs;
//           const targetAgent = args?.targetAgent;
//           const taskDescription = args?.taskDescription;

//           if (!targetAgent) throw new Error("Missing 'targetAgent' in routeToAgent arguments.");
//           console.log(`[LiveChatAPIConfig] Routing task "${taskDescription || '(no description)'}" to ${targetAgent}`);

//           let resultData: any = null;
//           let errorMessage: string | undefined = undefined;

//           // --- Mô phỏng thực thi Sub Agent (logic này giữ nguyên) ---
//           switch (targetAgent) {
//             case 'ConferenceAgent': {
//               console.log(`Simulating ConferenceAgent: Fetching conferences.`);
//               const searchQuery = conferenceInput?.searchQuery;
//               const url = new URL(`${NEXT_PUBLIC_DATABASE_URL}/conference`);
//               if (searchQuery) url.searchParams.append('searchQuery', searchQuery);
//               const finalUrl = url.toString();
//               console.log(`ConferenceAgent API Call URL: ${finalUrl}`);
//               const apiResponse = await fetch(finalUrl);
//               if (!apiResponse.ok) throw new Error(`API Error (${apiResponse.status}) for ${targetAgent}: ${(await apiResponse.text()).substring(0, 200)}`);
//               const rawData = await apiResponse.json();
//               resultData = transformConferenceData(rawData, searchQuery); // Giữ lại transform nếu cần
//               console.log(`ConferenceAgent simulation result size: ${resultData?.conferences?.length || 0} items`);
//               break;
//             }
//              case 'JournalAgent': {
//                 console.log(`Simulating JournalAgent: Fetching journals.`);
//                 const journalInput = inputData as JournalAgentInput;
//                 const searchQuery = journalInput?.searchQuery;
//                 const url = new URL(`${NEXT_PUBLIC_DATABASE_URL}/journal`);
//                 if (searchQuery) url.searchParams.append('searchQuery', searchQuery);
//                 const finalUrl = url.toString();
//                  console.log(`JournalAgent API Call URL: ${finalUrl}`);
//                 const apiResponse = await fetch(finalUrl);
//                  if (!apiResponse.ok) throw new Error(`API Error (${apiResponse.status}) for ${targetAgent}: ${(await apiResponse.text()).substring(0, 200)}`);
//                 resultData = await apiResponse.json(); // Giả sử không cần transform
//                 console.log(`JournalAgent simulation result:`, resultData); // Log kết quả
//                 break;
//              }
//             case 'NavigationAgent': {
//               console.log(`Simulating NavigationAgent: Performing navigation.`);
//               const navInput = inputData as NavigationAgentInput;
//               const targetUrl = navInput?.url;
//               if (!targetUrl || typeof targetUrl !== 'string') throw new Error("Missing or invalid 'url' in inputData for NavigationAgent.");
//               let urlToOpen: string, navMsg: string;
//               if (targetUrl.startsWith('/')) {
//                 const langPrefix = language && ['en', 'vi', 'zh'].includes(language) ? `/${language}` : '/en'; // Default locale
//                 urlToOpen = `${BASE_WEB_URL}${langPrefix}${targetUrl}`;
//                 navMsg = `Okay, navigating to internal page: ${targetUrl}`;
//               } else if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
//                 urlToOpen = targetUrl;
//                 navMsg = `Okay, opening external link: ${targetUrl}`;
//               } else {
//                 throw new Error(`Invalid 'url' format: ${targetUrl}. Must start with '/' or 'http(s)://'.`);
//               }
//               if (typeof window !== 'undefined') {
//                 console.log(`Opening URL in new tab: ${urlToOpen}`);
//                 window.open(urlToOpen, '_blank', 'noopener,noreferrer');
//                 resultData = { status: 'success', message: navMsg, urlOpened: urlToOpen };
//               } else {
//                  console.warn("window object not available, cannot open new tab.");
//                 resultData = { status: 'skipped', message: `Navigation requested for ${urlToOpen}, but cannot open tab.` };
//               }
//               break;
//             }
//             case 'WebsiteInfoAgent': // Thêm các agent khác nếu cần
//             case 'AdminContactAgent':
//               console.log(`Simulating ${targetAgent}.`);
//               resultData = { status: 'acknowledged', message: `Received request for ${targetAgent}. Task: "${taskDescription || 'N/A'}".`, inputReceived: inputData };
//               console.log(`${targetAgent} simulation result:`, resultData);
//               break;
//             default:
//               const unknownAgent: string = targetAgent;
//               errorMessage = `Unsupported targetAgent: '${unknownAgent}'.`;
//               console.warn(errorMessage);
//               break;
//           }
//           // --- Kết thúc mô phỏng ---

//           if (errorMessage) throw new Error(errorMessage);
//           responseContentPart = resultData;

//         } else {
//           // Xử lý function call không mong muốn (chỉ mong đợi routeToAgent)
//            console.warn(`[LiveChatAPIConfig] Host Agent received unexpected function call: ${fc.name}.`);
//            throw new Error(`Error: Host Agent received unexpected function call '${fc.name}'. Expected 'routeToAgent'.`);
//         }

//         // Push kết quả thành công
//         responses.push({ response: { content: responseContentPart }, id: fc.id });

//       } catch (error: any) {
//         console.error(`[LiveChatAPIConfig] Error processing function call ${fc.name} (Target: ${(fc.args as any)?.targetAgent || 'N/A'}):`, error);
//         let errMsg = error.message || "An unexpected error occurred.";
//         const errorPayload: ErrorPayload = { type: "error", message: `Failed execution for ${fc.name}: ${errMsg.substring(0, 300)}` };
//         // Push cấu trúc lỗi
//         responses.push({ response: { content: errorPayload }, id: fc.id });
//       }
//     } // End for loop

//     if (responses.length > 0) {
//       console.log("[LiveChatAPIConfig] Sending tool responses back:", JSON.stringify(responses, null, 2));
//       client.sendToolResponse({ functionResponses: responses });
//     } else {
//       console.log("[LiveChatAPIConfig] No responses generated for tool call batch.");
//     }
//     // Dependencies cho useCallback: những giá trị bên ngoài mà hàm này sử dụng
//   }, [client, currentLocale, language, transformConferenceData, getAgentLanguageConfig]); // Thêm getAgentLanguageConfig nếu nó thay đổi config tool call


//   // Effect 3: Hook Registration (Không đổi)
//   useEffect(() => {
//     client.on("toolcall", handleToolCall);
//     console.log("[LiveChatAPIConfig] Tool call handler registered.");
//     return () => {
//       client.off("toolcall", handleToolCall);
//       console.log("[LiveChatAPIConfig] Tool call handler unregistered.");
//     };
//   }, [client, handleToolCall]); // Chỉ phụ thuộc client và bản thân callback

//   return null; // Component không render UI trực tiếp
// }

// export const LiveChatAPIConfig = memo(LiveChatAPI); // Giữ memoization



// src/app/[locale]/livechat/LiveChatAPIConfig.tsx (Sử dụng phương thức cũ , không dùng A2A)

"use client";
import { useEffect, memo } from "react";
import { useLiveAPIContext } from '@/src/app/[locale]/chatbot/livechat/contexts/LiveAPIContext';
import {
  EN_getConferencesDeclaration,
  EN_getJournalsDeclaration,
  EN_getWebsiteInfoDeclaration, EN_navigationDeclaration,
  // drawChartDeclaration, // Keep commented if not used
  VN_getConferencesDeclaration, VN_getJournalsDeclaration, VN_getWebsiteInfoDeclaration, VN_drawChartDeclaration,
  CN_getConferencesDeclaration, CN_getJournalsDeclaration, CN_getWebsiteInfoDeclaration, CN_drawChartDeclaration,
  websiteInfo,
  EN_followUnfollowItemDeclaration,
  EN_openGoogleMapDeclaration
} from "../lib/functions"; 
import { OutputModality, PrebuiltVoice, Language, ToolCall } from '@/src/app/[locale]/chatbot/lib/live-chat.types';
import { transformConferenceData } from '../utils/transformApiData'; 
import { appConfig } from "@/src/middleware"; 
import { FunctionDeclaration, FunctionCall } from "@google/generative-ai";
import { usePathname } from 'next/navigation';

interface LiveChatAPIConfigProps {
  outputModality: OutputModality;
  selectedVoice: PrebuiltVoice;
  language: Language;
  systemInstructions: string;
}

function LiveChatAPI({ outputModality, selectedVoice, language, systemInstructions }: LiveChatAPIConfigProps) {
  const { client, setConfig } = useLiveAPIContext();

  const pathname = usePathname()
  const currentLocale = pathname.split('/')[1]

  // Effect 1: Configure the API client based on props
  useEffect(() => {
    console.log(`Configuring API for: Modality=${outputModality}, Voice=${selectedVoice}, Language=${language}, Locale=${currentLocale}`);

    const modalitiesConfig = outputModality === 'audio' ? ["AUDIO"] : ["TEXT"];
    const generationConfig: any = {
      responseModalities: modalitiesConfig,
    };

    if (outputModality === 'audio') {
      generationConfig.speechConfig = {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: selectedVoice }
        },
      };
    }

    // --- Select Function Declarations based on Language ---
    let activeFunctionDeclarations: FunctionDeclaration[];

    // Determine active language (use currentLocale if available and reliable, otherwise fall back to prop)
    const activeLang = language;

    if (activeLang === 'vi') {
      console.log("Using Vietnamese function declarations.");
      activeFunctionDeclarations = [
        VN_getConferencesDeclaration,
        VN_getJournalsDeclaration,
        VN_getWebsiteInfoDeclaration,
        // navigationDeclaration, // Add navigation
        // VN_drawChartDeclaration,
      ];
    } else if (activeLang === 'zh') {
      console.log("Using Chinese function declarations.");
      activeFunctionDeclarations = [
        CN_getConferencesDeclaration,
        CN_getJournalsDeclaration,
        CN_getWebsiteInfoDeclaration,
        // navigationDeclaration, // Add navigation
        // CN_drawChartDeclaration,
      ];
    } else { // Default to English
      console.log("Using English function declarations (default).");
      activeFunctionDeclarations = [
        EN_getConferencesDeclaration,
        EN_getJournalsDeclaration,
        EN_getWebsiteInfoDeclaration,
        EN_navigationDeclaration, // Add navigation
        // drawChartDeclaration,
        EN_followUnfollowItemDeclaration,
        EN_openGoogleMapDeclaration
      ];
    }
    // --- End Selection ---

    const finalConfig = {
      model: "models/gemini-2.0-flash-live-001",
      generationConfig: generationConfig,
      systemInstruction: {
        parts: [{ text: systemInstructions }],
      },
      tools: [
        {
          functionDeclarations: activeFunctionDeclarations,
        },
      ],
    };

    console.log("Setting config with functions:", JSON.stringify(finalConfig.tools, null, 2));
    setConfig(finalConfig);

  }, [setConfig, outputModality, selectedVoice, language, systemInstructions, currentLocale]); // Added currentLocale dependency


  // Effect 2: Handle Tool Calls
  useEffect(() => {
    const onToolCall = async (toolCall: ToolCall) => {
      console.log(`Got toolcall`, toolCall);
      const NEXT_PUBLIC_DATABASE_URL = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1` || "http://confhub.engineer/api/v1";
      const BASE_WEB_URL = "http://localhost:8386"; // Your web app's base URL
      const responses = [];
      
      // Helper function to safely extract URL argument
      const getUrlArg = (fc: FunctionCall): string | undefined => {
        return fc.args && typeof fc.args === 'object' && typeof (fc.args as any).url === 'string'
          ? (fc.args as any).url
          : undefined;
      };

      for (const fc of toolCall.functionCalls) {
        // Reset variables for each function call
        let apiUrl = '';
        let method: 'GET' | 'POST' = 'POST'; // Default, override as needed
        let body: string | undefined = undefined;
        let headers: HeadersInit = { 'Content-Type': 'application/json' };
        let requiresJsonResponse = false;
        let responseData: any;
        let finalUrl = ''; // URL for API calls OR navigation
        let searchQuery: string | undefined = undefined;
        let requiresApiCall = true; // Assume API call needed unless it's navigation

        try {
          switch (fc.name) {
            // --- Existing Cases ---
            case "getConferences":

              apiUrl = `${NEXT_PUBLIC_DATABASE_URL}/conference`;
              method = 'GET';
              headers = {};
              searchQuery = fc.args && typeof fc.args === 'object' && typeof (fc.args as any).searchQuery === 'string'
                ? (fc.args as any).searchQuery
                : undefined;
              if (!searchQuery) {
                console.warn(`Warning: 'searchQuery' argument missing/invalid for ${fc.name}. Proceeding without search query.`);
                finalUrl = apiUrl;
              } else {
                console.log(`Extracted Conference Search Query for ${fc.name}:`, searchQuery);
                // Encode the search query properly
                finalUrl = `${apiUrl}?${searchQuery}`;
              }
              requiresJsonResponse = true;
              break;

            case "getJournals":

              apiUrl = `${NEXT_PUBLIC_DATABASE_URL}/journal`; // *** MAKE SURE THIS IS THE CORRECT ENDPOINT ***
              method = 'GET'; // Or POST? Check your API spec
              headers = {};   // Adjust if POST
              // Assuming search query like conferences if GET
              searchQuery = fc.args && typeof fc.args === 'object' && typeof (fc.args as any).searchQuery === 'string'
                ? (fc.args as any).searchQuery
                : undefined;
              if (!searchQuery) {
                finalUrl = apiUrl;
              } else {
                finalUrl = `${apiUrl}?${searchQuery}`;
              }
              // If POST:
              // method = 'POST';
              // body = JSON.stringify(fc.args);
              // finalUrl = apiUrl;
              requiresJsonResponse = true;
              break;

            case "getWebsiteInfo":

              // Assuming this is just informational, maybe no API needed?
              // Or perhaps calls a general info endpoint? Clarify its purpose.
              // For now, let's assume it doesn't need an API call here, maybe handled differently
              console.warn(`${fc.name} called, but no specific backend API defined in this handler.`);
              responses.push({ response: { content: websiteInfo}, id: fc.id });
              requiresApiCall = false; // Prevent API call attempt below
              break; // Skip to next function call

            // --- NEW Navigation Case ---
            case "navigation":
              requiresApiCall = false;
              const targetUrl = getUrlArg(fc);

              if (!targetUrl) {
                console.error(`Missing or invalid 'url' argument for navigation.`);
                throw new Error("Missing 'url' argument for navigation function.");
              }

              let navigationResponseMessage = '';
              let urlToOpen = '';

              if (targetUrl.startsWith('/')) {
                // Internal navigation
                if (!currentLocale) {
                  console.error("Cannot determine current locale for internal navigation.");
                  throw new Error("Locale information unavailable for internal link construction.");
                }
                urlToOpen = `${BASE_WEB_URL}/${currentLocale}${targetUrl}`;
                navigationResponseMessage = `Okay, I'll open the internal page: ${targetUrl}`;
                console.log(`Attempting internal navigation to: ${urlToOpen}`);

              } else if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
                // External navigation
                urlToOpen = targetUrl;
                navigationResponseMessage = `Okay, I'll open the external website.`; // Keep it simple
                console.log(`Attempting external navigation to: ${urlToOpen}`);

              } else {
                console.error(`Invalid 'url' format for navigation: ${targetUrl}. Must start with '/' or 'http(s)://'.`);
                throw new Error(`Invalid 'url' format. Must be an internal path (starting with '/') or a full external URL.`);
              }

              // --- Execute Navigation in New Tab ---
              // Ensure this runs in the browser context
              if (typeof window !== 'undefined') {
                window.open(urlToOpen, '_blank', 'noopener,noreferrer');
              } else {
                console.warn("window object not available, cannot open new tab (maybe running in Node?).");
                // Handle server-side rendering or other environments if necessary
                navigationResponseMessage = `Navigation requested for ${urlToOpen}, but cannot open tab from this context.`;
              }
              // --- --------------------------- ---

              // Respond to the model that the action was initiated
              responses.push({
                response: { content: { message: navigationResponseMessage, status: 'success' } }, // Simple success message
                id: fc.id
              });
              continue; // Go to the next function call in the batch


            // --- Default Case ---
            default:
              console.warn(`Unknown function call name received: ${fc.name}`);
              responses.push({ response: { content: { type: "error", message: `Unknown function: ${fc.name}` } }, id: fc.id });
              requiresApiCall = false;
              continue; // Skip to next function call
          }
          // --- End Switch ---


          // --- API Call Logic (Only if requiresApiCall is true) ---
          if (requiresApiCall) {
            console.log(`Calling API for ${fc.name} using ${method} at: ${finalUrl}`);
            if (body) console.log('With body:', body);

            const response = await fetch(finalUrl, { method, headers, body });

            if (!response.ok) {
              const errorText = await response.text();
              console.error(`API call for ${fc.name} failed with status ${response.status}: ${errorText}`);
              throw new Error(`API Error (${response.status}) for ${fc.name}: ${errorText.substring(0, 200)}`);
            }

            try {
              responseData = requiresJsonResponse ? await response.json() : await response.text();
            } catch (parseError: any) {
              console.error(`Error parsing ${requiresJsonResponse ? 'JSON' : 'text'} response for ${fc.name}:`, parseError);
              const rawText = await response.text(); // Attempt to read as text for debugging
              console.error("Raw response text:", rawText.substring(0, 500));
              throw new Error(`Failed to parse API response for ${fc.name}.`);
            }

            let contentToSend = responseData;
            // Apply transformation if needed (e.g., for conferences)
            if ((fc.name === 'getConferences') && responseData) {
              console.log(`Transforming data for ${fc.name}${searchQuery ? ` with query: ${searchQuery}` : ''}`);
              // Ensure transformConferenceData handles potentially missing search query gracefully
              contentToSend = transformConferenceData(responseData, searchQuery);
            }
            // Add transformations for journals if needed

            console.log(`Response data for ${fc.name}:`, contentToSend);
            responses.push({ response: { content: contentToSend }, id: fc.id });
          }
          // --- End API Call Logic ---
        } catch (error: any) {
          console.error(`Error processing function call ${fc.name}:`, error);
          let errorMessage = error.message || "An unexpected error occurred processing the tool call.";
          if (errorMessage.length > 300) errorMessage = errorMessage.substring(0, 297) + "...";
          // Ensure error response format is consistent
          responses.push({
            response: {
              content: { type: "error", message: `Failed to execute ${fc.name}: ${errorMessage}` }
            },
            id: fc.id
          });
        }
      } // End for loop

      if (responses.length > 0) {
        console.log("Sending tool responses:", JSON.stringify(responses, null, 2));
        client.sendToolResponse({ functionResponses: responses });
      } else {
        console.log("No responses generated for this tool call batch.");
      }
    };

    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client, currentLocale]); // Added currentLocale to dependency array for onToolCall


  return null;
}

export const LiveChatAPIConfig = memo(LiveChatAPI);