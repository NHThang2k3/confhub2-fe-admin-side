

// // src/app/[locale]/chatbot/stores/chatStore.ts
// import { create } from 'zustand';
// import { useCallback } from 'react'; // Thêm import này
// import { useShallow } from 'zustand/react/shallow'; // Import useShallow

// import { persist, createJSONStorage, devtools } from 'zustand/middleware';
// import { Socket } from 'socket.io-client';
// import {
//     ChatMessageType, LoadingState, ConversationMetadata, ConfirmSendEmailAction,
//     ErrorUpdate, ThoughtStep, StatusUpdate, ChatUpdate, ResultUpdate,
//     InitialHistoryPayload, ConversationDeletedPayload, ConversationClearedPayload,
//     ConversationRenamedPayload, ConversationPinStatusChangedPayload, EmailConfirmationResult
// } from '@/src/app/[locale]/chatbot/lib/regular-chat.types'; // Điều chỉnh path nếu cần

// // Types bạn cung cấp cho Language và ChatMode
// export type LanguageCode = 'en' | 'vi' | 'zh'; // Đổi tên từ Language để tránh trùng với interface Language
// export type ChatMode = 'live' | 'regular';
// export interface LanguageOption {
//     code: LanguageCode;
//     name: string;
//     flagCode: string; // Giữ lại flagCode nếu bạn dùng để hiển thị cờ
//     // Thêm value nếu cần thiết để khớp với cấu trúc Language trong ChatSettingsContext cũ
//     // value: { code: LanguageCode; name: string; } // Ví dụ
// }

// import { StreamingTextAnimationControls } from '@/src/hooks/chatbot/useStreamingTextAnimation'; // Đường dẫn đúng
// import { generateMessageId, constructNavigationUrl, openUrlInNewTab } from '@/src/app/[locale]/chatbot/utils/chatUtils';
// import { appConfig } from '@/src/middleware';
// import {
//     IS_STREAMING_ENABLED_DEFAULT,
//     DEFAULT_LANGUAGE_REGULAR_CHAT, // Cần tạo constant này
//     AVAILABLE_LANGUAGES_REGULAR_CHAT // Cần tạo constant này
// } from '@/src/app/[locale]/chatbot/lib/constants';

// const BASE_WEB_URL = appConfig.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:8386";

// // --- Types for Store State ---
// export interface ChatStoreState {
//     // Core Chat State
//     chatMessages: ChatMessageType[];
//     loadingState: LoadingState;
//     hasFatalError: boolean;
//     isHistoryLoaded: boolean;
//     isLoadingHistory: boolean;
//     showConfirmationDialog: boolean;
//     confirmationData: ConfirmSendEmailAction | null;
//     conversationList: ConversationMetadata[];
//     activeConversationId: string | null;
//     authToken: string | null | undefined;
//     searchResults: ConversationMetadata[];
//     isSearching: boolean;
//     isServerReadyForCommands: boolean;

//     // Socket Connection State
//     isConnected: boolean;
//     socketId: string | null;
//     socketRef: React.MutableRefObject<Socket | null>; // Không persist

//     // Chat Settings State (chung và cho regular chat)
//     chatMode: ChatMode; // 'live' | 'regular'
//     currentLocale: string; // Locale của app (ví dụ: 'en', 'vi' từ URL)
//     isStreamingEnabled: boolean; // Chỉ cho regular chat
//     currentLanguage: LanguageOption; // Ngôn ngữ hiện tại cho chatbot (dùng chung)
//     availableLanguages: LanguageOption[]; // Danh sách ngôn ngữ (dùng chung)

//     // UI State
//     currentView: 'chat' | 'history'; // Có thể không cần nếu UI đơn giản
//     isLeftPanelOpen: boolean;
//     isRightPanelOpen: boolean;

//     // Streaming Animation
//     animationControls: StreamingTextAnimationControls | null; // Không persist
//     isAwaitingFinalResultRef: React.MutableRefObject<boolean>; // Không persist

// }

// // --- Types for Store Actions ---
// export interface ChatStoreActions {
//     // Setters
//     setChatMessages: (updater: (prev: ChatMessageType[]) => ChatMessageType[]) => void;
//     addChatMessage: (message: ChatMessageType) => void;
//     updateMessageById: (messageId: string, updates: Partial<ChatMessageType> | ((prev: ChatMessageType) => Partial<ChatMessageType>)) => void;
//     setLoadingState: (loadingState: LoadingState) => void;
//     setHasFatalError: (hasError: boolean) => void;
//     setIsHistoryLoaded: (isLoaded: boolean) => void;
//     setIsLoadingHistory: (isLoading: boolean) => void;
//     setShowConfirmationDialog: (show: boolean, data?: ConfirmSendEmailAction | null) => void;
//     setConversationList: (updater: (prev: ConversationMetadata[]) => ConversationMetadata[]) => void;
//     setActiveConversationId: (id: string | null, options?: { fromUrl?: boolean }) => void;
//     setAuthToken: (token: string | null | undefined) => void;
//     setSearchResults: (results: ConversationMetadata[]) => void;
//     setIsSearching: (isSearching: boolean) => void;
//     setIsServerReadyForCommands: (isReady: boolean) => void;
//     setIsConnected: (status: boolean, socketId?: string | null) => void;
//     setSocketInstance: (socket: Socket | null) => void;
//     setChatMode: (mode: ChatMode) => void; // UI sẽ gọi action này và thực hiện navigate
//     setCurrentLocale: (locale: string) => void;
//     setIsStreamingEnabled: (enabled: boolean) => void;
//     setCurrentLanguage: (language: LanguageOption) => void;
//     setCurrentView: (view: 'chat' | 'history') => void;
//     toggleLeftPanel: () => void;
//     setRightPanelOpen: (isOpen: boolean) => void;
//     setAnimationControls: (controls: StreamingTextAnimationControls) => void;
//     resetAwaitFlag: () => void;

