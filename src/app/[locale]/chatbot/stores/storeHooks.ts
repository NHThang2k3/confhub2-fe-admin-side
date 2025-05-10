// src/hooks/storeHooks.ts
import { useCallback } from 'react';
import {
    useSocketStore,
    useConversationStore,
    useMessageStore,
    useSettingsStore,
    useUiStore,
} from '@/src/app/[locale]/chatbot/stores'; // Assumes you have an index.ts in stores directory
import { useShallow } from 'zustand/react/shallow';

// Import all necessary types that might be used by components consuming these hooks
// Adjust paths as per your project structure
import {
    ChatMessageType,
    LoadingState,
    ConversationMetadata,
    ConfirmSendEmailAction,
    ThoughtStep,
    ErrorUpdate,
    ChatUpdate,
    ResultUpdate,
    InitialHistoryPayload,
    ConversationDeletedPayload,
    ConversationClearedPayload,
    ConversationRenamedPayload,
    ConversationPinStatusChangedPayload,
    EmailConfirmationResult,
    LanguageCode, // From settingsStore types
    ChatMode,     // From settingsStore types
    LanguageOption // From settingsStore types
} from '@/src/app/[locale]/chatbot/lib/regular-chat.types'; // Main types file
import { StreamingTextAnimationControls } from '../../../../hooks/chatbot/useStreamingTextAnimation'; // Hook for animation controls

// === SocketStore Hooks ===

/**
 * Hook to get socket connection status, authentication token, and related info.
 * @returns {object} Socket connection state.
 */
export const useSocketConnectionStatus = () => {
    return useSocketStore(
        useShallow(state => ({
            authToken: state.authToken,
            isConnected: state.isConnected,
            socketId: state.socketId,
            isServerReadyForCommands: state.isServerReadyForCommands,
            hasFatalConnectionError: state.hasFatalConnectionError,
        }))
    );
};

/**
 * Hook to get actions for managing socket connection and authentication.
 * These are actions that components might typically trigger.
 * @returns {object} Socket connection actions.
 */
export const useSocketConnectionActions = () => {
    return useSocketStore(
        useShallow(state => ({
            initializeAuth: state.initializeAuth,
            setAuthToken: state.setAuthToken, // Useful for login/logout flows
            disconnectSocket: state.disconnectSocket, // To manually disconnect
            // Emitter actions can also be exposed here if components need to call them directly,
            // though often they are called from other store actions.
            // Example: emitGetInitialConversations: state.emitGetInitialConversations
        }))
    );
};

/**
 * Hook to get the raw socket instance ref. Use with extreme caution.
 * Primarily intended for `useChatSocketManager` or very advanced scenarios
 * where direct socket manipulation is unavoidable.
 * @returns {React.MutableRefObject<Socket | null>} The socket ref.
 */
export const useSocketRef = () => {
    return useSocketStore(state => state.socketRef);
};


// === ConversationStore Hooks ===

/**
 * Hook to get the list of conversations, search results, and related loading/searching states.
 * @returns {object} Conversation list state.
 */
export const useConversationListState = () => {
    return useConversationStore(
        useShallow(state => ({
            conversationList: state.conversationList,
            searchResults: state.searchResults,
            isSearching: state.isSearching,
            isLoadingHistory: state.isLoadingHistory, // Global loading state for any history operation
        }))
    );
};

/**
 * Hook to get the active conversation ID and whether its history/messages are loaded.
 * @returns {object} Active conversation state.
 */
export const useActiveConversationState = () => {
    return useConversationStore(
        useShallow(state => ({
            activeConversationId: state.activeConversationId,
            isHistoryLoaded: state.isHistoryLoaded, // Specifically for the activeConversationId
        }))
    );
};

/**
 * Hook to get actions for managing conversations (loading, starting, deleting, etc.).
 * @returns {object} Conversation management actions.
 */
export const useConversationActions = () => {
    return useConversationStore(
        useShallow(state => ({
            setConversationList: state.setConversationList, // If direct manipulation is needed
            setActiveConversationId: state.setActiveConversationId,
            setIsLoadingHistory: state.setIsLoadingHistory, // If direct manipulation is needed
            setIsHistoryLoaded: state.setIsHistoryLoaded,   // If direct manipulation is needed
            loadConversation: state.loadConversation,
            startNewConversation: state.startNewConversation,
            deleteConversation: state.deleteConversation,
            clearConversation: state.clearConversation,
            renameConversation: state.renameConversation,
            pinConversation: state.pinConversation,
            searchConversations: state.searchConversations,
        }))
    );
};


// === MessageStore Hooks ===

/**
 * Hook to get chat messages and the loading state related to sending/receiving messages.
 * @returns {object} Chat messages and loading state.
 */
export const useChatMessageState = () => {
    return useMessageStore(
        useShallow(state => ({
            chatMessages: state.chatMessages,
            loadingState: state.loadingState, // Loading state for message operations
        }))
    );
};

