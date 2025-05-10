// hooks/useConnection.ts
import { useState, useCallback, useEffect, useRef } from "react"; // Added useEffect, useRef
import { useLiveAPIContext } from "../contexts/LiveAPIContext";
import { useLoggerStore } from "../lib/store-logger";

const useConnection = () => {
    // Get connection state and functions from the context
    const { connected, connect: liveAPIConnect, disconnect: liveAPIDisconnect } = useLiveAPIContext();
    const { log } = useLoggerStore(); // Logger function

    // State variables for managing connection flow
    const [isConnecting, setIsConnecting] = useState(false); // Tracks if connection attempt is in progress
    const [streamStartTime, setStreamStartTime] = useState<number | null>(null); // Timestamp when connection started
    const [connectionStatusMessage, setConnectionStatusMessage] = useState<string | null>(null); // User-facing status message
    const [error, setError] = useState<Error | null>(null); // Explicit error state

    const previousConnected = useRef(connected); // Store previous connection state

    /**
     * Requests audio permissions and initiates the connection via LiveAPIContext.
     */
    const connectWithPermissions = useCallback(async () => {
        // Prevent multiple simultaneous connection attempts
        if (isConnecting || connected) return;

        setIsConnecting(true);
        setError(null); // Clear previous errors on new attempt
        setConnectionStatusMessage("Requesting mic permission...");
        log({ date: new Date(), type: "system", message: "Attempting to connect (audio only)..." });

        try {
            // Request ONLY audio permissions.
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false,
            });

            log({ date: new Date(), type: "system", message: "Microphone permission granted." });
            setConnectionStatusMessage("Connecting...");

            // Stop the tracks from the permission stream immediately, we don't send it directly.
            // AudioRecorder handles the actual mic input stream later.
            stream.getTracks().forEach(track => track.stop());

            // Initiate the actual connection using the context's connect function.
            await liveAPIConnect(); // Assume this updates the 'connected' context state

            // The 'connected' state might update asynchronously via context provider.
            // We will rely on the useEffect below to set the final connected state.
            // Set start time optimistically here, or wait for useEffect confirmation.
            // Setting it here provides a slightly earlier timer start.
            setStreamStartTime(Date.now());
            // Don't set "Connected" message here, let the useEffect handle it based on context state.


        } catch (err) {
            console.error("Error getting media permissions or connecting:", err);
            const connectionError = err instanceof Error ? err : new Error(String(err));
            setError(connectionError); // Set the error state
            log({ date: new Date(), type: "error", message: `Connection failed: ${connectionError.message}` });

            // Set appropriate error message for the user
            if (connectionError.message.toLowerCase().includes('permission denied') || connectionError.message.toLowerCase().includes('not allowed')) {
                setConnectionStatusMessage("Mic permission denied. Please grant access.");
            } else {
                setConnectionStatusMessage(`Connection failed: ${connectionError.message}`);
            }
            setStreamStartTime(null); // Reset start time on failure
            setIsConnecting(false); // Ensure connecting is false on error
        }
        // We intentionally don't set isConnecting=false in the success path here.
        // The useEffect observing 'connected' will handle it. This prevents race conditions
        // where isConnecting becomes false before 'connected' becomes true.

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnecting, connected, liveAPIConnect, log]); // Dependencies


    /**
     * Disconnects using the LiveAPIContext function and resets local state.
     */
    const handleDisconnect = useCallback(() => {
        liveAPIDisconnect(); // Call the disconnect function from the context
        setIsConnecting(false); // Ensure connecting state is false
        setStreamStartTime(null); // Clear the start time
        setConnectionStatusMessage("Disconnected."); // Set status on explicit disconnect
        setError(null); // Clear any errors
        // log({ date: new Date(), type: "system", message: "Disconnected." }); // Context listener might log this already
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [liveAPIDisconnect, log]); // Dependencies


    /**
     * Attempts to reconnect by calling connectWithPermissions again.
     */
    const handleReconnect = useCallback(async () => {
        log({ date: new Date(), type: "system", message: "Attempting to reconnect..." });
        // Reset relevant states before attempting reconnect
        setError(null);
        setConnectionStatusMessage(null); // Clear old status/error messages
        await connectWithPermissions(); // Re-run the connection logic
    }, [connectWithPermissions, log]); // Dependency on the connect function

    // Effect to react to changes in the context's 'connected' state
    useEffect(() => {
        if (connected) {
            // Successfully connected (or remained connected)
            if (isConnecting) { // Was in the process of connecting
                 setConnectionStatusMessage("Connected"); // Set final status
                 log({ date: new Date(), type: "system", message: "Connection successful." });
            }
             // If we just connected, streamStartTime should already be set by connectWithPermissions
             // If it wasn't (e.g., connection happened very fast), set it now.
             if (streamStartTime === null) {
                 setStreamStartTime(Date.now());
             }
            setIsConnecting(false); // Now safe to set connecting to false
            setError(null); // Clear any previous errors
        } else {
            // Not connected
            if (previousConnected.current && !isConnecting) {
                // Condition: Was previously connected, and not currently in a connecting attempt
                // This indicates an unexpected drop or server-side disconnect.
                log({ date: new Date(), type: "error", message: "Connection lost unexpectedly." });
                setError(new Error("Connection lost unexpectedly.")); // Set a generic error
                setConnectionStatusMessage("Connection lost."); // Update status
                setStreamStartTime(null); // Reset timer
                setIsConnecting(false); // Ensure this is false
            } else if (!isConnecting && streamStartTime !== null) {
                 // Condition: Not connecting, but streamStartTime exists - implies a disconnect occurred
                 // This could be from handleDisconnect or an unexpected drop handled above.
                 // Reset start time if not already null.
                 setStreamStartTime(null);
                 // Don't overwrite specific messages like "Disconnected." or "Connection lost."
                 if (!connectionStatusMessage) {
                     setConnectionStatusMessage(null); // Clear status if none set
                 }
             }
             // If isConnecting is true and connected is false, it means the connection attempt is still in progress or failed.
             // The error handling within connectWithPermissions covers the failure case.
        }

        // Update previous connected state for the next render cycle
        previousConnected.current = connected;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connected, isConnecting, log]); // Run when connection state or connecting status changes


    // Return the state and handler functions for use in components
    return {
        connected, // The connection state from context
        isConnecting, // Whether a connection attempt is active
        streamStartTime, // When the stream started (for timer)
        connectionStatusMessage, // User-facing message
        setConnectionStatusMessage, // Allow external updates if needed (e.g., specific API errors)
        connectWithPermissions, // Function to initiate connection (audio only)
        handleDisconnect, // Function to disconnect
        handleReconnect, // Function to attempt reconnection (audio only)
        error // Expose the error state
    };
};

export default useConnection;