//     // Complex Actions
//     initializeAuthAndSettings: () => void;
//     handleError: (
//         error: ErrorUpdate | { message: string; type?: 'error' | 'warning'; thoughts?: ThoughtStep[]; code?: string; step?: string; details?: any } | Error,
//         stopLoading?: boolean,
//         isFatal?: boolean
//     ) => void;
//     sendMessage: (userInput: string) => void; // Không cần isStreaming, language nữa
//     loadConversation: (conversationId: string, options?: { isFromUrl?: boolean }) => void;
//     startNewConversation: () => void;
//     handleConfirmSend: (confirmationId: string) => void;
//     handleCancelSend: (confirmationId: string) => void;
//     deleteConversation: (conversationId: string) => Promise<void>;
//     clearConversation: (conversationId: string) => void;
//     renameConversation: (conversationId: string, newTitle: string) => void;
//     pinConversation: (conversationId: string, isPinned: boolean) => void;
//     searchConversations: (searchTerm: string) => void;
//     resetChatUIForNewConversation: (clearActiveId?: boolean) => void;

//     // Socket Event Handlers (internal)
//     _onSocketConnect: (socketId: string) => void;
//     _onSocketDisconnect: (reason: Socket.DisconnectReason) => void;
//     _onSocketConnectError: (error: Error) => void;
//     _onSocketAuthError: (error: { message: string }) => void;
//     _onSocketStatusUpdate: (data: StatusUpdate) => void;
//     _onSocketChatUpdate: (data: ChatUpdate) => void;
//     _onSocketChatResult: (data: ResultUpdate) => void;
//     _onSocketChatError: (errorData: ErrorUpdate) => void;
//     _onSocketEmailConfirmationResult: (result: EmailConfirmationResult) => void;
//     _onSocketConversationList: (list: ConversationMetadata[]) => void;
//     _onSocketInitialHistory: (payload: InitialHistoryPayload) => void;
//     _onSocketNewConversationStarted: (payload: { conversationId: string; title?: string; lastActivity?: string; isPinned?: boolean; }) => void;
//     _onSocketConversationDeleted: (payload: ConversationDeletedPayload) => void;
//     _onSocketConversationCleared: (payload: ConversationClearedPayload) => void;
//     _onSocketConversationRenamed: (payload: ConversationRenamedPayload) => void;
//     _onSocketConversationPinStatusChanged: (payload: ConversationPinStatusChangedPayload) => void;
//     _onSocketConnectionReady: (payload: { userId: string, email: string }) => void;

// }

// const initialChatStoreState: ChatStoreState = {
//     chatMessages: [],
//     loadingState: { isLoading: false, step: '', message: '' },
//     hasFatalError: false,
//     isHistoryLoaded: false,
//     isLoadingHistory: false,
//     showConfirmationDialog: false,
//     confirmationData: null,
//     conversationList: [],
//     activeConversationId: null,
//     authToken: undefined,
//     searchResults: [],
//     isSearching: false,
//     isServerReadyForCommands: false,
//     isConnected: false,
//     socketId: null,
//     socketRef: { current: null },
//     chatMode: 'regular', // Mặc định là regular
//     currentLocale: 'en', // Sẽ được ghi đè bởi AppWideInitializers hoặc MainLayout
//     isStreamingEnabled: IS_STREAMING_ENABLED_DEFAULT,
//     currentLanguage: DEFAULT_LANGUAGE_REGULAR_CHAT, // Sử dụng constant mới
//     availableLanguages: AVAILABLE_LANGUAGES_REGULAR_CHAT, // Sử dụng constant mới
//     currentView: 'chat',
//     isLeftPanelOpen: true, // Hoặc false tùy theo thiết kế mặc định
//     isRightPanelOpen: false,
//     animationControls: null,
//     isAwaitingFinalResultRef: { current: false },
// };

// export const useChatStore = create<ChatStoreState & ChatStoreActions>()(
//     devtools(
//         persist(
//             (set, get) => ({
//                 ...initialChatStoreState,