/**
 * Hook to get actions for sending messages, managing individual messages, and resetting chat UI.
 * @returns {object} Message management actions.
 */
export const useMessageActions = () => {
    return useMessageStore(
        useShallow(state => ({
            setChatMessages: state.setChatMessages, // For direct manipulation or complex updates
            addChatMessage: state.addChatMessage,
            updateMessageById: state.updateMessageById,
            setLoadingState: state.setLoadingState, // For direct manipulation
            sendMessage: state.sendMessage,
            resetChatUIForNewConversation: state.resetChatUIForNewConversation,
        }))
    );
};

/**
 * Hook specifically for providing the `updateMessageById` callback to `useStreamingTextAnimation`.
 * This ensures the callback is stable if `updateMessageById` itself is stable.
 * @returns {function} Callback to update a message's content.
 */
export const useUpdateChatMessageCallbackForAnimation = () => {
    const storeUpdateMessageById = useMessageStore(state => state.updateMessageById);
    return useCallback((messageId: string, newContent: string) => {
        // Only update the message content, keep other properties
        storeUpdateMessageById(messageId, (prevMsg) => ({ ...prevMsg, message: newContent, timestamp: new Date().toISOString() }));
    }, [storeUpdateMessageById]);
};

/**
 * Hook to get and set animation controls, and manage the awaiting flag for streaming.
 * Primarily intended for `useChatSocketManager` and `useStreamingTextAnimation`.
 * @returns {object} Animation controls and related state/actions.
 */
export const useAnimationControls = () => {
    return useMessageStore(
        useShallow(state => ({
            animationControls: state.animationControls,
            setAnimationControls: state.setAnimationControls,
            isAwaitingFinalResultRef: state.isAwaitingFinalResultRef,
            resetAwaitFlag: state.resetAwaitFlag,
        }))
    );
};


// === SettingsStore Hooks ===

/**
 * Hook to get all chat-related settings (mode, locale, streaming, language).
 * @returns {object} All chat settings.
 */
export const useChatSettingsState = () => {
    return useSettingsStore(
        useShallow(state => ({
            chatMode: state.chatMode,
            currentLocale: state.currentLocale, // App's UI locale
            isStreamingEnabled: state.isStreamingEnabled,
            currentLanguage: state.currentLanguage, // Chatbot's language
            availableLanguages: state.availableLanguages,
        }))
    );
};

/**
 * Hook to get actions for modifying chat-related settings.
 * @returns {object} Chat settings actions.
 */
export const useChatSettingsActions = () => {
    return useSettingsStore(
        useShallow(state => ({
            setChatMode: state.setChatMode,
            setCurrentLocale: state.setCurrentLocale,
            setIsStreamingEnabled: state.setIsStreamingEnabled,
            setCurrentLanguage: state.setCurrentLanguage,
        }))
    );
};


// === UiStore Hooks ===

/**
 * Hook to get general UI states: fatal errors, dialog visibility, panel states.
 * @returns {object} General UI state.
 */
export const useUIState = () => {
    return useUiStore(
        useShallow(state => ({
            hasFatalError: state.hasFatalError, // General, non-connection fatal errors
            showConfirmationDialog: state.showConfirmationDialog,
            confirmationData: state.confirmationData,
            isLeftPanelOpen: state.isLeftPanelOpen,
            isRightPanelOpen: state.isRightPanelOpen,
        }))
    );
};

/**
 * Hook to get actions for controlling UI elements, handling general errors, and confirmations.
 * @returns {object} UI control actions.
 */
export const useUIActions = () => {
    return useUiStore(
        useShallow(state => ({
            setHasFatalError: state.setHasFatalError,
            setShowConfirmationDialog: state.setShowConfirmationDialog,
            toggleLeftPanel: state.toggleLeftPanel,
            setLeftPanelOpen: state.setLeftPanelOpen,
            setRightPanelOpen: state.setRightPanelOpen,
            handleError: state.handleError, // General error handler
            handleConfirmSend: state.handleConfirmSend, // For email confirmation dialog
            handleCancelSend: state.handleCancelSend,   // For email confirmation dialog
        }))
    );
};


// === Combined "Facade" Hooks (for specific component use cases) ===

/**
 * Facade hook for components managing the overall conversation lifecycle
 * (e.g., a layout component or a primary chat view controller).
 * @returns {object} Combined state and actions for conversation management.
 */
export const useConversationManagement = () => {
    const listState = useConversationListState();
    const activeConvState = useActiveConversationState();
    const actions = useConversationActions();
    return { ...listState, ...activeConvState, ...actions };
};

/**
 * Facade hook tailored for a chat input component.
 * Gathers necessary state and actions for sending messages and reflecting current settings.
 * @returns {object} State and actions for a chat input.
 */
