
// src/shared/types.ts
import { FunctionCall, Part } from "@google/generative-ai"; // Import necessary types

// Ensure HistoryItem part can hold various types
export interface HistoryItem {
    role: "user" | "model" | "function"; // Add 'function' role
    parts: Part[]; // Use the SDK's Part type directly
    // Removed 'type' field if it was specific to your old structure
}

// ChatResponse might just return the final outcome
export interface ChatResponse {
    type: "text" | "error";
    message: string;
    thought?: string; // Optional field for internal reasoning/steps
}

export interface ChatUpdate {
    type: 'partial_result'; // Hoặc 'chat_update' tùy bạn đặt tên event
    textChunk: string;
    // Tùy chọn: Gửi toàn bộ text nếu client muốn xử lý kiểu đó
    // fullText?: string;
}

// You might want an intermediate response type if handleUserInput needs more info
export interface GeminiInteractionResult {
    status: "requires_function_call" | "final_text" | "error";
    functionCall?: FunctionCall; // Present if status is 'requires_function_call'
    text?: string; // Present if status is 'final_text'
    errorMessage?: string; // Present if status is 'error'
}

// Define the structure for a single step in the thought process
export interface ThoughtStep {
    step: string;       // The identifier (e.g., 'thinking', 'function_call')
    message: string;    // The descriptive message for that step
    timestamp: string;  // ISO timestamp when the step occurred
    details?: any;      // Optional: Any extra data (like function args)
    agentId?: AgentId; // <<< THÊM HOẶC ĐẢM BẢO CÓ TRƯỜNG NÀY

}


export type AgentId = 'HostAgent' | 'ConferenceAgent' | 'JournalAgent' | 'AdminContactAgent' | 'NavigationAgent' | 'WebsiteInfoAgent' | string; // Allow string for flexibility if needed


export interface StatusUpdate {
    type: 'status';
    step: string;
    message: string;
    details?: any; // Optional details relevant to the step (e.g., function name/args)
    thoughts?: ThoughtStep[]; // Add the thought process history
    agentId?: AgentId; // <<< THÊM DÒNG NÀY
}

// --- Define Action Types ---
export interface NavigationAction {
    type: 'navigate';
    url: string; // The URL (internal path or full external URL)
}

// <<< NEW: Define OpenMapAction >>>
export interface OpenMapAction {
    type: 'openMap';
    location: string; // The location string to search on Google Maps
}

// --- ResultUpdate (No change needed here, already has optional 'action') ---
export interface ResultUpdate {
    type: 'result';
    message: string; // The text message to display
    thoughts?: ThoughtStep[];
    action?: FrontendAction; // Now includes NavigationAction or OpenMapAction
}


export interface ErrorUpdate {
    type: 'error' | 'warning'; // Có thể là 'error' hoặc 'warning'
    message: string;
    step?: string;          // Bước trong quy trình server gây ra lỗi
    code?: string;          // Mã lỗi cụ thể từ server (ví dụ: 'AUTH_REQUIRED', 'CONVERSATION_NOT_FOUND')
    details?: any;          // Thông tin chi tiết thêm về lỗi (ví dụ: { conversationId: 'xyz' })
    thoughts?: ThoughtStep[]; // Lịch sử "suy nghĩ" dẫn đến lỗi
    // `thought?: string;` có thể được loại bỏ nếu `thoughts?: ThoughtStep[]` đã bao hàm ý nghĩa của nó
}




export type MessageType = 'text' | 'error' | 'warning' | 'map' | undefined; // <<< Add 'map'

export interface ChatMessageType {
    id: string;
    message: string; // Can be used as a label for the map or fallback text
    isUser: boolean;
    type: MessageType; // <<< Use the updated type
    thoughts?: ThoughtStep[];
    location?: string; // <<< ADDED: Optional location for map messages
    timestamp?: string;
      action?: FrontendAction; // <<<< THÊM DÒNG NÀY

}


export interface LoadingState {
    isLoading: boolean;
    step: string;
    message: string;
    agentId?: string;
}





