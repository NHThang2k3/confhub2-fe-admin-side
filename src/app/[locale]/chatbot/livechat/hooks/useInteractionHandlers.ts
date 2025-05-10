// hooks/useInteractionHandlers.ts
import { ClientContentMessage, StreamingLog } from "../multimodal-live-types"; // Import StreamingLog if not already
import { useLoggerStore } from "../lib/store-logger"; // Import store to get current logs length

interface InteractionHandlersProps {
    connected: boolean;
    connectWithPermissions: () => Promise<void>;
    setMuted: (muted: boolean) => void;
    client: any;
    log: (logEntry: StreamingLog) => void; // Make sure type is specific
    // Modify to accept the index of the sent log
    startLoading: (sentLogIndex: number) => void;
    stopLoading: () => void; // Add a separate function for stopping on error
}

const useInteractionHandlers = ({
    connected,
    connectWithPermissions,
    setMuted,
    client,
    log,
    // Use the new props
    startLoading,
    stopLoading
}: InteractionHandlersProps) => {
    // Get current logs length to determine the index of the next log
    // Note: This assumes log() adds to the end synchronously or predictably.
    // If log is async, this might need adjustment. Zustand's set is sync by default.

    const handleSendMessage = async (textInput: string) => {
        if (!connected || textInput.trim() === "") {
            return;
        }

        // Get the index where the new log will be added
        const currentLogs = useLoggerStore.getState().logs;
        const nextLogIndex = currentLogs.length;

        console.log(`[handleSendMessage] Triggered. Next log index: ${nextLogIndex}. Setting loading TRUE.`);
        // Pass the index where the 'send.text' log will be
        startLoading(nextLogIndex);

        try {
            const parts = [{ text: textInput }];
            // It's better to log *before* the async call if possible,
            // or handle potential state changes if log happens after await
            const clientContentMessage: ClientContentMessage = {
                clientContent: {
                    turns: [{ role: "user", parts }],
                    turnComplete: true,
                },
            };

            const sendLogEntry: StreamingLog = { // Define the log entry explicitly
                 date: new Date(),
                 type: "send.text",
                 message: clientContentMessage,
                 count: 1, // Assuming count is needed by store logic
            };

            log(sendLogEntry); // Log the message *before* sending if safe

            // If log must happen after: Be aware the index might change if other logs occur between
            // getting length and logging here. Logging before is safer for index stability.
            await client.send(parts);

            // Log *after* send if required by logic (less safe for index tracking)
            // log(sendLogEntry);

            // DO NOT stop loading here. Let the useEffect handle it based on server response.

        } catch (error) {
            console.error("Failed to send message:", error);
            log({ // Optionally log the error
                date: new Date(),
                type: "error",
                message: `Failed to send message: ${error instanceof Error ? error.message : String(error)}`,
                count: 1,
            });
            console.log("[handleSendMessage] Error occurred. Setting loading FALSE.");
            // Stop loading only if the send itself fails
            stopLoading();
        }
    };

    const handleStartVoice = async () => {
        if (!connected) {
            await connectWithPermissions();
        }
        setMuted(false);
    };

    return { handleSendMessage, handleStartVoice };
}

export default useInteractionHandlers;