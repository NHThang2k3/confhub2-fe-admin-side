// src/stores/messageStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
    ChatMessageType,
    LoadingState,
    ThoughtStep,
    ErrorUpdate,
    ChatUpdate,
    ResultUpdate,
    EmailConfirmationResult,
    ConfirmSendEmailAction,
    StatusUpdate,
    FrontendAction
} from '@/src/app/[locale]/chatbot/lib/regular-chat.types';
import { StreamingTextAnimationControls } from '@/src/hooks/chatbot/useStreamingTextAnimation';
import { generateMessageId, constructNavigationUrl, openUrlInNewTab } from '@/src/app/[locale]/chatbot/utils/chatUtils';
import { appConfig } from '@/src/middleware';
import { useSettingsStore } from './setttingsStore';
import { useSocketStore } from './socketStore';
import { useUiStore } from './uiStore';
import { useConversationStore } from './conversationStore';

const BASE_WEB_URL = appConfig.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:8386";

export interface MessageStoreState {
    chatMessages: ChatMessageType[];
    loadingState: LoadingState;
    animationControls: StreamingTextAnimationControls | null;
    isAwaitingFinalResultRef: React.MutableRefObject<boolean>;
    pendingBotMessageId: string | null;
}

export interface MessageStoreActions {
    setChatMessages: (newMessagesOrUpdater: ChatMessageType[] | ((prev: ChatMessageType[]) => ChatMessageType[])) => void;
    addChatMessage: (message: ChatMessageType) => void;
    updateMessageById: (messageId: string, updates: Partial<ChatMessageType> | ((prev: ChatMessageType) => Partial<ChatMessageType>)) => void;
    setLoadingState: (loadingState: LoadingState) => void;
    setAnimationControls: (controls: StreamingTextAnimationControls | null) => void;
    resetAwaitFlag: () => void;
    setPendingBotMessageId: (id: string | null) => void;
    sendMessage: (userInput: string) => void;
    resetChatUIForNewConversation: (clearActiveIdInOtherStores?: boolean) => void;
    _onSocketStatusUpdate: (data: StatusUpdate) => void;
    _onSocketChatUpdate: (data: ChatUpdate) => void;
    _onSocketChatResult: (data: ResultUpdate) => void;
    _onSocketChatError: (errorData: ErrorUpdate) => void;
    _onSocketEmailConfirmationResult: (result: EmailConfirmationResult) => void;
}

const initialMessageStoreState: MessageStoreState = {
    chatMessages: [],
    loadingState: { isLoading: false, step: 'idle', message: '', agentId: undefined },
    animationControls: null,
    isAwaitingFinalResultRef: { current: false },
    pendingBotMessageId: null,
};

