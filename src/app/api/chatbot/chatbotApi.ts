// // File chatbotApi.ts:

// import { appConfig } from "@/src/middleware";

// // Giữ lại base URL
// const API_BASE_URL = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api`;

// // --- BEGIN: Simplified Response Types ---

// // 1. Text Response (Giữ nguyên hoặc điều chỉnh nếu backend thay đổi key)
// export interface TextMessageResponse {
//     type: 'text';
//     message: string;
//     // thought?: string; // Có thể giữ lại nếu backend vẫn gửi thought cho text
// }

// // 2. Unified Error Response (Khớp với backend và lỗi fetch/network)
// export interface ApiErrorResponse {
//     type: 'error'; // Thêm 'type' để thống nhất
//     message: string; // Sử dụng 'message' thay vì 'error' để nhất quán
//     thought?: string; // Giữ lại thought để debug
// }

// // 3. Updated API Response Union Type (Chỉ còn text hoặc error)
// export type ApiResponse = TextMessageResponse | ApiErrorResponse;

// // --- END: Simplified Response Types ---


// // --- BEGIN: Simplified History Item Type for API ---

// // Chỉ cần role và parts khi gửi lên API
// export interface ApiHistoryItem {
//      role: "user" | "model";
//      parts: [{ text: string }];
//      // Không cần trường 'type' ở đây nữa
// }

// export type ApiChatHistory = ApiHistoryItem[];

// // --- END: Simplified History Item Type for API ---


// // --- BEGIN: Updated sendNonStreamChatRequest Function ---
// export const sendNonStreamChatRequest = async (
//     userInput: string,
//     history: ApiHistoryItem[],
//     onStatusUpdate: (update: StatusUpdate) => void,
//     onResult: (result: ResultUpdate) => void,
//     onError: (error: ErrorUpdate | { message: string; status?: number }) => void, // Allow status code
//     onClose: () => void // Called when stream definitively closes (success, error, abort)
// ): () => void { // Returns an abort function

//     const endpoint = `${API_BASE_URL}/stream-chat`;
//     const controller = new AbortController();
//     const { signal } = controller; // Get signal reference

//     // Flag to ensure onClose is called only once
//     let closed = false;
//     const ensureCloseCalled = () => {
//         if (!closed) {
//             closed = true;
//             console.log("ensureCloseCalled: Invoking onClose callback.");
//             onClose();
//         } else {
//              console.log("ensureCloseCalled: onClose callback already invoked.");
//         }
//     };

//     const processStream = async (response: Response): Promise<void> => {
//         if (!response.body) {
//             throw new Error("Response body is null. Cannot process stream.");
//         }

//         const reader = response.body.getReader();
//         const decoder = new TextDecoder();
//         let buffer = '';
//         let loopCounter = 0; // Debugging counter

//         try {
//             console.log("Stream processing loop started.");
//             while (true) {
//                 // Check if the request was aborted *before* reading
//                 if (signal.aborted) {
//                     console.log("Stream processing loop: Abort detected before read.");
//                     throw new DOMException('Aborted by client before read', 'AbortError');
//                 }

//                 loopCounter++;
//                 console.log(`Stream processing loop iteration: ${loopCounter}`);
//                 const { done, value } = await reader.read();

//                 if (done) {
//                     console.log("Stream processing loop: reader.read() returned done: true.");
//                     if (buffer.trim()) {
//                         console.warn("Stream ended but buffer still contained unprocessed data:", buffer);
//                         // Decide if this indicates an error based on your protocol.
//                         // It might mean the server sent an incomplete message before closing.
//                         // onError({ message: "Stream closed with partial data remaining." });
//                     }
//                     // Normal closure path
//                     ensureCloseCalled();
//                     return; // Exit the loop and function
//                 }

//                 // Decode chunk and add to buffer
//                  const chunk = decoder.decode(value, { stream: true });
//                  console.log(`Stream processing loop: Received chunk (${chunk.length} chars):`, chunk.length < 200 ? chunk : chunk.substring(0, 200) + '...'); // Log chunk (truncated if large)
//                  buffer += chunk;


//                 // Process buffer line by line (SSE messages end with \n\n)
//                 let boundary = buffer.indexOf('\n\n');
//                 while (boundary >= 0) {
//                     const messageSegment = buffer.substring(0, boundary);
//                     buffer = buffer.substring(boundary + 2); // Move past the processed message + \n\n

//                     console.log("Stream processing loop: Processing message segment:", messageSegment);

//                     // Handle multi-line messages (e.g., id, event, data) - Simple parsing for 'data:'
//                     const lines = messageSegment.split('\n');
//                     let dataPayload = '';
//                     // let eventType = 'message'; // Default SSE event type
//                     // let messageId = null;

//                     lines.forEach(line => {
//                         if (line.startsWith('data:')) {
//                             dataPayload += line.substring(5).trimStart(); // Append data, trim leading space
//                         }
//                         // else if (line.startsWith('event:')) {
//                         //     eventType = line.substring(6).trim();
//                         // } else if (line.startsWith('id:')) {
//                         //     messageId = line.substring(3).trim();
//                         // }
//                          else if (line.startsWith(':')) {
//                              // console.log("SSE Comment:", line.substring(1).trim()); // Optional: log comments
//                          } else if (line.trim()) {
//                             console.warn("Received unexpected SSE line content:", line);
//                          }
//                     });