export const useChatInputCore = () => {
    const { sendMessage } = useMessageActions();
    const { isStreamingEnabled, currentLanguage } = useChatSettingsState();
    const { isConnected, isServerReadyForCommands } = useSocketConnectionStatus();
    const { loadingState } = useChatMessageState(); // To disable input while loading/streaming

    return {
        sendMessage,
        isStreamingEnabled,
        currentLanguage,
        isConnected,
        isServerReadyForCommands,
        isLoading: loadingState.isLoading, // Simplified loading state for input
    };
};

/**
 * Facade hook for components displaying the main chat message area.
 * Provides messages, loading states, and active conversation context.
 * @returns {object} State for the chat message display area.
 */
export const useChatAreaCore = () => {
    const { chatMessages, loadingState } = useChatMessageState();
    const { activeConversationId, isHistoryLoaded } = useActiveConversationState();
    const { isLoadingHistory } = useConversationListState(); // For the initial load of history
    const { animationControls } = useAnimationControls(); // For potential direct interaction if needed

    return {
        chatMessages,
        loadingState, // Message-specific loading (sending, streaming)
        activeConversationId,
        isHistoryLoaded, // Is the *current* active conversation's history fully loaded?
        isLoadingHistory, // Is *any* history loading operation in progress?
        animationControls,
    };
};


/**
 * Facade hook providing necessary state and actions for the LeftPanel component,
 * which typically lists conversations and allows starting new ones.
 * @returns {object} State and actions for the LeftPanel.
 */
export const useLeftPanelCore = () => {
    const {
        conversationList,
        searchResults,
        isSearching,
        // isLoadingHistory, // Nếu LeftPanel cần biết trạng thái loading chung của history
    } = useConversationListState(); // Lấy state liên quan đến danh sách

    const { activeConversationId } = useActiveConversationState(); // Lấy activeConversationId từ đây

    const {
        startNewConversation,
        searchConversations,
        loadConversation, // Dùng khi người dùng chọn một cuộc trò chuyện từ danh sách
        deleteConversation, // Dùng khi người dùng xóa một cuộc trò chuyện từ danh sách
    } = useConversationActions();

    const { isLeftPanelOpen } = useUIState();
    const { setLeftPanelOpen } = useUIActions(); // Để đóng/mở panel, ví dụ trên mobile

    return {
        conversationList,
        searchResults,
        isSearching,
        activeConversationId, // Bây giờ đã có giá trị đúng
        startNewConversation,
        searchConversations,
        loadConversation,
        deleteConversation,
        isLeftPanelOpen,
        setLeftPanelOpen,
        // isLoadingHistory, // Có thể thêm lại nếu LeftPanel cần hiển thị spinner khi lịch sử đang tải
    };
};


/**
 * Facade hook providing necessary state and actions for the RightSettingsPanel component,
 * where users configure chat settings.
 * @returns {object} State and actions for the RightSettingsPanel.
 */
export const useRightSettingsPanelCore = () => {
    const settingsState = useChatSettingsState();
    const settingsActions = useChatSettingsActions();
    const { isRightPanelOpen } = useUIState();
    const { setRightPanelOpen } = useUIActions();

    return {
        ...settingsState,
        ...settingsActions,
        isRightPanelOpen,
        setRightPanelOpen,
    };
};

/**
 * Hook for a component that needs to initialize authentication and potentially
 * display global connection errors.
 * @returns {object} Authentication and connection status/actions.
 */
export const useAppInitializerCore = () => {
    const { initializeAuth } = useSocketConnectionActions();
    const { authToken, isConnected, hasFatalConnectionError } = useSocketConnectionStatus();
    const { hasFatalError } = useUIState(); // General fatal errors
    const { setCurrentLocale } = useChatSettingsActions(); // For setting initial locale

    return {
        initializeAuth,
        authToken,
        isConnected,
        hasFatalConnectionError,
        hasFatalError,
        setCurrentLocale,
    };
};


// --- Re-exporting common types for convenience ---
// This allows components to import types directly from storeHooks.ts if they wish.
export type {
    // Socket Store Related
    // (Socket type itself is usually not needed by typical UI components)

    // Conversation Store Related
    ConversationMetadata,
    InitialHistoryPayload,
    ConversationDeletedPayload,
    ConversationClearedPayload,
    ConversationRenamedPayload,
    ConversationPinStatusChangedPayload,

    // Message Store Related
    ChatMessageType,
    LoadingState, // Generic loading state used in MessageStore
    ThoughtStep,
    ChatUpdate,
    ResultUpdate,
    EmailConfirmationResult,
    StreamingTextAnimationControls,

    // Settings Store Related
    LanguageCode,
    ChatMode,
    LanguageOption,

    // UI Store Related
    ConfirmSendEmailAction,
    // ErrorUpdate is complex, components usually interact via handleError's simpler forms

    // General Error/Update types that might be passed around
    ErrorUpdate,
};