export const useMessageStore = create<MessageStoreState & MessageStoreActions>()(
    devtools(
        (set, get) => ({
            ...initialMessageStoreState,

            setChatMessages: (newMessagesOrUpdater) => {
                if (typeof newMessagesOrUpdater === 'function') {
                    set(state => ({ chatMessages: newMessagesOrUpdater(state.chatMessages) }), false, 'setChatMessages (updater fn)');
                } else {
                    set({ chatMessages: newMessagesOrUpdater }, false, 'setChatMessages (direct array)');
                }
            },
            addChatMessage: (message) => set((state) => ({ chatMessages: [...state.chatMessages, message] }), false, 'addChatMessage'),
            updateMessageById: (messageId, updates) => set(state => ({
                chatMessages: state.chatMessages.map(msg =>
                    msg.id === messageId
                        ? { ...msg, ...(typeof updates === 'function' ? updates(msg) : updates) }
                        : msg
                )
            }), false, `updateMessageById/${messageId}`),
            setLoadingState: (loadingState) => set({ loadingState }, false, 'setLoadingState'),
            setAnimationControls: (controls) => set({ animationControls: controls }, false, 'setAnimationControls'),
            resetAwaitFlag: () => { // Đảm bảo hàm này được định nghĩa đúng
                get().isAwaitingFinalResultRef.current = false;
            },
            setPendingBotMessageId: (id) => set({ pendingBotMessageId: id }, false, 'setPendingBotMessageId'),

            resetChatUIForNewConversation: (clearActiveIdInOtherStores = true) => {
                set({
                    chatMessages: [],
                    loadingState: { isLoading: false, step: 'idle', message: '', agentId: undefined },
                    pendingBotMessageId: null,
                }, false, 'resetChatUIForNewConversation/messages');
                get().animationControls?.stopStreaming();
                get().resetAwaitFlag();
                if (clearActiveIdInOtherStores) {
                    //
                }
                useUiStore.getState().setShowConfirmationDialog(false);
            },

            sendMessage: (userInput) => {
                const { addChatMessage, setLoadingState, animationControls, resetAwaitFlag, setPendingBotMessageId } = get();
                const { isStreamingEnabled, currentLanguage } = useSettingsStore.getState();
                const { hasFatalConnectionError } = useSocketStore.getState();
                const { handleError, hasFatalError: uiHasFatalError } = useUiStore.getState();
                const { activeConversationId } = useConversationStore.getState();

                const trimmedMessage = userInput.trim();
                if (!trimmedMessage) return;

                if (hasFatalConnectionError || uiHasFatalError) {
                    handleError({ message: "Cannot send message: A critical error occurred.", type: 'error', step: 'send_message_fail_fatal' } as any, false, false);
                    return;
                }

                animationControls?.stopStreaming();
                resetAwaitFlag();
                setLoadingState({ isLoading: true, step: 'sending', message: 'Sending...', agentId: undefined });

                const newUserMessage: ChatMessageType = {
                    id: generateMessageId(), message: trimmedMessage, isUser: true, type: 'text', timestamp: new Date().toISOString(),
                };
                addChatMessage(newUserMessage);

                const botPlaceholderId = `bot-pending-${generateMessageId()}`;
                setPendingBotMessageId(botPlaceholderId);

                useSocketStore.getState().emitSendMessage({
                    userInput: trimmedMessage,
                    isStreaming: isStreamingEnabled, // Sử dụng isStreamingEnabled trực tiếp
                    language: currentLanguage.code,
                    conversationId: activeConversationId,
                });
            },

            _onSocketStatusUpdate: (data: StatusUpdate) => {
                const { agentId, step, message } = data;
                let displayMessage = message;

                if (agentId && agentId !== 'HostAgent') {
                    displayMessage = `[${agentId}] ${message}`;
                }

                set(state => ({
                    loadingState: {
                        ...state.loadingState,
                        isLoading: true,
                        step: step,
                        message: displayMessage,
                        agentId: agentId
                    }
                }), false, `_onSocketStatusUpdate/${agentId || 'unknown_agent'}/${step}`);
            },

            _onSocketChatUpdate: (update) => {
                const { animationControls, isAwaitingFinalResultRef, addChatMessage, setLoadingState, pendingBotMessageId, chatMessages, setPendingBotMessageId } = get(); // Sửa lại: không cần setPendingBotMessageId ở đây vì nó đã có ở scope ngoài
                if (!animationControls) {
                    console.warn("ChatUpdate received but no animationControls");
                    return;
                }

                const currentStreamingIdByControls = animationControls.currentStreamingId;
                const currentAgentId = get().loadingState.agentId;

                if (pendingBotMessageId) {
                    const existingBotMessage = chatMessages.find(msg => msg.id === pendingBotMessageId);
                    if (!existingBotMessage) {
                        addChatMessage({
                            id: pendingBotMessageId, message: '', isUser: false, type: 'text',
                            thoughts: [], timestamp: new Date().toISOString()
                        });
                        const streamingMessage = currentAgentId && currentAgentId !== 'HostAgent'
                            ? `[${currentAgentId}] Receiving...`
                            : 'Receiving...';
                        setLoadingState({ isLoading: true, step: 'streaming_response', message: streamingMessage, agentId: currentAgentId });
                    }

                    if (!currentStreamingIdByControls || currentStreamingIdByControls !== pendingBotMessageId) {
                        animationControls.startStreaming(pendingBotMessageId);
                    }
                    if (!isAwaitingFinalResultRef.current) isAwaitingFinalResultRef.current = true;
                    animationControls.processChunk(update.textChunk);

                } else {
                    console.warn("[MessageStore _onSocketChatUpdate] Fallback: No pendingBotMessageId or stream already active with different ID.");
                    isAwaitingFinalResultRef.current = true;
                    const newStreamingId = `streaming-${generateMessageId()}`;
                    addChatMessage({ id: newStreamingId, message: '', isUser: false, type: 'text', thoughts: [], timestamp: new Date().toISOString() });

                    const streamingMessage = currentAgentId && currentAgentId !== 'HostAgent'
                        ? `[${currentAgentId}] Receiving...`
                        : 'Receiving...';
                    // Sử dụng hàm setPendingBotMessageId của store
                    get().setPendingBotMessageId(newStreamingId);
                    setLoadingState({ isLoading: true, step: 'streaming_response', message: streamingMessage, agentId: currentAgentId });

                    animationControls.startStreaming(newStreamingId);
                    animationControls.processChunk(update.textChunk);
                }
            },

            _onSocketChatResult: (result) => {
                const {
                    animationControls,
                    isAwaitingFinalResultRef,
                    setLoadingState,
                    updateMessageById,
                    addChatMessage,
                    pendingBotMessageId,
                    setPendingBotMessageId: storeSetPendingBotMessageId,
                    chatMessages,
                    resetAwaitFlag, // <<<< ĐẢM BẢO resetAwaitFlag được destructure ở đây
                } = get();
                const { currentLocale, isStreamingEnabled } = useSettingsStore.getState(); // Lấy isStreamingEnabled
                const { setShowConfirmationDialog } = useUiStore.getState();

                animationControls?.completeStream();

                const targetMessageId = pendingBotMessageId;

                if (targetMessageId) {
                    const messageExists = chatMessages.some(msg => msg.id === targetMessageId);

                    const createMessagePayload = (existingMessageContent?: string): Partial<ChatMessageType> => {
                        let messageContent = result.message || existingMessageContent || "Task completed.";
                        let messageType: ChatMessageType['type'] = 'text';
                        let locationData: string | undefined = undefined;
                        let actionData: FrontendAction | undefined = result.action; // Gán action từ result

                        if (actionData?.type === 'openMap' && actionData.location) {
                            messageType = 'map';
                            locationData = actionData.location;
                            messageContent = result.message || `Showing map for: ${actionData.location}`;
                        } else if (actionData?.type === 'confirmEmailSend') {
                            messageType = 'text';
                            messageContent = result.message || 'Please confirm the action.';
                        } else if (actionData?.type === 'navigate' && !result.message) {
                            messageContent = `Okay, navigating...`;
                        }

                        if (!result.message && (!actionData || (actionData.type !== 'openMap' && actionData.type !== 'confirmEmailSend' && actionData.type !== 'navigate'))) {
                            messageContent = "Task completed.";
                        }

                        return {
                            message: messageContent,
                            thoughts: result.thoughts,
                            type: messageType,
                            location: locationData,
                            action: actionData, // action được thêm vào đây
                            timestamp: new Date().toISOString(),
                        };
                    };

                    if (messageExists) {
                        console.log(`[MessageStore _onSocketChatResult] Updating existing message ID: ${targetMessageId} (stream path)`);
                        updateMessageById(targetMessageId, (prevMsg) => ({
                            ...prevMsg,
                            ...createMessagePayload(prevMsg.message)
                        }));
                    } else if (!isStreamingEnabled) { // <<<< SỬA Ở ĐÂY: không gọi isStreamingEnabled()
                        console.log(`[MessageStore _onSocketChatResult] Adding new message for ID: ${targetMessageId} (non-stream path)`);
                        addChatMessage({
                            id: targetMessageId,
                            isUser: false,
                            ...createMessagePayload() // Không cần cast vì ChatMessageType đã có action
                        } as ChatMessageType); // Vẫn nên cast để an toàn nếu createMessagePayload không trả về đủ các trường required
                    } else {
                        console.warn(`[MessageStore _onSocketChatResult] Stream mode, but message ${targetMessageId} not found. Adding as new generated ID.`);
                        addChatMessage({
                            id: generateMessageId(),
                            isUser: false,
                            ...createMessagePayload()
                        } as ChatMessageType);
                    }
                } else {
                    console.warn("[MessageStore _onSocketChatResult] No pendingBotMessageId. Adding result as a new message with generated ID.");
                    addChatMessage({
                        id: generateMessageId(),
                        isUser: false,
                        message: result.message || "Result received",
                        thoughts: result.thoughts,
                        type: result.action?.type === 'openMap' ? 'map' : 'text',
                        location: result.action?.type === 'openMap' ? result.action.location : undefined,
                        action: result.action,
                        timestamp: new Date().toISOString()
                    });
                }

                resetAwaitFlag(); // <<<< Gọi resetAwaitFlag() ở đây
                setLoadingState({ isLoading: false, step: 'result_received', message: '', agentId: undefined });
                storeSetPendingBotMessageId(null);

                const action = result.action;
                if (action?.type === 'navigate' && action.url) {
                    const finalUrl = constructNavigationUrl(BASE_WEB_URL, currentLocale, action.url);
                    openUrlInNewTab(finalUrl);
                } else if (action?.type === 'confirmEmailSend' && action.payload) {
                    setShowConfirmationDialog(true, action.payload as ConfirmSendEmailAction);
                }
            },


            _onSocketChatError: (errorData: any) => { // Cập nhật type cho errorData nếu có
                const {
                    animationControls,
                    resetAwaitFlag, // Đảm bảo có ở đây
                    setChatMessages: currentStoreSetChatMessages,
                    setLoadingState,
                    setPendingBotMessageId
                } = get();
                const { activeConversationId, setActiveConversationId, setIsHistoryLoaded, setIsLoadingHistory } = useConversationStore.getState();
                const { handleError } = useUiStore.getState();

                console.error("[MessageStore _onSocketChatError] Event: Chat Error received from server:", errorData);
                resetAwaitFlag();
                animationControls?.stopStreaming();
                setPendingBotMessageId(null);

                const { step: errorStep, code: errorCode, details, message } = errorData;
                const historyLoadErrorSteps = ['history_not_found_load', 'history_load_fail_server', 'auth_required_load', 'invalid_request_load'];
                const isRelatedToActiveConv = (errorCode === 'CONVERSATION_NOT_FOUND' || errorCode === 'ACCESS_DENIED') && details?.conversationId === activeConversationId;

                if (historyLoadErrorSteps.includes(errorStep || '') || isRelatedToActiveConv) {
                    setActiveConversationId(null, { skipUiReset: true });
                    currentStoreSetChatMessages(() => []);
                    setIsHistoryLoaded(false);
                    setIsLoadingHistory(false);
                }
                const isFatal = errorCode === 'FATAL_SERVER_ERROR' || errorCode === 'AUTH_REQUIRED' || errorCode === 'ACCESS_DENIED';
                handleError(errorData, true, isFatal);
                setLoadingState({ isLoading: false, step: errorData.step || 'error_received', message: errorData.message, agentId: undefined });
            },

            _onSocketEmailConfirmationResult: (result: any) => { // Cập nhật type cho result nếu có
                const { addChatMessage, setLoadingState, setPendingBotMessageId } = get();
                const { confirmationData, setShowConfirmationDialog } = useUiStore.getState();

                if (confirmationData && result.confirmationId === confirmationData.confirmationId) { // Thêm kiểm tra confirmationData
                    setShowConfirmationDialog(false);
                }
                addChatMessage({
                    id: generateMessageId(), message: result.message, isUser: false,
                    type: result.status === 'success' ? 'text' : 'warning', timestamp: new Date().toISOString()
                });
                setLoadingState({ isLoading: false, step: `email_${result.status}`, message: '', agentId: undefined });
            },
        }),
        {
            name: "MessageStore",
        }
    )
);