//                 // --- Setters ---
//                 setChatMessages: (updater) => set((state) => ({ chatMessages: updater(state.chatMessages) }), false, 'setChatMessages'),
//                 addChatMessage: (message) => set((state) => ({ chatMessages: [...state.chatMessages, message] }), false, 'addChatMessage'),
//                 updateMessageById: (messageId, updates) => set(state => ({
//                     chatMessages: state.chatMessages.map(msg =>
//                         msg.id === messageId
//                             ? { ...msg, ...(typeof updates === 'function' ? updates(msg) : updates) }
//                             : msg
//                     )
//                 }), false, `updateMessageById/${messageId}`),
//                 setLoadingState: (loadingState) => set({ loadingState }, false, 'setLoadingState'),
//                 setHasFatalError: (hasError) => set({ hasFatalError: hasError }, false, 'setHasFatalError'),
//                 setIsHistoryLoaded: (isLoaded) => set({ isHistoryLoaded: isLoaded }, false, 'setIsHistoryLoaded'),
//                 setIsLoadingHistory: (isLoading) => set({ isLoadingHistory: isLoading }, false, 'setIsLoadingHistory'),
//                 setShowConfirmationDialog: (show, data = null) => set({ showConfirmationDialog: show, confirmationData: data }, false, 'setShowConfirmationDialog'),
//                 setConversationList: (updater) => set(state => ({ conversationList: updater(state.conversationList) }), false, 'setConversationList'),
//                 setActiveConversationId: (id, options) => {
//                     const oldId = get().activeConversationId;
//                     if (oldId === id && !options?.fromUrl) {
//                         console.log(`[ChatStore] setActiveConversationId: already active ${id}, not from URL. No state change needed for activeId.`);
//                         return;
//                     }
//                     console.log(`[ChatStore] setActiveConversationId: ${id}`, options);
//                     set({ activeConversationId: id }, false, `setActiveConversationId/${id}`);
//                     if (id && !options?.fromUrl) {
//                         get().resetChatUIForNewConversation(false);
//                         set({ isHistoryLoaded: false });
//                     } else if (!id) {
//                         get().resetChatUIForNewConversation(true);
//                     }
//                 },
//                 setAuthToken: (token) => set({ authToken: token }, false, 'setAuthToken'),
//                 setSearchResults: (results) => set({ searchResults: results }, false, 'setSearchResults'),
//                 setIsSearching: (isSearching) => set({ isSearching: isSearching }, false, 'setIsSearching'),
//                 setIsServerReadyForCommands: (isReady) => set({ isServerReadyForCommands: isReady }, false, 'setIsServerReadyForCommands'),
//                 setIsConnected: (status, socketId = null) => set({ isConnected: status, socketId: status ? socketId : null }, false, 'setIsConnected'),
//                 setSocketInstance: (socket) => {
//                     const currentStoreSocketRef = get().socketRef; // Lấy ref từ store
//                     currentStoreSocketRef.current = socket; // Chỉ cập nhật .current
//                     // KHÔNG set lại socketRef vào state ở đây:
//                     // set({ socketRef: { ...currentStoreSocketRef } }, false, 'setSocketInstance');
//                     // Nếu bạn thực sự cần một cách để biết socket instance đã thay đổi (hiếm khi),
//                     // bạn có thể thêm một state boolean riêng, ví dụ: `socketInstanceChangedToggle` và đảo giá trị của nó.
//                     // Nhưng thường thì không cần thiết.
//                     console.log('[ChatStore] setSocketInstance called. New socket.current set.', socket ? socket.id : null);
//                 },
//                 setChatMode: (mode) => {
//                     if (get().chatMode === mode) return;
//                     set({ chatMode: mode }, false, `setChatMode/${mode}`);
//                     // Component sẽ chịu trách nhiệm điều hướng (router.push)
//                     // Và có thể gọi startNewConversation nếu cần thiết sau khi điều hướng
//                     if (mode === 'regular' && get().activeConversationId === null) {
//                         // Nếu chuyển sang regular và chưa có active conv, có thể tự động start new
//                         // get().startNewConversation(); // Cân nhắc logic này
//                     } else if (mode === 'live') {
//                         // Logic riêng cho live chat khi chuyển mode
//                         get().resetChatUIForNewConversation(true); // Reset UI regular chat
//                     }
//                 },
//                 setCurrentLocale: (locale) => set({ currentLocale: locale }, false, 'setCurrentLocale'),
//                 setIsStreamingEnabled: (enabled) => set({ isStreamingEnabled: enabled }, false, 'setIsStreamingEnabled'),
//                 setCurrentLanguage: (language) => set({ currentLanguage: language }, false, 'setCurrentLanguage'),
//                 setCurrentView: (view) => {
//                     if (get().currentView === view) return;
//                     set({ currentView: view }, false, `setCurrentView/${view}`);
//                 },
//                 toggleLeftPanel: () => set(state => ({ isLeftPanelOpen: !state.isLeftPanelOpen }), false, 'toggleLeftPanel'),
//                 setRightPanelOpen: (isOpen) => set({ isRightPanelOpen: isOpen }, false, 'setRightPanelOpen'),
//                 setAnimationControls: (controls) => set({ animationControls: controls }, false, 'setAnimationControls'),
//                 resetAwaitFlag: () => { get().isAwaitingFinalResultRef.current = false; },

//                 // --- Complex Actions ---
//                 initializeAuthAndSettings: () => {
//                     if (typeof window !== 'undefined') {
//                         const storedToken = localStorage.getItem('token');
//                         set({ authToken: storedToken, hasFatalError: false });
//                         console.log(`[ChatStore] Auth token from localStorage: ${storedToken ? 'loaded' : 'not found'}`);
//                         // Các settings khác như currentLanguage, isStreamingEnabled sẽ được persist middleware tự động load
//                     }
//                 },
//                 handleError: (errorInput, stopLoading = true, isFatal = false) => {
//                     console.error("Chat Error/Warning (Store):", errorInput);
//                     get().animationControls?.stopStreaming();
//                     get().resetAwaitFlag();

//                     let finalError: Pick<ErrorUpdate, 'message' | 'thoughts' | 'step' | 'code' | 'details'> & { errorType: 'error' | 'warning' } = {
//                         message: 'An unknown error occurred.',
//                         errorType: 'error',
//                     };

//                     if (errorInput instanceof Error) {
//                         finalError.message = errorInput.message;
//                     } else if (typeof errorInput === 'object' && errorInput !== null) {
//                         if ('type' in errorInput && (errorInput.type === 'error' || errorInput.type === 'warning')) { // Chấp nhận cả warning
//                             const errUpdate = errorInput as ErrorUpdate; // Hoặc { message, type, ... }
//                             finalError.message = errUpdate.message;
//                             finalError.thoughts = errUpdate.thoughts;
//                             finalError.step = errUpdate.step;
//                             finalError.code = errUpdate.code;
//                             finalError.details = errUpdate.details;
//                             finalError.errorType = errorInput.type === 'warning' ? 'warning' : 'error';
//                         } else if ('message' in errorInput) {
//                             const customErr = errorInput as { message: string; type?: 'error' | 'warning'; thoughts?: ThoughtStep[]; code?: string; step?: string; details?: any };
//                             finalError.message = customErr.message;
//                             finalError.errorType = customErr.type || 'error';
//                             finalError.thoughts = customErr.thoughts;
//                             finalError.step = customErr.step;
//                             finalError.code = customErr.code;
//                             finalError.details = customErr.details;
//                         }
//                     }

