
//src/app/[locale]/chatbot/stores/conversationStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
    ConversationMetadata, InitialHistoryPayload, ConversationDeletedPayload,
    ConversationClearedPayload, ConversationRenamedPayload, ConversationPinStatusChangedPayload
} from '@/src/app/[locale]/chatbot/lib/regular-chat.types'; // Adjust path
import { useMessageStore } from './messageStore';
import { useSocketStore } from './socketStore';
import { useUiStore } from './uiStore';

// --- Types for Conversation Store State ---
export interface ConversationStoreState {
    conversationList: ConversationMetadata[];
    activeConversationId: string | null;
    searchResults: ConversationMetadata[];
    isSearching: boolean;
    isLoadingHistory: boolean;
    isHistoryLoaded: boolean; // For the active conversation
    isProcessingExplicitNewChat: boolean; // <<<< THÊM STATE NÀY

}

// --- Types for Conversation Store Actions ---
export interface ConversationStoreActions {
    setConversationList: (updater: (prev: ConversationMetadata[]) => ConversationMetadata[]) => void;
    setActiveConversationId: (id: string | null, options?: { fromUrl?: boolean; skipUiReset?: boolean }) => void;
    setSearchResults: (results: ConversationMetadata[]) => void;
    setIsSearching: (isSearching: boolean) => void;
    setIsLoadingHistory: (isLoading: boolean) => void;
    setIsHistoryLoaded: (isLoaded: boolean) => void;
    setIsProcessingExplicitNewChat: (isProcessing: boolean) => void; // <<<< THÊM ACTION NÀY (nếu cần gọi từ bên ngoài, không thì set trực tiếp)

    // Complex Actions
    loadConversation: (conversationId: string, options?: { isFromUrl?: boolean }) => void;
    startNewConversation: () => void;
    deleteConversation: (conversationId: string) => Promise<void>; // For UI to await emit
    clearConversation: (conversationId: string) => void;
    renameConversation: (conversationId: string, newTitle: string) => void;
    pinConversation: (conversationId: string, isPinned: boolean) => void;
    searchConversations: (searchTerm: string) => void;

    // Socket Event Handlers (called by useChatSocketManager)
    _onSocketConversationList: (list: ConversationMetadata[]) => void;
    _onSocketInitialHistory: (payload: InitialHistoryPayload) => void;
    _onSocketNewConversationStarted: (payload: { conversationId: string; title?: string; lastActivity?: string; isPinned?: boolean; }) => void;
    _onSocketConversationDeleted: (payload: ConversationDeletedPayload) => void;
    _onSocketConversationCleared: (payload: ConversationClearedPayload) => void;
    _onSocketConversationRenamed: (payload: ConversationRenamedPayload) => void;
    _onSocketConversationPinStatusChanged: (payload: ConversationPinStatusChangedPayload) => void;
}

const initialConversationStoreState: ConversationStoreState = {
    conversationList: [],
    activeConversationId: null,
    searchResults: [],
    isSearching: false,
    isLoadingHistory: false,
    isHistoryLoaded: false,
    isProcessingExplicitNewChat: false, // <<<< KHỞI TẠO

};

