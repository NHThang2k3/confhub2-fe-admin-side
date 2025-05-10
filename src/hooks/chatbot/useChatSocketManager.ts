// src/hooks/chatbot/useChatSocketManager.ts
import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import {
    useSocketStore,
    useConversationStore,
    useMessageStore,
} from '@/src/app/[locale]/chatbot/stores'; // Assumes index.ts in stores
import { useStreamingTextAnimation } from './useStreamingTextAnimation';
import { appConfig } from '@/src/middleware';
import { useUpdateChatMessageCallbackForAnimation } from '../../app/[locale]/chatbot/stores/storeHooks'; // Path to your storeHooks.ts
import { useShallow } from 'zustand/react/shallow';

const SOCKET_SERVER_URL_INTERNAL = appConfig.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export function useChatSocketManager() {
    // console.log("useChatSocketManager: Rendered/Re-rendered"); // Log for debugging re-renders

    // --- Selectors for individual stable values or stable action functions ---
    const authToken = useSocketStore(state => state.authToken);
    const setSocketInstance = useSocketStore(state => state.setSocketInstance);
    const currentSocketRef = useSocketStore(state => state.socketRef);

    // --- Selectors for groups of actions using useShallow for stability ---
    const socketStoreActions = useSocketStore(
        useShallow(state => ({
            _onSocketConnect: state._onSocketConnect,
            _onSocketDisconnect: state._onSocketDisconnect,
            _onSocketConnectError: state._onSocketConnectError,
            _onSocketAuthError: state._onSocketAuthError,
            _onSocketConnectionReady: state._onSocketConnectionReady,
        }))
    );

    const conversationStoreActions = useConversationStore(
        useShallow(state => ({
            _onSocketConversationList: state._onSocketConversationList,
            _onSocketInitialHistory: state._onSocketInitialHistory,
            _onSocketNewConversationStarted: state._onSocketNewConversationStarted,
            _onSocketConversationDeleted: state._onSocketConversationDeleted,
            _onSocketConversationCleared: state._onSocketConversationCleared,
            _onSocketConversationRenamed: state._onSocketConversationRenamed,
            _onSocketConversationPinStatusChanged: state._onSocketConversationPinStatusChanged,
        }))
    );

    const messageStoreActions = useMessageStore(
        useShallow(state => ({
            _onSocketStatusUpdate: state._onSocketStatusUpdate,
            _onSocketChatUpdate: state._onSocketChatUpdate,
            _onSocketChatResult: state._onSocketChatResult,
            _onSocketChatError: state._onSocketChatError,
            _onSocketEmailConfirmationResult: state._onSocketEmailConfirmationResult,
            setAnimationControls: state.setAnimationControls, // Also include setters if they are stable
        }))
    );

    // --- Hooks for animation ---
    const updateCallbackForAnimation = useUpdateChatMessageCallbackForAnimation();
    const animationControls = useStreamingTextAnimation(updateCallbackForAnimation);

    // --- Refs for managing component lifecycle and previous values ---
    const previousAuthTokenRef = useRef(authToken);
    const isMountedRef = useRef(true);

    // Effect for component mount/unmount
    useEffect(() => {
        isMountedRef.current = true;
        // console.log("useChatSocketManager: Component Mounted");
        return () => {
            isMountedRef.current = false;
            // console.log("useChatSocketManager: Component Unmounted");
        };
    }, []);

    // Effect for setting animation controls (depends on animationControls identity and setAnimationControls stability)
    useEffect(() => {
        // console.log("useChatSocketManager: Animation Controls Effect Ran");
        if (isMountedRef.current) {
            messageStoreActions.setAnimationControls(animationControls);
        }
    }, [animationControls, messageStoreActions.setAnimationControls]); // Dependency on the specific action

    // Main effect for managing socket connection and event listeners
    useEffect(() => {
        // console.log(`useChatSocketManager: Main Socket Effect Ran. AuthToken: ${authToken}, IsConnected: ${currentSocketRef.current?.connected}`);

        if (!isMountedRef.current) {
            // console.log("useChatSocketManager: Main Socket Effect - Not mounted, returning.");
            return;
        }

        // Handle case where authToken is still undefined (initial load, not yet set)
        if (authToken === undefined) {
            // console.log("[SocketManager] Auth token still undefined, waiting.");
            if (currentSocketRef.current) {
                // console.log("[SocketManager] Auth token became undefined, disconnecting existing socket.");
                currentSocketRef.current.disconnect();
                currentSocketRef.current.removeAllListeners(); // Ensure all listeners are removed
                setSocketInstance(null); // Update store
            }
            return;
        }

        // If socket exists, is connected, and token hasn't changed, do nothing
        if (currentSocketRef.current && currentSocketRef.current.connected && previousAuthTokenRef.current === authToken) {
            // console.log("[SocketManager] Socket exists, connected, and auth token unchanged. No action.");
            return;
        }

        // If there's an existing socket instance, disconnect it before creating a new one
        // This handles token changes or if the socket disconnected unexpectedly and we need to re-init
        if (currentSocketRef.current) {
            // console.log("[SocketManager] Conditions changed or existing socket. Disconnecting previous instance.");
            currentSocketRef.current.disconnect();
            currentSocketRef.current.removeAllListeners(); // Crucial
            setSocketInstance(null); // Update store
        }

        // If authToken is explicitly null (user logged out), do not attempt to connect
        if (authToken === null) {
            // console.log("[SocketManager] Auth token is null (logged out). Will not connect.");
            previousAuthTokenRef.current = authToken; // Update ref to prevent re-running this block unnecessarily
            return;
        }

        // At this point, authToken is a string, and we need to establish a new connection
        // console.log(`[SocketManager] Attempting to connect to ${SOCKET_SERVER_URL_INTERNAL}. Has token: ${!!authToken}`);
        const newSocket = io(SOCKET_SERVER_URL_INTERNAL, {
            reconnectionAttempts: 5,
            reconnectionDelay: 1000, // Standard delay
            reconnectionDelayMax: 5000, // Max delay
            timeout: 10000, // Connection timeout
            auth: { token: authToken },
            transports: ['websocket', 'polling'], // Explicitly define transports
        });

        if (isMountedRef.current) {
            setSocketInstance(newSocket); // Update store with the new socket instance
        }
        previousAuthTokenRef.current = authToken; // Update ref with the token used for this connection

        // --- Register Socket Event Handlers ---
        // These actions are now stable thanks to useShallow

        // Socket Lifecycle Events
        newSocket.on('connect', () => {
            if (newSocket.connected && typeof newSocket.id === 'string') {
                // console.log(`[SocketManager] Socket connected with ID: ${newSocket.id}`);
                socketStoreActions._onSocketConnect(newSocket.id);
            } else {
                // This case might happen if 'connect' fires before id is fully assigned
                // console.warn(`[SocketManager] 'connect' event, connected: ${newSocket.connected}, id: ${newSocket.id}. Awaiting full establishment or 'connection_ready'.`);
            }
        });
        newSocket.on('disconnect', socketStoreActions._onSocketDisconnect);
        newSocket.on('connect_error', socketStoreActions._onSocketConnectError);
        newSocket.on('auth_error', socketStoreActions._onSocketAuthError); // Custom event from server for auth failures
        newSocket.on('connection_ready', socketStoreActions._onSocketConnectionReady); // Custom event when server confirms readiness

        // Conversation Store Events
        newSocket.on('conversation_list', conversationStoreActions._onSocketConversationList);
        newSocket.on('initial_history', conversationStoreActions._onSocketInitialHistory);
        newSocket.on('new_conversation_started', conversationStoreActions._onSocketNewConversationStarted);
        newSocket.on('conversation_deleted', conversationStoreActions._onSocketConversationDeleted);
        newSocket.on('conversation_cleared', conversationStoreActions._onSocketConversationCleared);
        newSocket.on('conversation_renamed', conversationStoreActions._onSocketConversationRenamed);
        newSocket.on('conversation_pin_status_changed', conversationStoreActions._onSocketConversationPinStatusChanged);

        // Message Store Events
        newSocket.on('status_update', messageStoreActions._onSocketStatusUpdate);
        newSocket.on('chat_update', messageStoreActions._onSocketChatUpdate);
        newSocket.on('chat_result', messageStoreActions._onSocketChatResult);
        newSocket.on('chat_error', messageStoreActions._onSocketChatError); // Server-side chat processing errors
        newSocket.on('email_confirmation_result', messageStoreActions._onSocketEmailConfirmationResult);

        // Socket.IO Client-Specific Reconnection Events
        newSocket.io.on('reconnect_attempt', (attemptNumber) => {
            // console.log(`[SocketManager] Reconnect attempt ${attemptNumber}`);
            // Optionally update UI store to show "Reconnecting..."
        });
        newSocket.io.on('reconnect_error', (error) => {
            // console.error('[SocketManager] Reconnect error:', error);
            // Potentially call _onSocketConnectError if it's a persistent failure
        });
        newSocket.io.on('reconnect_failed', () => {
            // console.error('[SocketManager] Failed to reconnect after multiple attempts.');
            // Definitely treat this as a connection error
            socketStoreActions._onSocketConnectError(new Error("Failed to reconnect to server."));
        });
        newSocket.io.on('reconnect', (attemptNumber) => {
            // console.log(`[SocketManager] Successfully reconnected after ${attemptNumber} attempts. Socket ID: ${newSocket.id}`);
            // The 'connect' event should also fire, which handles _onSocketConnect
        });

        // Generic error listener (less common for application errors, more for transport issues)
        newSocket.on('error', (error) => {
            // console.error('[SocketManager] Generic socket.on("error"):', error);
        });


        // Cleanup function for this effect
        return () => {
            // console.log(`[SocketManager] Cleaning up socket instance (ID: ${newSocket.id || 'N/A'}) from main effect.`);
            newSocket.disconnect();
            newSocket.removeAllListeners(); // Remove all listeners for this specific instance

            // Critical: Only set socketRef to null in the store IF the socket being cleaned up
            // is THE CURRENT socket in the store. This avoids race conditions if the effect
            // runs multiple times quickly.
            if (useSocketStore.getState().socketRef.current === newSocket) {
                 // console.log("[SocketManager] Cleanup: Current store socket matches this newSocket. Setting store ref to null.");
                // setSocketInstance(null); // This might be redundant if disconnect triggers _onSocketDisconnect which updates the store
                                         // However, explicit can be safer. Test behavior.
                                         // If _onSocketDisconnect always fires and properly nullifies, this might not be needed.
            } else {
                // console.log("[SocketManager] Cleanup: Current store socket does NOT match this newSocket. Not setting store ref to null here.");
            }
        };
    }, [
        authToken, // Primary trigger for connection changes
        setSocketInstance, // Stable action
        currentSocketRef,  // Stable ref object (its .current changes, but the ref object itself is stable)
        // Action objects, now stabilized by useShallow
        socketStoreActions,
        conversationStoreActions,
        messageStoreActions,
    ]); // Dependencies for the main socket effect

    return null; // This hook does not render anything itself
}