//                     if (stopLoading) {
//                         set({ loadingState: { isLoading: false, step: 'error', message: finalError.errorType === 'error' ? 'Error' : 'Warning' } }, false, 'handleError/setLoadingState');
//                     }

//                     const botMessage: ChatMessageType = {
//                         id: generateMessageId(),
//                         message: finalError.message,
//                         isUser: false,
//                         type: finalError.errorType,
//                         thoughts: finalError.thoughts,
//                         timestamp: new Date().toISOString(),
//                     };
//                     get().addChatMessage(botMessage);

//                     if (isFatal || finalError.code === 'FATAL_SERVER_ERROR' || finalError.code === 'AUTH_REQUIRED' || finalError.code === 'ACCESS_DENIED') {
//                         console.warn(`[ChatStore] Fatal error detected (${finalError.message}, code: ${finalError.code}). Setting fatal error flag.`);
//                         set({ hasFatalError: true, isConnected: false, isServerReadyForCommands: false }, false, 'handleError/setFatal');
//                     }
//                 },
//                 resetChatUIForNewConversation: (clearActiveId = true) => {
//                     set(state => ({
//                         chatMessages: [],
//                         activeConversationId: clearActiveId ? null : state.activeConversationId,
//                         isHistoryLoaded: clearActiveId ? false : true,
//                         loadingState: { isLoading: false, step: 'idle', message: '' },
//                         showConfirmationDialog: false,
//                         confirmationData: null,
//                     }), false, 'resetChatUIForNewConversation');
//                     get().animationControls?.stopStreaming();
//                     get().resetAwaitFlag();
//                 },
//                 sendMessage: (userInput) => { // Tham số isStreaming, language đã được bỏ
//                     const {
//                         socketRef, isConnected, isServerReadyForCommands, hasFatalError,
//                         addChatMessage, setLoadingState, animationControls, activeConversationId,
//                         handleError: storeHandleError, resetAwaitFlag,
//                         isStreamingEnabled, // Lấy từ state của store
//                         currentLanguage     // Lấy từ state của store
//                     } = get();
//                     const trimmedMessage = userInput.trim();
//                     if (!trimmedMessage) return;

//                     if (hasFatalError) {
//                         storeHandleError({ message: "Cannot send message: A critical connection error occurred.", type: 'error' }, false, false);
//                         return;
//                     }
//                     if (!socketRef.current || !isConnected || !isServerReadyForCommands) {
//                         storeHandleError({ message: "Cannot send message: Not connected or server not ready.", type: 'error' }, false, false);
//                         return;
//                     }

//                     animationControls?.stopStreaming();
//                     resetAwaitFlag();
//                     setLoadingState({ isLoading: true, step: 'sending', message: 'Sending...' });

//                     const newUserMessage: ChatMessageType = {
//                         id: generateMessageId(), message: trimmedMessage, isUser: true, type: 'text', timestamp: new Date().toISOString(),
//                     };
//                     addChatMessage(newUserMessage);

//                     console.log(`[ChatStore] Emitting 'send_message'. ActiveConvID: ${activeConversationId}. Lang: ${currentLanguage.code}, Stream: ${isStreamingEnabled}. Socket ID: ${socketRef.current?.id}`);
//                     socketRef.current.emit('send_message', {
//                         userInput: trimmedMessage,
//                         isStreaming: isStreamingEnabled,
//                         language: currentLanguage.code, // Sử dụng LanguageCode
//                     });
//                 },
//                 loadConversation: (conversationId, options) => {
//                     const { socketRef, isConnected, activeConversationId: currentActiveId, isHistoryLoaded: currentHistoryLoaded, handleError: storeHandleError, setIsLoadingHistory, setChatMessages: storeSetMessages, setIsHistoryLoaded: setStoreHistoryLoaded, setLoadingState: storeSetLoading, setActiveConversationId: setStoreActiveId } = get();
//                     if (!socketRef.current || !isConnected) {
//                         storeHandleError({ message: 'Cannot load conversation: Not connected.', type: 'error' }, false, false);
//                         return;
//                     }
//                     if (!conversationId) {
//                         console.warn("[ChatStore] Attempted to load conversation with invalid ID.");
//                         return;
//                     }
//                     if (conversationId === currentActiveId && currentHistoryLoaded && !options?.isFromUrl) {
//                         console.log(`[ChatStore] Conversation ${conversationId} is already active and loaded.`);
//                         storeSetLoading({ isLoading: false, step: 'history_loaded', message: '' });
//                         setIsLoadingHistory(false);
//                         return;
//                     }

