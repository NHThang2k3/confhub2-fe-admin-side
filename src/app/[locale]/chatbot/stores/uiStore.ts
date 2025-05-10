import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import { ConfirmSendEmailAction, ErrorUpdate, ThoughtStep } from '@/src/app/[locale]/chatbot/lib/regular-chat.types'; // Adjust path
import { generateMessageId } from '@/src/app/[locale]/chatbot/utils/chatUtils';
import { useMessageStore } from './messageStore';
import { useSocketStore } from './socketStore';
import { ChatMessageType } from '@/src/app/[locale]/chatbot/lib/regular-chat.types';

// --- Types for UI Store State ---
export interface UiStoreState {
    hasFatalError: boolean; // General fatal errors, not specific to connection
    showConfirmationDialog: boolean;
    confirmationData: ConfirmSendEmailAction | null;
    isLeftPanelOpen: boolean;
    isRightPanelOpen: boolean;
    // currentView: 'chat' | 'history'; // Consider if this is still needed or if URL path is enough
}

// --- Types for UI Store Actions ---
export interface UiStoreActions {
    setHasFatalError: (hasError: boolean) => void;
    setShowConfirmationDialog: (show: boolean, data?: ConfirmSendEmailAction | null) => void;
    toggleLeftPanel: () => void;
    setLeftPanelOpen: (isOpen: boolean) => void; // Added for explicit control
    setRightPanelOpen: (isOpen: boolean) => void;
    // setCurrentView: (view: 'chat' | 'history') => void;

    // Complex Actions
    handleError: (
        error: ErrorUpdate | { message: string; type?: 'error' | 'warning'; thoughts?: ThoughtStep[]; code?: string; step?: string; details?: any } | Error,
        stopLoadingInMessageStore?: boolean,
        isFatal?: boolean
    ) => void;
    handleConfirmSend: (confirmationId: string) => void; // User confirms email
    handleCancelSend: (confirmationId: string) => void;  // User cancels email
}

const initialUiStoreState: UiStoreState = {
    hasFatalError: false,
    showConfirmationDialog: false,
    confirmationData: null,
    isLeftPanelOpen: true,
    isRightPanelOpen: false,
    // currentView: 'chat',
};