// Payload for the confirmation action from backend
export interface ConfirmSendEmailAction {
    confirmationId: string;
    subject: string;
    requestType: 'contact' | 'report';
    message: string;
    timeoutMs: number;
}

// Add to FrontendAction union type
// Add the new action type to your FrontendAction union type
export type FrontendAction =
    | { type: 'navigate'; url: string }
    | { type: 'openMap'; location: string }
    | { type: 'confirmEmailSend'; payload: ConfirmSendEmailAction } // <-- Add this
    // | { type: 'otherAction'; ... } // Add other existing actions
    | undefined; // Keep undefined if it's used


// Type for the result event from backend after confirmation/cancellation/timeout
export interface EmailConfirmationResult {
    confirmationId: string;
    status: 'success' | 'cancelled' | 'timedout' | 'error';
    message: string; // Message from backend explaining the outcome
}

// Update ResultUpdate if action is part of it
export interface ResultUpdate {
    type: 'result';
    message: string; // Can be null if only action is present
    thoughts?: ThoughtStep[];
    action?: FrontendAction; // Ensure this includes the new type
}


export interface InitialHistoryPayload {
    conversationId: string;
    messages: ChatMessageType[]; // Nhận luôn định dạng frontend
}


/**
 * Payload for the result of a confirmation action (sent FROM backend TO frontend).
 * Informs the client about the outcome of a 'confirmEmailSend' or similar action.
 */
export interface ConfirmationResultPayload {
    confirmationId: string; // The ID of the original confirmation request
    status:
    | 'confirmed'      // User confirmed, action likely succeeded (e.g., email sent)
    | 'cancelled'      // User cancelled the action
    | 'timeout'        // The confirmation request timed out before user interaction
    | 'not_found'      // The confirmation ID was not found (already processed or invalid)
    | 'failed'         // User confirmed, but the action failed (e.g., email sending error)
    | 'unauthorized'   // The user trying to confirm/cancel was not the original requester
    | 'error';         // Generic error processing the confirmation/cancellation
    message: string;       // A user-friendly message describing the outcome
    details?: any;         // Optional: Additional details (e.g., error specifics if status is 'failed' or 'error')
}



export type ChatMode = 'live' | 'regular';
export type LanguageCode = 'en' | 'vi' | 'zh';

export interface LanguageOption {
    code: LanguageCode;
    name: string;
    flagCode: string;
}



// --- Payload Types for New Events ---
export interface ConversationDeletedPayload {
    conversationId: string;
}

export interface ConversationClearedPayload {
    conversationId: string;
}
export interface ConversationRenamedPayload {
    conversationId: string;
    newTitle: string; // Tiêu đề đã được chuẩn hóa bởi backend
}

export interface ConversationPinStatusChangedPayload {
    conversationId: string;
    isPinned: boolean;
}

// --- Payload Types for Emitting New Events to Backend ---
export interface RenameConversationClientData {
    conversationId: string;
    newTitle: string;
}

export interface PinConversationClientData {
    conversationId: string;
    isPinned: boolean;
}

export interface SearchConversationsClientData {
    searchTerm: string;
    limit?: number;
}

// --- Conversation Metadata (đảm bảo có các trường cần thiết) ---
// Nếu bạn đã có ClientConversationMetadata, hãy đảm bảo nó có các trường này
export interface ConversationMetadata { // Hoặc ClientConversationMetadata
    id: string;
    title: string;       // Sẽ là customTitle nếu có, nếu không là auto-generated
    lastActivity: string | Date;  // Hoặc string nếu bạn parse ở client
    isPinned: boolean;
    // customTitle?: string; // Tùy chọn: Client có thể muốn biết đây là custom title hay không
    // snippet?: string; // Cho kết quả tìm kiếm
}

// --- Payload cho sự kiện kết quả tìm kiếm từ backend ---
// Backend trả về một mảng ConversationMetadata
// export type ConversationSearchResultsPayload = ConversationMetadata[];
// Không cần type riêng, vì nó là mảng ConversationMetadata