//                     console.log(`[ChatStore] Requesting to load conversation ID: ${conversationId}`);
//                     setIsLoadingHistory(true);
//                     if (!options?.isFromUrl) {
//                         storeSetMessages(() => []);
//                     }
//                     setStoreHistoryLoaded(false);
//                     setStoreActiveId(conversationId, { fromUrl: options?.isFromUrl });
//                     storeSetLoading({ isLoading: true, step: 'loading_history', message: 'Loading history...' });
//                     socketRef.current.emit('load_conversation', { conversationId });
//                 },
//                 startNewConversation: () => {
//                     const { socketRef, isConnected, isServerReadyForCommands, handleError: storeHandleError, resetChatUIForNewConversation: storeResetUI, setLoadingState: storeSetLoading } = get();
//                     if (!isConnected || !isServerReadyForCommands) {
//                         storeHandleError({ message: 'Cannot start new conversation: Not connected or server not ready.' });
//                         return;
//                     }
//                     if (!socketRef.current) {
//                         storeHandleError({ message: 'Cannot start new conversation: Socket not available.' });
//                         return;
//                     }
//                     console.log('[ChatStore] STARTING NEW CONVERSATION (explicit).');
//                     storeResetUI(true);
//                     storeSetLoading({ isLoading: true, step: 'starting_new_chat', message: 'Preparing new chat...' });
//                     socketRef.current.emit('start_new_conversation', {});
//                 },
//                 handleConfirmSend: (confirmationId) => {
//                     const { socketRef, isConnected, handleError: storeHandleError, setLoadingState: storeSetLoading, setShowConfirmationDialog: storeSetDialog } = get();
//                     if (socketRef.current && isConnected) {
//                         socketRef.current.emit('user_confirm_email', { confirmationId });
//                         storeSetLoading({ isLoading: true, step: 'confirming_email', message: 'Sending email...' });
//                     } else {
//                         storeHandleError({ message: 'Cannot confirm: Not connected.', type: 'error' }, false, false);
//                         storeSetDialog(false);
//                     }
//                 },
//                 handleCancelSend: (confirmationId) => {
//                     const { socketRef, isConnected, setShowConfirmationDialog: storeSetDialog } = get();
//                     if (socketRef.current && isConnected) {
//                         socketRef.current.emit('user_cancel_email', { confirmationId });
//                     } else {
//                         console.warn('[ChatStore] Cannot cancel: Not connected.');
//                     }
//                     storeSetDialog(false);
//                 },
//                 deleteConversation: (conversationIdToDelete) => {
//                     return new Promise<void>((resolve, reject) => {
//                         const { socketRef, isConnected, hasFatalError, handleError: storeHandleError } = get();
//                         if (!isConnected || hasFatalError || !socketRef.current) {
//                             const msg = 'Cannot delete: Socket not connected or in fatal error state.';
//                             console.warn(msg);
//                             storeHandleError({ message: 'Cannot delete conversation: Not connected.' }, false);
//                             return reject(new Error(msg));
//                         }
//                         if (!conversationIdToDelete) {
//                             const msg = 'Invalid conversation ID for deletion.';
//                             console.warn(msg);
//                             return reject(new Error(msg));
//                         }
//                         console.log(`[ChatStore] Emitting delete_conversation for: ${conversationIdToDelete}`);
//                         socketRef.current.emit('delete_conversation', { conversationId: conversationIdToDelete });
//                         // Promise này resolve ngay sau khi emit.
//                         // MainLayout sẽ không dùng promise này để chờ server xác nhận.
//                         resolve();
//                     });
//                 },
//                 clearConversation: (conversationId) => {
//                     const { socketRef, isConnected, hasFatalError, handleError: storeHandleError } = get();
//                     if (!isConnected || hasFatalError || !socketRef.current) { storeHandleError({ message: 'Cannot clear: Not connected.' }); return; }
//                     if (!conversationId) { console.warn('Invalid conversation ID for clear.'); return; }
//                     socketRef.current.emit('clear_conversation', { conversationId });
//                 },
//                 renameConversation: (conversationId, newTitle) => {
//                     const { socketRef, isConnected, hasFatalError, handleError: storeHandleError } = get();
//                     if (!isConnected || hasFatalError || !socketRef.current) { storeHandleError({ message: 'Cannot rename: Not connected.' }); return; }
//                     if (!conversationId || typeof newTitle !== 'string') { console.warn('Invalid ID or title for rename.'); return; }
//                     socketRef.current.emit('rename_conversation', { conversationId, newTitle });
//                 },
//                 pinConversation: (conversationId, isPinned) => {
//                     const { socketRef, isConnected, hasFatalError, handleError: storeHandleError } = get();
//                     if (!isConnected || hasFatalError || !socketRef.current) { storeHandleError({ message: 'Cannot pin: Not connected.' }); return; }
//                     if (!conversationId || typeof isPinned !== 'boolean') { console.warn('Invalid ID or pin status.'); return; }
//                     socketRef.current.emit('pin_conversation', { conversationId, isPinned });
//                 },
//                 searchConversations: (searchTerm) => {
//                     const { conversationList, setIsSearching: storeSetSearching, setSearchResults: storeSetResults } = get();
//                     storeSetSearching(true);
//                     const trimmedSearchTerm = searchTerm.trim().toLowerCase();
//                     if (!trimmedSearchTerm) {
//                         storeSetResults(conversationList);
//                     } else {
//                         const filtered = conversationList.filter(conv =>
//                             conv.title.toLowerCase().includes(trimmedSearchTerm)
//                         );
//                         storeSetResults(filtered);
//                     }
//                     storeSetSearching(false);
//                 },

//                 // --- Socket Event Handlers (internal) ---
//                 _onSocketConnect: (socketIdParam) => {
//                     console.log(`[ChatStore _onSocketConnect] Connected with ID ${socketIdParam}`);
//                     set({ isConnected: true, socketId: socketIdParam, hasFatalError: false, loadingState: { isLoading: false, step: 'connected', message: 'Connected' } }, false, '_onSocketConnect');
//                 },
//                 _onSocketDisconnect: (reason) => {
//                     console.log(`[ChatStore _onSocketDisconnect] Disconnected. Reason: ${reason}`);
//                     get().animationControls?.stopStreaming();
//                     get().resetAwaitFlag();
//                     set(state => ({
//                         isConnected: false, socketId: null, isServerReadyForCommands: false,
//                         loadingState: { ...state.loadingState, isLoading: false, step: 'disconnected', message: `Disconnected: ${reason}` }
//                     }), false, '_onSocketDisconnect');
//                 },
//                 _onSocketConnectError: (error) => {
//                     console.error("[ChatStore _onSocketConnectError]", error);
//                     const isAuthRelated = error.message.toLowerCase().includes('auth') || error.message.toLowerCase().includes('token');
//                     get().handleError(error, true, isAuthRelated); // handleError của store
//                 },
//                 _onSocketAuthError: (error) => {
//                     console.error("[ChatStore _onSocketAuthError]", error);
//                     get().handleError({ ...error, type: 'error' }, true, true); // handleError của store
//                 },
//                 _onSocketStatusUpdate: (data) => set({ loadingState: { isLoading: true, step: data.step, message: data.message } }, false, `_onSocketStatusUpdate/${data.step}`),
//                 _onSocketChatUpdate: (update) => {
//                     const { animationControls, isAwaitingFinalResultRef, addChatMessage: storeAddMessage, setLoadingState: storeSetLoading } = get();
//                     if (!animationControls) { console.warn("ChatUpdate received but no animationControls"); return; }