//                     if (dataPayload) {
//                         console.log("Stream processing loop: Extracted data payload:", dataPayload);
//                         try {
//                             const parsedData = JSON.parse(dataPayload) as StreamMessage; // Assert type or validate further
//                             // Dispatch based on type using type guards
//                             if (isStatusUpdate(parsedData)) {
//                                 onStatusUpdate(parsedData);
//                             } else if (isResultUpdate(parsedData)) {
//                                 onResult(parsedData);
//                             } else if (isErrorUpdate(parsedData)) {
//                                 onError(parsedData);
//                                 // Consider if receiving an error message means the stream will end.
//                                 // Backend should ideally close stream after sending type: 'error'.
//                             } else {
//                                 console.warn("Received unknown message type:", parsedData);
//                             }
//                         } catch (e: any) {
//                             console.error("Failed to parse SSE JSON data:", dataPayload, e);
//                             onError({ message: `Failed to parse message from server: ${e.message}` });
//                             // Decide if parsing error should abort the stream
//                             // controller.abort(); // This would trigger AbortError below
//                         }
//                     } else {
//                         // Log if a message segment didn't contain a 'data:' line
//                         console.log("Stream processing loop: Message segment did not contain 'data:'.");
//                     }

//                     // Check for the next message boundary in the updated buffer
//                     boundary = buffer.indexOf('\n\n');
//                 }
//             }
//         } catch (streamError: any) {
//             // Catch errors during reader.read(), decoder.decode(), or manual AbortError throw
//             if (streamError.name === 'AbortError') {
//                 // This block will now catch aborts triggered *during* the loop or *before* read
//                 console.log('Stream processing loop: AbortError caught.');
//                 // Do not call onError for intentional aborts.
//                  ensureCloseCalled(); // Signal closure due to abort.
//             } else {
//                 // Handle other stream processing errors (network, decoding etc.)
//                 console.error('Error reading or decoding stream:', streamError);
//                 onError({ message: streamError.message || "Error processing stream data." });
//                  ensureCloseCalled(); // Ensure close is called on unexpected stream error
//             }
//         } finally {
//              // Release lock? Usually not needed with await reader.read() loop style.
//              // reader.releaseLock();
//              console.log("Exiting stream processing loop.");
//         }
//     };

//     // --- Initiate Fetch Request ---
//     console.log(`Initiating fetch request to ${endpoint}...`);
//     fetch(endpoint, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'Accept': 'text/event-stream', // Crucial for SSE
//         },
//         body: JSON.stringify({ userInput, history }),
//         signal: signal, // Link AbortController
//         keepalive: false, // Set keepalive to false unless you have specific reasons for it with SSE fetch
//                           // It's more relevant for sending data on page unload. Default is usually fine.
//     })
//     .then(async (response) => {
//         console.log(`Fetch response received. Status: ${response.status}`);
//         // Handle HTTP errors *before* trying to process stream
//         if (!response.ok) {
//             let errorMsg = `HTTP error! Status: ${response.status} ${response.statusText}`;
//             let errorDetails = null;
//             let responseText = ''; // Store raw text for logging
//             try {
//                 responseText = await response.text(); // Read body as text first
//                 console.log("Raw error response body:", responseText);
//                 // Attempt to parse as JSON *after* reading as text
//                 errorDetails = JSON.parse(responseText);
//                 errorMsg = errorDetails.message || errorDetails.error || errorMsg;
//             } catch (e) {
//                 console.warn("Could not parse error response body as JSON. Using text.", e);
//                 errorMsg += `\nResponse body: ${responseText.substring(0, 200)}...`; // Add snippet
//             }
//             const errorToThrow = new Error(errorMsg);
//             (errorToThrow as any).details = errorDetails; // Attach details if parsed
//             (errorToThrow as any).status = response.status; // Attach status code
//             throw errorToThrow; // Throw to be caught by the .catch block
//         }

//         // Response is OK (e.g., 200), start processing the stream
//         console.log("Fetch response OK. Starting stream processing...");
//         await processStream(response);
//         console.log("processStream finished.");

//     })
//     .catch((error) => {
//         // Catches:
//         // 1. Initial fetch network errors (DNS, connection refused etc.)
//         // 2. Errors thrown from !response.ok check
//         // 3. AbortError when controller.abort() is called (if not caught inside processStream's catch)
//         // 4. Other unexpected errors during fetch setup.

//         if (error.name === 'AbortError') {
//             // Catch AbortError if it wasn't caught inside processStream (e.g., abort before fetch starts)
//             console.log('Fetch caught AbortError.');
//             ensureCloseCalled(); // Signal closure due to abort.
//         } else {
//             console.error('SSE Fetch/Setup Error:', error);
//             // Provide structured error if possible
//             const errPayload: { message: string; status?: number } = {
//                  message: error.message || "An unexpected connection or setup error occurred."
//              };
//              if (error.status) { // Add status if available from HTTP error
//                  errPayload.status = error.status;
//              }
//             onError(errPayload);
//             ensureCloseCalled(); // Ensure close is always called on unexpected errors.
//         }
//     });

//     // --- Return the Abort Function ---
//     console.log("Returning abort function from sendStreamChatRequest.");
//     return () => {
//         // Check if already aborted before logging/aborting
//         if (!signal.aborted) {
//              console.log("Client calling abort function...");
//              controller.abort();
//              // Note: Calling abort() might not immediately trigger the 'AbortError' catch blocks.
//              // The browser cancels the underlying network request. The promise rejection
//              // might happen slightly later when an operation (like reader.read()) fails due to the cancellation.
//         } else {
//              console.log("Client calling abort function, but request was already aborted.");
//         }
//     };
// }