export const useConversationStore = create<ConversationStoreState & ConversationStoreActions>()(
    devtools(
        (set, get) => ({
            ...initialConversationStoreState,

            // --- Setters ---
            setConversationList: (updater) => set(state => ({ conversationList: updater(state.conversationList) }), false, 'setConversationList'),
            setActiveConversationId: (id, options) => {
                const oldId = get().activeConversationId;
                // Nếu ID không đổi VÀ không phải là một yêu cầu load từ URL (vì load từ URL có thể cần refresh state dù ID giống)
                if (oldId === id && !options?.fromUrl) { // Giữ nguyên điều kiện này
                    console.log(`[ConversationStore] setActiveConversationId: already active ${id}, not from URL. No state change.`);
                    return;
                }
                // Nếu ID không đổi VÀ LÀ một yêu cầu load từ URL, CHỈ set lại activeId nếu nó chưa được set.
                // Điều này có thể không cần thiết nếu logic loadConversation xử lý tốt.
                // Tạm thời để như cũ, vì `loadConversation` sẽ gọi lại nó.
                // if (oldId === id && options?.fromUrl) {
                //   console.log(`[ConversationStore] setActiveConversationId: already active ${id}, BUT from URL. Ensuring state.`);
                //   // Có thể không cần set lại nếu không có gì thay đổi.
                // }

                console.log(`[ConversationStore] setActiveConversationId: ${id}`, options);
                set({ activeConversationId: id }, false, `setActiveConversationId/${id}`);

                if (id && !options?.fromUrl && !options?.skipUiReset) {
                    useMessageStore.getState().resetChatUIForNewConversation(false);
                    set({ isHistoryLoaded: false });
                } else if (!id && !options?.skipUiReset) {
                    useMessageStore.getState().resetChatUIForNewConversation(true);
                    set({ isHistoryLoaded: false }); // Cũng nên reset isHistoryLoaded khi ID là null
                }
            },
            setSearchResults: (results) => set({ searchResults: results }, false, 'setSearchResults'),
            setIsSearching: (isSearching) => set({ isSearching: isSearching }, false, 'setIsSearching'),
            setIsLoadingHistory: (isLoading) => set({ isLoadingHistory: isLoading }, false, 'setIsLoadingHistory'),
            setIsHistoryLoaded: (isLoaded) => set({ isHistoryLoaded: isLoaded }, false, 'setIsHistoryLoaded'),
            setIsProcessingExplicitNewChat: (isProcessing) => set({ isProcessingExplicitNewChat: isProcessing }),

            // --- Complex Actions ---
            loadConversation: (conversationId, options) => {
                const { activeConversationId: currentActiveId, isHistoryLoaded: currentHistoryLoaded, setIsLoadingHistory, setIsHistoryLoaded, setActiveConversationId, isLoadingHistory } = get();
                const { isConnected } = useSocketStore.getState();
                const { handleError } = useUiStore.getState();
                const { setChatMessages, setLoadingState } = useMessageStore.getState();

                if (!isConnected) {
                    handleError({ message: 'Cannot load conversation: Not connected.', type: 'error' }, false, false);
                    return;
                }
                if (!conversationId) {
                    console.warn("[ConversationStore] Attempted to load conversation with invalid ID.");
                    return;
                }
                if (isLoadingHistory && currentActiveId === conversationId) {
                    console.log(`[ConversationStore] Conversation ${conversationId} is already loading.`);
                    return;
                }
                // QUAN TRỌNG: Nếu conversation đã active, đã loaded, VÀ không phải đang loading
                // thì không cần làm gì cả, bất kể có phải fromUrl hay không.
                // fromUrl chỉ nên ảnh hưởng đến việc có clear message hiện tại hay không.
                if (conversationId === currentActiveId && currentHistoryLoaded && !isLoadingHistory) {
                    console.log(`[ConversationStore] Conversation ${conversationId} is already active, loaded, and not currently loading. Options:`, options);
                    // Nếu là từ URL, đảm bảo UI không bị reset không cần thiết
                    if (options?.isFromUrl) {
                        setActiveConversationId(conversationId, { fromUrl: true, skipUiReset: true }); // Chỉ để đảm bảo activeId đúng, không reset UI
                    }
                    setLoadingState({ isLoading: false, step: 'history_loaded', message: '' });
                    setIsLoadingHistory(false); // Đảm bảo flag này đúng
                    return;
                }

                if (isLoadingHistory && currentActiveId === conversationId) {
                    console.log(`[ConversationStore] Conversation ${conversationId} is already loading.`);
                    return;
                }

                console.log(`[ConversationStore] Requesting to load conversation ID: ${conversationId}`);
                setIsLoadingHistory(true);
                // CHỈ clear messages nếu không phải là load từ URL và conversationId thay đổi
                // Hoặc nếu là load từ URL nhưng activeId hiện tại khác với cái đang load từ URL.
                // Mục đích là tránh clear messages nếu URL load lại cùng 1 conv đang active.
                if ((!options?.isFromUrl && currentActiveId !== conversationId) ||
                    (options?.isFromUrl && currentActiveId !== conversationId)) {
                    setChatMessages(() => []);
                }
                setIsHistoryLoaded(false);
                setActiveConversationId(conversationId, { fromUrl: options?.isFromUrl, skipUiReset: true });
                setLoadingState({ isLoading: true, step: 'loading_history', message: 'Loading history...' });
                useSocketStore.getState().emitLoadConversation(conversationId);
            },
            startNewConversation: () => {
                const { isConnected, isServerReadyForCommands } = useSocketStore.getState();
                const { handleError } = useUiStore.getState();
                const { resetChatUIForNewConversation, setLoadingState: setMessageLoadingState } = useMessageStore.getState(); // Đổi tên để tránh nhầm lẫn

                if (!isConnected || !isServerReadyForCommands) {
                    handleError({ message: 'Cannot start new conversation: Not connected or server not ready.' });
                    return;
                }
                console.log('[ConversationStore] STARTING NEW CONVERSATION (explicit).');

                set({ isProcessingExplicitNewChat: true }); // <<<< SET CỜ NÀY LÀ TRUE

                resetChatUIForNewConversation(true);
                set({ activeConversationId: null, isHistoryLoaded: false });
                setMessageLoadingState({ isLoading: true, step: 'starting_new_chat', message: 'Preparing new chat...' });
                useSocketStore.getState().emitStartNewConversation({});
            },
            deleteConversation: (conversationIdToDelete) => {
                return new Promise<void>((resolve, reject) => {
                    const { isConnected, hasFatalConnectionError } = useSocketStore.getState();
                    const { handleError } = useUiStore.getState();

                    if (!isConnected || hasFatalConnectionError) {
                        const msg = 'Cannot delete: Socket not connected or in fatal error state.';
                        console.warn(msg);
                        handleError({ message: 'Cannot delete conversation: Not connected.' }, false);
                        return reject(new Error(msg));
                    }
                    if (!conversationIdToDelete) {
                        const msg = 'Invalid conversation ID for deletion.';
                        console.warn(msg);
                        return reject(new Error(msg));
                    }
                    console.log(`[ConversationStore] Emitting delete_conversation for: ${conversationIdToDelete}`);
                    useSocketStore.getState().emitDeleteConversation(conversationIdToDelete);
                    resolve();
                });
            },
            clearConversation: (conversationId) => {
                const { isConnected, hasFatalConnectionError } = useSocketStore.getState();
                const { handleError } = useUiStore.getState();
                if (!isConnected || hasFatalConnectionError) { handleError({ message: 'Cannot clear: Not connected.' }); return; }
                if (!conversationId) { console.warn('Invalid conversation ID for clear.'); return; }
                useSocketStore.getState().emitClearConversation(conversationId);
            },
            renameConversation: (conversationId, newTitle) => {
                const { isConnected, hasFatalConnectionError } = useSocketStore.getState();
                const { handleError } = useUiStore.getState();
                if (!isConnected || hasFatalConnectionError) { handleError({ message: 'Cannot rename: Not connected.' }); return; }
                if (!conversationId || typeof newTitle !== 'string') { console.warn('Invalid ID or title for rename.'); return; }
                useSocketStore.getState().emitRenameConversation(conversationId, newTitle);
            },
            pinConversation: (conversationId, isPinned) => { // isPinned ở đây là trạng thái MỚI
                const { isConnected, hasFatalConnectionError } = useSocketStore.getState();
                const { handleError } = useUiStore.getState();
                if (!isConnected || hasFatalConnectionError) { handleError({ message: 'Cannot pin: Not connected.' }); return; }
                if (!conversationId || typeof isPinned !== 'boolean') { console.warn('Invalid ID or pin status.'); return; }
                // Emit trạng thái MỚI này lên server
                useSocketStore.getState().emitPinConversation(conversationId, isPinned);
            },
            searchConversations: (searchTerm) => {
                const { conversationList, setIsSearching, setSearchResults } = get();
                setIsSearching(true);
                const trimmedSearchTerm = searchTerm.trim().toLowerCase();
                if (!trimmedSearchTerm) {
                    setSearchResults(conversationList); // Show all if search term is empty
                } else {
                    const filtered = conversationList.filter(conv =>
                        conv.title.toLowerCase().includes(trimmedSearchTerm)
                    );
                    setSearchResults(filtered);
                }
                setIsSearching(false);
            },

            // --- Socket Event Handlers ---
            _onSocketConversationList: (list) => {
                const sortedList = (Array.isArray(list) ? list : []).sort((a, b) => {
                    if (a.isPinned && !b.isPinned) return -1;
                    if (!a.isPinned && b.isPinned) return 1;
                    return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
                });

                set(state => {
                    let newIsLoadingHistory = state.isLoadingHistory;
                    // Chỉ set isLoadingHistory = false bởi _onSocketConversationList nếu:
                    // 1. Không có active conversation nào.
                    // 2. Hoặc active conversation đã được load xong (isHistoryLoaded = true).
                    // Điều này ngăn _onSocketConversationList ghi đè isLoadingHistory = true
                    // đã được set bởi một lời gọi loadConversation() cho một activeId cụ thể
                    // mà chưa nhận được initial_history.
                    if (!state.activeConversationId || state.isHistoryLoaded) {
                        newIsLoadingHistory = false;
                    } else {
                        // Nếu có activeId và isHistoryLoaded là false, có nghĩa là
                        // một conversation cụ thể đang được load (hoặc vừa được set active).
                        // Giữ nguyên isLoadingHistory, để cho _onSocketInitialHistory xử lý việc set nó thành false.
                        console.log(`[ConversationStore _onSocketConversationList] Active conversation (${state.activeConversationId}) exists and its history is not yet loaded. Keeping isLoadingHistory (${state.isLoadingHistory}) as is.`);
                    }

                    return {
                        conversationList: sortedList,
                        searchResults: sortedList, // Nên cập nhật searchResults cùng lúc
                        isLoadingHistory: newIsLoadingHistory
                    };
                }, false, '_onSocketConversationList');
            },

            _onSocketInitialHistory: (payload) => {
                // Khi initial history của một conversation cụ thể được load,
                // ta có thể chắc chắn set isLoadingHistory = false và isHistoryLoaded = true.
                set({
                    isLoadingHistory: false,
                    activeConversationId: payload.conversationId,
                    isHistoryLoaded: true,
                }, false, `_onSocketInitialHistory/${payload.conversationId}`);
                useMessageStore.getState().setChatMessages(Array.isArray(payload.messages) ? payload.messages : []);
                useMessageStore.getState().setLoadingState({ isLoading: false, step: 'history_loaded', message: '' });
            },
            _onSocketNewConversationStarted: (payload) => {
                console.log(`[ConversationStore _onSocketNewConversationStarted] New Conversation ID: ${payload.conversationId}. Explicit flow: ${get().isProcessingExplicitNewChat}`);
                set(state => {
                    const newConv: ConversationMetadata = {
                        id: payload.conversationId,
                        title: payload.title || "New Chat",
                        lastActivity: payload.lastActivity || new Date().toISOString(),
                        isPinned: payload.isPinned || false,
                    };
                    const updatedList = [newConv, ...state.conversationList.filter(c => c.id !== payload.conversationId)]
                        .sort((a, b) => {
                            if (a.isPinned && !b.isPinned) return -1;
                            if (!a.isPinned && b.isPinned) return 1;
                            return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
                        });

                    return {
                        activeConversationId: payload.conversationId,
                        isHistoryLoaded: true,
                        isLoadingHistory: false,
                        conversationList: updatedList,
                        searchResults: updatedList,
                        // isProcessingExplicitNewChat: false // Reset cờ ở đây nếu nó true
                    };
                }, false, `_onSocketNewConversationStarted/${payload.conversationId}`);

                if (get().isProcessingExplicitNewChat) {
                    console.log('[ConversationStore _onSocketNewConversationStarted] Explicit new chat flow detected. Resetting message loading state.');
                    useMessageStore.getState().setLoadingState({ isLoading: false, step: 'new_chat_ready', message: '' });
                    set({ isProcessingExplicitNewChat: false }); // <<<< RESET CỜ SAU KHI XỬ LÝ
                } else {
                    console.log('[ConversationStore _onSocketNewConversationStarted] Implicit new chat flow. Message loading state will be handled by message events.');
                    // Không làm gì với messageStore.loadingState ở đây
                    // để cho sendMessage và các event liên quan tự quản lý.
                }

                useUiStore.getState().setShowConfirmationDialog(false);
            },
            _onSocketConversationDeleted: (payload) => {
                const deletedId = payload.conversationId;
                console.log(`[ConversationStore _onSocketConversationDeleted] Received confirmation for ${deletedId}`);
                set(state => {
                    const newConvList = state.conversationList.filter(conv => conv.id !== deletedId);
                    let newActiveId = state.activeConversationId;
                    let newIsHistoryLoaded = state.isHistoryLoaded;

                    if (state.activeConversationId === deletedId) {
                        console.log(`[ConversationStore _onSocketConversationDeleted] Deleted conversation ${deletedId} was active. Resetting active state.`);
                        newActiveId = null;
                        newIsHistoryLoaded = false;
                        useMessageStore.getState().resetChatUIForNewConversation(true); // Clear messages and active ID in message store
                    }
                    return {
                        conversationList: newConvList,
                        activeConversationId: newActiveId,
                        isHistoryLoaded: newIsHistoryLoaded,
                        searchResults: newConvList,
                    };
                }, false, `_onSocketConversationDeleted/${deletedId}`);
            },
            _onSocketConversationCleared: (payload) => {
                if (get().activeConversationId === payload.conversationId) {
                    useMessageStore.getState().setChatMessages(() => []);
                    useMessageStore.getState().setLoadingState({ isLoading: false, step: 'idle', message: '' });
                }
                // Optionally, update lastActivity for this conversation in conversationList
                set(state => ({
                    conversationList: state.conversationList.map(c => c.id === payload.conversationId ? { ...c, lastActivity: new Date().toISOString() } : c)
                }), false, `_onSocketConversationClearedUpdateList/${payload.conversationId}`);
            },
            _onSocketConversationRenamed: (payload) => {
                const updater = (prevList: ConversationMetadata[]) =>
                    prevList.map(conv =>
                        conv.id === payload.conversationId ? { ...conv, title: payload.newTitle, lastActivity: new Date().toISOString() } : conv
                    ).sort((a, b) => {
                        if (a.isPinned && !b.isPinned) return -1;
                        if (!a.isPinned && b.isPinned) return 1;
                        return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
                    });
                set(state => ({
                    conversationList: updater(state.conversationList),
                    searchResults: updater(state.searchResults) // Update searchResults as well
                }), false, `_onSocketConversationRenamed/${payload.conversationId}`);
            },
            _onSocketConversationPinStatusChanged: (payload) => {
                const updater = (prevList: ConversationMetadata[]) =>
                    prevList.map(conv =>
                        conv.id === payload.conversationId
                            ? { ...conv, isPinned: payload.isPinned, lastActivity: new Date().toISOString() } // <-- TẠO OBJECT MỚI
                            : conv
                    )
                        .sort((a, b) => { // Sắp xếp lại
                            if (a.isPinned && !b.isPinned) return -1;
                            if (!a.isPinned && b.isPinned) return 1;
                            return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
                        });
                set(state => ({
                    conversationList: updater(state.conversationList),
                    searchResults: updater(state.searchResults) // Cập nhật cả searchResults nếu có
                }), false, `_onSocketConversationPinStatusChanged/${payload.conversationId}`);
            },
        }),
        {
            name: "ConversationStore",
            // No persist for conversation data as it's typically fetched
        }
    )
);