//                     const currentStreamingId = animationControls.currentStreamingId;
//                     if (isAwaitingFinalResultRef.current || currentStreamingId) {
//                         if (!isAwaitingFinalResultRef.current && currentStreamingId) isAwaitingFinalResultRef.current = true;
//                         animationControls.processChunk(update.textChunk);
//                     } else {
//                         isAwaitingFinalResultRef.current = true;
//                         const newStreamingId = `streaming-${generateMessageId()}`;
//                         storeAddMessage({ id: newStreamingId, message: '', isUser: false, type: 'text', thoughts: [], timestamp: new Date().toISOString() });
//                         storeSetLoading({ isLoading: true, step: 'streaming_response', message: 'Receiving...' });
//                         animationControls.startStreaming(newStreamingId);
//                         animationControls.processChunk(update.textChunk);
//                     }
//                 },
//                 _onSocketChatResult: (result) => {
//                     const { animationControls, isAwaitingFinalResultRef, setLoadingState: storeSetLoading, updateMessageById: storeUpdateMsgById, setShowConfirmationDialog: storeSetDialog, currentLocale: storeLocale, resetAwaitFlag: storeResetAwait, addChatMessage: storeAddMessage } = get();
//                     if (!animationControls) { console.warn("ChatResult received but no animationControls"); return; }

//                     const streamingId = animationControls.currentStreamingId; // Lấy ID trước khi complete
//                     if (!isAwaitingFinalResultRef.current && !streamingId) {
//                         console.warn("[ChatStore _onSocketChatResult] Received result but wasn't expecting one / no stream active. Adding as new.");
//                         storeAddMessage({
//                             id: generateMessageId(), isUser: false, message: result.message || "Result received",
//                             thoughts: result.thoughts, type: result.action?.type === 'openMap' ? 'map' : 'text',
//                             location: result.action?.type === 'openMap' ? result.action.location : undefined,
//                             timestamp: new Date().toISOString()
//                         });
//                         storeResetAwait();
//                         storeSetLoading({ isLoading: false, step: 'result_received', message: '' });
//                         return;
//                     }

//                     storeResetAwait();
//                     const finalStreamedMessage = animationControls.completeStream();
//                     storeSetLoading({ isLoading: false, step: 'result_received', message: '' });

//                     if (!streamingId) {
//                         console.error("[ChatStore _onSocketChatResult] *** CRITICAL: NO STREAMING ID FOUND AFTER COMPLETION! ***");
//                         storeAddMessage({ id: generateMessageId(), isUser: false, message: result.message || finalStreamedMessage || "Final result", thoughts: result.thoughts, type: 'text', timestamp: new Date().toISOString() });
//                         return;
//                     }

//                     const action = result.action;
//                     storeUpdateMsgById(streamingId, (prevMsg) => {
//                         let finalUpdates: Partial<ChatMessageType> = {
//                             message: result.message || prevMsg.message,
//                             thoughts: result.thoughts || prevMsg.thoughts,
//                             timestamp: new Date().toISOString(),
//                         };
//                         if (action?.type === 'openMap' && action.location) {
//                             finalUpdates.type = 'map'; finalUpdates.location = action.location;
//                             finalUpdates.message = result.message || `Showing map for: ${action.location}`;
//                         } else if (action?.type === 'confirmEmailSend') {
//                             finalUpdates.type = 'text';
//                             finalUpdates.message = result.message || 'Please confirm the action.';
//                         } else if (action?.type === 'navigate' && !result.message) {
//                             finalUpdates.message = `Okay, navigating...`;
//                         }
//                         return finalUpdates;
//                     });

//                     if (action?.type === 'navigate' && action.url) {
//                         const finalUrl = constructNavigationUrl(BASE_WEB_URL, storeLocale, action.url);
//                         openUrlInNewTab(finalUrl);
//                     } else if (action?.type === 'confirmEmailSend' && action.payload) {
//                         storeSetDialog(true, action.payload);
//                     }
//                 },
//                 _onSocketChatError: (errorData: ErrorUpdate) => {
//                     const { isAwaitingFinalResultRef, animationControls, activeConversationId: storeActiveId, handleError: storeHandleError, setActiveConversationId: setStoreActiveId, setChatMessages: setStoreMessages, setIsHistoryLoaded: setStoreHistoryLoaded, setIsLoadingHistory: setStoreLoadingHistory, resetAwaitFlag: storeResetAwait } = get();
//                     console.log("[ChatStore _onSocketChatError] Event: Chat Error received from server:", errorData);

//                     storeResetAwait();
//                     animationControls?.stopStreaming();

//                     const { step: errorStep, code: errorCode, details, message } = errorData;
//                     const historyLoadErrorSteps = ['history_not_found_load', 'history_load_fail_server', 'auth_required_load', 'invalid_request_load'];
//                     const isRelatedToActiveConv = (errorCode === 'CONVERSATION_NOT_FOUND' || errorCode === 'ACCESS_DENIED') && details?.conversationId === storeActiveId;