export const useUiStore = create<UiStoreState & UiStoreActions>()(
    devtools(
        persist(
            (set, get) => ({
                ...initialUiStoreState,

                // --- Setters ---
                setHasFatalError: (hasError) => set({ hasFatalError: hasError }, false, 'setHasFatalError'),
                setShowConfirmationDialog: (show, data = null) => set({ showConfirmationDialog: show, confirmationData: data }, false, 'setShowConfirmationDialog'),
                toggleLeftPanel: () => set(state => ({ isLeftPanelOpen: !state.isLeftPanelOpen }), false, 'toggleLeftPanel'),
                setLeftPanelOpen: (isOpen) => set({ isLeftPanelOpen: isOpen }, false, 'setLeftPanelOpen'),
                setRightPanelOpen: (isOpen) => set({ isRightPanelOpen: isOpen }, false, 'setRightPanelOpen'),
                // setCurrentView: (view) => set({ currentView: view }, false, `setCurrentView/${view}`),

                // --- Complex Actions ---
                handleError: (errorInput, stopLoadingInMessageStore = true, isFatal = false) => {
                    console.error("Chat Error/Warning (UI Store):", errorInput);
                    const { animationControls, resetAwaitFlag, setLoadingState, addChatMessage } = useMessageStore.getState();

                    animationControls?.stopStreaming();
                    resetAwaitFlag();

                    let finalError: Pick<ErrorUpdate, 'message' | 'thoughts' | 'step' | 'code' | 'details'> & { errorType: 'error' | 'warning' } = {
                        message: 'An unknown error occurred.',
                        errorType: 'error',
                    };

                    if (errorInput instanceof Error) {
                        finalError.message = errorInput.message;
                    } else if (typeof errorInput === 'object' && errorInput !== null) {
                        // Check for ErrorUpdate structure or custom error object
                        if ('type' in errorInput && (errorInput.type === 'error' || errorInput.type === 'warning')) {
                             const errUpdate = errorInput as ErrorUpdate;
                            finalError.message = errUpdate.message;
                            finalError.thoughts = errUpdate.thoughts;
                            finalError.step = errUpdate.step;
                            finalError.code = errUpdate.code;
                            finalError.details = errUpdate.details;
                            finalError.errorType = errorInput.type === 'warning' ? 'warning' : 'error';
                        } else if ('message' in errorInput) {
                            const customErr = errorInput as { message: string; type?: 'error' | 'warning'; thoughts?: ThoughtStep[]; code?: string; step?: string; details?: any };
                            finalError.message = customErr.message;
                            finalError.errorType = customErr.type || 'error';
                            finalError.thoughts = customErr.thoughts;
                            finalError.step = customErr.step;
                            finalError.code = customErr.code;
                            finalError.details = customErr.details;
                        }
                    }

                    if (stopLoadingInMessageStore) {
                        setLoadingState({ isLoading: false, step: 'error', message: finalError.errorType === 'error' ? 'Error' : 'Warning' });
                    }

                    const botMessage: ChatMessageType = {
                        id: generateMessageId(),
                        message: finalError.message,
                        isUser: false,
                        type: finalError.errorType, // 'error' or 'warning'
                        thoughts: finalError.thoughts,
                        timestamp: new Date().toISOString(),
                    };
                    addChatMessage(botMessage);

                    if (isFatal || finalError.code === 'FATAL_SERVER_ERROR' || finalError.code === 'AUTH_REQUIRED' || finalError.code === 'ACCESS_DENIED') {
                        console.warn(`[UiStore] Fatal error detected (${finalError.message}, code: ${finalError.code}). Setting fatal error flag.`);
                        set({ hasFatalError: true }, false, 'handleError/setFatal');
                        if (finalError.code === 'AUTH_REQUIRED' || finalError.code === 'ACCESS_DENIED') {
                             useSocketStore.getState().setHasFatalConnectionError(true); // Also set connection specific fatal error
                             useSocketStore.getState().setIsConnected(false, null);
                             useSocketStore.getState().setIsServerReadyForCommands(false);
                        }
                    }
                },
                handleConfirmSend: (confirmationId) => {
                    const { isConnected } = useSocketStore.getState();
                    const { setLoadingState } = useMessageStore.getState();
                    const { setShowConfirmationDialog } = get();

                    if (isConnected) {
                        useSocketStore.getState().emitUserConfirmEmail(confirmationId);
                        setLoadingState({ isLoading: true, step: 'confirming_email', message: 'Sending email...' });
                    } else {
                        get().handleError({ message: 'Cannot confirm: Not connected.', type: 'error' }, false, false);
                        setShowConfirmationDialog(false);
                    }
                },
                handleCancelSend: (confirmationId) => {
                     const { isConnected } = useSocketStore.getState();
                     const { setShowConfirmationDialog } = get();
                    if (isConnected) {
                        useSocketStore.getState().emitUserCancelEmail(confirmationId);
                    } else {
                        console.warn('[UiStore] Cannot cancel: Not connected.');
                    }
                    setShowConfirmationDialog(false);
                },
            }),
            {
                name: 'chatbot-ui-storage-v1',
                storage: createJSONStorage(() => localStorage),
                partialize: (state) => ({
                    isLeftPanelOpen: state.isLeftPanelOpen,
                    isRightPanelOpen: state.isRightPanelOpen,
                    // hasFatalError, showConfirmationDialog, confirmationData are transient
                }),
                 onRehydrateStorage: () => (state) => {
                    if (state) {
                        console.log('[UiStore] Rehydrated from storage.');
                    }
                }
            }
        ),
        { name: "UiStore" }
    )
);