//                     if (historyLoadErrorSteps.includes(errorStep || '') || isRelatedToActiveConv) {
//                         console.log(`[ChatStore _onSocketChatError] Error (${errorStep || errorCode}: "${message}") related to active/history. Resetting active state.`);
//                         setStoreActiveId(null);
//                         setStoreMessages(() => []);
//                         setStoreHistoryLoaded(false);
//                         setStoreLoadingHistory(false);
//                     }
//                     const isFatal = errorCode === 'FATAL_SERVER_ERROR' || errorCode === 'AUTH_REQUIRED' || errorCode === 'ACCESS_DENIED';
//                     storeHandleError(errorData, true, isFatal);
//                 },
//                 _onSocketEmailConfirmationResult: (result) => {
//                     const { confirmationData, setShowConfirmationDialog: storeSetDialog, addChatMessage: storeAddMessage, setLoadingState: storeSetLoading } = get();
//                     if (result.confirmationId === confirmationData?.confirmationId) {
//                         storeSetDialog(false);
//                     }
//                     storeAddMessage({
//                         id: generateMessageId(), message: result.message, isUser: false,
//                         type: result.status === 'success' ? 'text' : 'warning', timestamp: new Date().toISOString()
//                     });
//                     storeSetLoading({ isLoading: false, step: `email_${result.status}`, message: '' });
//                 },
//                 _onSocketConversationList: (list) => {
//                     const sortedList = (Array.isArray(list) ? list : []).sort((a, b) => {
//                         if (a.isPinned && !b.isPinned) return -1;
//                         if (!a.isPinned && b.isPinned) return 1;
//                         return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
//                     });
//                     set({ conversationList: sortedList, searchResults: sortedList, isLoadingHistory: false }, false, '_onSocketConversationList');
//                 },
//                 _onSocketInitialHistory: (payload) => {
//                     set({
//                         isLoadingHistory: false,
//                         chatMessages: Array.isArray(payload.messages) ? payload.messages : [],
//                         activeConversationId: payload.conversationId,
//                         isHistoryLoaded: true,
//                         loadingState: { isLoading: false, step: 'history_loaded', message: '' }
//                     }, false, `_onSocketInitialHistory/${payload.conversationId}`);
//                 },
//                 _onSocketNewConversationStarted: (payload) => {
//                     console.log(`[ChatStore _onSocketNewConversationStarted] New Conversation ID: ${payload.conversationId}`);
//                     set(state => {
//                         const newConv: ConversationMetadata = {
//                             id: payload.conversationId,
//                             title: payload.title || "New Chat", // Server nên gửi title mặc định
//                             lastActivity: payload.lastActivity || new Date().toISOString(),
//                             isPinned: payload.isPinned || false,
//                         };
//                         const updatedList = [newConv, ...state.conversationList.filter(c => c.id !== payload.conversationId)]
//                             .sort((a, b) => {
//                                 if (a.isPinned && !b.isPinned) return -1;
//                                 if (!a.isPinned && b.isPinned) return 1;
//                                 return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
//                             });

//                         return {
//                             activeConversationId: payload.conversationId,
//                             chatMessages: [],
//                             isHistoryLoaded: true,
//                             isLoadingHistory: false,
//                             conversationList: updatedList,
//                             searchResults: updatedList,
//                             loadingState: { isLoading: false, step: 'new_chat_ready', message: '' },
//                             showConfirmationDialog: false,
//                             confirmationData: null,
//                         };
//                     }, false, `_onSocketNewConversationStarted/${payload.conversationId}`);
//                 },
//                 _onSocketConversationDeleted: (payload) => {
//                     const deletedId = payload.conversationId;
//                     console.log(`[ChatStore _onSocketConversationDeleted] Received confirmation for ${deletedId}`);
//                     set(state => {
//                         const newConvList = state.conversationList.filter(conv => conv.id !== deletedId);
//                         let newActiveId = state.activeConversationId;
//                         let newChatMessages = state.chatMessages;
//                         let newIsHistoryLoaded = state.isHistoryLoaded;

//                         if (state.activeConversationId === deletedId) {
//                             console.log(`[ChatStore _onSocketConversationDeleted] Deleted conversation ${deletedId} was active. Resetting active state.`);
//                             newActiveId = null;
//                             newChatMessages = []; // Clear messages for the deleted active chat
//                             newIsHistoryLoaded = false; // History for this (now non-existent) chat is no longer loaded
//                             // get().resetChatUIForNewConversation(true); // Không nên gọi resetChatUI ở đây, để MainLayout xử lý điều hướng
//                         }
//                         return {
//                             conversationList: newConvList,
//                             activeConversationId: newActiveId,
//                             chatMessages: newChatMessages,
//                             isHistoryLoaded: newIsHistoryLoaded,
//                             searchResults: newConvList, // Update search results as well
//                             // Potentially reset loading state if deletion was the active operation
//                             // loadingState: state.loadingState.step.includes('delete') ? { isLoading: false, step: 'idle', message: '' } : state.loadingState,
//                         };
//                     }, false, `_onSocketConversationDeleted/${deletedId}`);
//                 },
//                 _onSocketConversationCleared: (payload) => {
//                     if (get().activeConversationId === payload.conversationId) {
//                         set({ chatMessages: [], loadingState: { isLoading: false, step: 'idle', message: '' } }, false, `_onSocketConversationCleared/${payload.conversationId}`);
//                         // Server nên gửi lại danh sách messages rỗng hoặc client tự clear
//                         // Và server nên gửi lại event `initial_history` với messages rỗng nếu cần
//                     }
//                 },
//                 _onSocketConversationRenamed: (payload) => {
//                     const updater = (prevList: ConversationMetadata[]) =>
//                         prevList.map(conv =>
//                             conv.id === payload.conversationId ? { ...conv, title: payload.newTitle, lastActivity: new Date().toISOString() } : conv
//                         );
//                     set(state => {
//                         const updatedList = updater(state.conversationList).sort((a, b) => { // Sắp xếp lại sau khi đổi tên
//                             if (a.isPinned && !b.isPinned) return -1;
//                             if (!a.isPinned && b.isPinned) return 1;
//                             return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
//                         });
//                         return {
//                             conversationList: updatedList,
//                             searchResults: updatedList // Cập nhật cả searchResults
//                         };
//                     }, false, `_onSocketConversationRenamed/${payload.conversationId}`);
//                 },
//                 _onSocketConversationPinStatusChanged: (payload) => {
//                     const updater = (prevList: ConversationMetadata[]) =>
//                         prevList.map(conv =>
//                             conv.id === payload.conversationId ? { ...conv, isPinned: payload.isPinned, lastActivity: new Date().toISOString() } : conv
//                         )
//                             .sort((a, b) => {
//                                 if (a.isPinned && !b.isPinned) return -1;
//                                 if (!a.isPinned && b.isPinned) return 1;
//                                 return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
//                             });
//                     set(state => ({ conversationList: updater(state.conversationList), searchResults: updater(state.searchResults) }), false, `_onSocketConversationPinStatusChanged/${payload.conversationId}`);
//                 },
//                 _onSocketConnectionReady: (payload) => {
//                     console.log(`[ChatStore _onSocketConnectionReady] Server ready. UserID: ${payload.userId}`);
//                     set({ isServerReadyForCommands: true }, false, '_onSocketConnectionReady');
//                     get().socketRef.current?.emit('get_initial_conversations');
//                 },

//             }),
//             {
//                 name: 'chatbot-storage-v3', // Tăng version nếu cấu trúc persist thay đổi
//                 storage: createJSONStorage(() => localStorage),
//                 partialize: (state) => ({
//                     // authToken không persist ở đây, sẽ load từ localStorage riêng
//                     chatMode: state.chatMode,
//                     currentLocale: state.currentLocale, // Persist locale của app
//                     isLeftPanelOpen: state.isLeftPanelOpen,
//                     isRightPanelOpen: state.isRightPanelOpen,
//                     isStreamingEnabled: state.isStreamingEnabled, // Persist cài đặt streaming
//                     currentLanguage: state.currentLanguage, // Persist ngôn ngữ đã chọn
//                     // Không persist: chatMessages, conversationList, activeConversationId, loadingState, etc.
//                     // Chúng nên được load lại từ server hoặc reset.
//                 }),
//                 onRehydrateStorage: () => (state) => {
//                     if (state) {
//                         if (state.authToken === undefined && typeof window !== 'undefined') {
//                             const storedToken = localStorage.getItem('token');
//                             if (storedToken) {
//                                 state.authToken = storedToken;
//                             }
//                         }
//                         // Đảm bảo availableLanguages được cập nhật từ constant phòng khi constant thay đổi
//                         state.availableLanguages = AVAILABLE_LANGUAGES_REGULAR_CHAT;
//                         console.log('[ChatStore] Rehydrated from storage. Current Language:', state.currentLanguage?.name);
//                     }
//                 }
//             }
//         ),
//         {
//             name: "ChatStore",
//             // serialize: { options: true }
//         }
//     )

// );

// // --- Helper Hooks ---
// // Hook để lấy callback updateMessageById cho useStreamingTextAnimation
// // Sửa hook useUpdateChatMessageCallbackForAnimation
// export const useUpdateChatMessageCallbackForAnimation = () => {
//     const storeUpdateMessageById = useChatStore(state => state.updateMessageById);
//     return useCallback((messageId: string, newContent: string) => {
//         storeUpdateMessageById(messageId, { message: newContent });
//     }, [storeUpdateMessageById]);
// };

// // Sửa hook useSocketEventActions
// // Sửa hook useSocketEventActions sử dụng useShallow
// export const useSocketEventActions = () => {
//     return useChatStore(
//         useShallow(state => ({ // Gói selector của bạn bằng useShallow
//             _onSocketConnect: state._onSocketConnect,
//             _onSocketDisconnect: state._onSocketDisconnect,
//             _onSocketConnectError: state._onSocketConnectError,
//             _onSocketAuthError: state._onSocketAuthError,
//             _onSocketStatusUpdate: state._onSocketStatusUpdate,
//             _onSocketChatUpdate: state._onSocketChatUpdate,
//             _onSocketChatResult: state._onSocketChatResult,
//             _onSocketChatError: state._onSocketChatError,
//             _onSocketEmailConfirmationResult: state._onSocketEmailConfirmationResult,
//             _onSocketConversationList: state._onSocketConversationList,
//             _onSocketInitialHistory: state._onSocketInitialHistory,
//             _onSocketNewConversationStarted: state._onSocketNewConversationStarted,
//             _onSocketConversationDeleted: state._onSocketConversationDeleted,
//             _onSocketConversationCleared: state._onSocketConversationCleared,
//             _onSocketConversationRenamed: state._onSocketConversationRenamed,
//             _onSocketConversationPinStatusChanged: state._onSocketConversationPinStatusChanged,
//             _onSocketConnectionReady: state._onSocketConnectionReady,
//         })) // useChatStore bây giờ chỉ nhận 1 đối số
//     );
// };


// // Hook để lấy các settings chat cơ bản
// export const useChatSettingsFromStore = () => {
//     return useChatStore(
//         useShallow(state => ({ // <--- ÁP DỤNG useShallow
//             isStreamingEnabled: state.isStreamingEnabled,
//             setIsStreamingEnabled: state.setIsStreamingEnabled,
//             currentLanguage: state.currentLanguage,
//             setCurrentLanguage: state.setCurrentLanguage,
//             availableLanguages: state.availableLanguages,
//             chatMode: state.chatMode,
//             setChatMode: state.setChatMode,
//         }))
//     );
// };