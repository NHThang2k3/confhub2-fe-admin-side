// src/app/[locale]/chatbot/hooks/useStreamingTextAnimation.ts
import { useState, useRef, useCallback, useEffect } from 'react';

const ANIMATION_INTERVAL_MS = 10;
const MIN_CHARS_PER_INTERVAL = 10;
const MAX_CHARS_PER_INTERVAL = 20;
const EASING_THRESHOLD_CHARS = MAX_CHARS_PER_INTERVAL * 1.5; // ~30 chars

export interface StreamingTextAnimationConfig {
    animationIntervalMs?: number;
    minCharsPerInterval?: number;
    maxCharsPerInterval?: number;
    easingThresholdChars?: number;
}

export interface StreamingTextAnimationControls {
    startStreaming: (messageId: string) => void;
    processChunk: (textChunk: string) => void;
    completeStream: () => void;
    stopStreaming: () => void;
    isStreaming: boolean;
    currentStreamingId: string | null;
}

/**
 * Manages the animation logic for streaming text updates.
 * @param onContentUpdate Callback to update the message content in the parent state.
 *                        Receives (messageId: string, newContent: string).
 * @param config Optional configuration for animation parameters.
 */
export function useStreamingTextAnimation(
    onContentUpdate: (messageId: string, newContent: string) => void,
    config?: StreamingTextAnimationConfig
): StreamingTextAnimationControls {
    const {
        animationIntervalMs = ANIMATION_INTERVAL_MS,
        minCharsPerInterval = MIN_CHARS_PER_INTERVAL,
        maxCharsPerInterval = MAX_CHARS_PER_INTERVAL,
        easingThresholdChars = EASING_THRESHOLD_CHARS
    } = config || {};

    const streamingMessageIdRef = useRef<string | null>(null);
    const fullStreamedTextRef = useRef<string>(''); // Buffer for the complete text of the current stream
    const displayedTextLengthRef = useRef<number>(0); // How much of the buffer is currently displayed
    const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isStreamingCompleteRef = useRef<boolean>(false); // Flag indicating the server finished sending chunks
    const isMountedRef = useRef(true);

    const [isStreaming, setIsStreaming] = useState(false); // Expose streaming status

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            // Ensure timer is cleared on unmount
            if (animationTimerRef.current) {
                clearTimeout(animationTimerRef.current);
                animationTimerRef.current = null;
            }
        };
    }, []);

    const stopAnimation = useCallback(() => {
        if (animationTimerRef.current) {
            clearTimeout(animationTimerRef.current);
            animationTimerRef.current = null;
            // console.log("Animation explicitly stopped:", streamingMessageIdRef.current);
        }
        // Ensure the final state is displayed if stopped prematurely
        if (streamingMessageIdRef.current && displayedTextLengthRef.current < fullStreamedTextRef.current.length) {
            onContentUpdate(streamingMessageIdRef.current, fullStreamedTextRef.current);
            displayedTextLengthRef.current = fullStreamedTextRef.current.length;
        }
         // Don't reset refs here, allow `startStreaming` to do that
        setIsStreaming(false);
    }, [onContentUpdate]);

    const animateText = useCallback(() => {
        if (!isMountedRef.current || !streamingMessageIdRef.current || animationTimerRef.current === null) {
             setIsStreaming(false); // Should not be animating if these conditions fail
            return;
        }

        const targetLength = fullStreamedTextRef.current.length;
        const currentLength = displayedTextLengthRef.current;
        const streamingId = streamingMessageIdRef.current;

        if (currentLength < targetLength) {
            const remainingChars = targetLength - currentLength;

            // Calculate base chars to add (catch-up logic)
            const charsToAddFactor = Math.max(1, Math.floor(remainingChars / 10));
            const baseCharsToAdd = Math.min(
                remainingChars,
                Math.max(minCharsPerInterval, Math.min(maxCharsPerInterval, charsToAddFactor))
            );

            // Apply easing (slow down near the end)
            let finalCharsToAdd = baseCharsToAdd;
            if (remainingChars > 0 && remainingChars <= easingThresholdChars) {
                const progressRatio = remainingChars / easingThresholdChars;
                const slowdownFactor = Math.sqrt(progressRatio); // Ease-out effect
                finalCharsToAdd = Math.max(
                    1,
                    Math.min(baseCharsToAdd, Math.ceil(baseCharsToAdd * slowdownFactor))
                );
                finalCharsToAdd = Math.min(finalCharsToAdd, remainingChars); // Ensure not exceeding remaining
            }

            // Update content if there's something to add
            if (finalCharsToAdd > 0) {
                const newLength = currentLength + finalCharsToAdd;
                const textToDisplay = fullStreamedTextRef.current.substring(0, newLength);
                displayedTextLengthRef.current = newLength;

                onContentUpdate(streamingId, textToDisplay); // Call parent update function

                // Schedule next frame
                animationTimerRef.current = setTimeout(animateText, animationIntervalMs);
            } else {
                 // finalCharsToAdd is 0, check if stream ended
                if (!isStreamingCompleteRef.current) {
                     // Waiting for more chunks
                    animationTimerRef.current = setTimeout(animateText, animationIntervalMs * 2);
                } else {
                     // Displayed everything and stream ended
                    stopAnimation();
                    // console.log("Animation completed naturally (post-calc):", streamingId);
                }
            }
        } else if (!isStreamingCompleteRef.current) {
             // Displayed all current text, but stream not finished, wait for chunks
            animationTimerRef.current = setTimeout(animateText, animationIntervalMs * 2);
        } else {
            // Displayed all text AND stream finished
            stopAnimation();
            // console.log("Animation completed naturally (already displayed):", streamingId);
        }
    }, [
        onContentUpdate, stopAnimation,
        animationIntervalMs, minCharsPerInterval, maxCharsPerInterval, easingThresholdChars
     ]); // Dependencies: callbacks and config values

    const startStreaming = useCallback((messageId: string) => {
        stopAnimation(); // Stop any previous animation
        console.log("[StreamingText] Starting stream for ID:", messageId);
        streamingMessageIdRef.current = messageId;
        fullStreamedTextRef.current = '';
        displayedTextLengthRef.current = 0;
        isStreamingCompleteRef.current = false;
        setIsStreaming(true);
        // Don't start animation immediately, wait for the first chunk in processChunk
    }, [stopAnimation]);

    const processChunk = useCallback((textChunk: string) => {
        if (!streamingMessageIdRef.current || !textChunk) return;

        fullStreamedTextRef.current += textChunk;

        // Start animation loop ONLY if it's not already running
        if (!animationTimerRef.current) {
            // console.log("[StreamingText] First chunk received, starting animation:", streamingMessageIdRef.current);
             // Ensure we don't start multiple timers
            if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
            animationTimerRef.current = setTimeout(animateText, animationIntervalMs);
        }
        setIsStreaming(true); // Ensure it's marked as streaming
    }, [animateText, animationIntervalMs]);

    const completeStream = useCallback(() => {
        console.log("[StreamingText] Stream marked as complete by server:", streamingMessageIdRef.current);
        isStreamingCompleteRef.current = true;
        // Animation loop (`animateText`) will naturally stop itself when text is fully displayed
        // No need to call stopAnimation() here unless immediate stop is desired.
        // Let it finish rendering the last buffered chunks.
        // Consider setting isStreaming to false here or let animateText handle it.
        // Setting it here might be slightly premature if animation is still running.
        // setIsStreaming(false); // Let animateText handle this when it stops naturally
    }, []);

     const stopStreaming = useCallback(() => {
        console.log("[StreamingText] Force stopping stream:", streamingMessageIdRef.current);
        stopAnimation(); // Explicitly stop the animation loop
        // Reset internal state
        streamingMessageIdRef.current = null;
        fullStreamedTextRef.current = '';
        displayedTextLengthRef.current = 0;
        isStreamingCompleteRef.current = false;
        setIsStreaming(false);
    }, [stopAnimation]);


    return {
        startStreaming,
        processChunk,
        completeStream,
        stopStreaming,
        isStreaming, // Expose the current streaming state
        currentStreamingId: streamingMessageIdRef.current // Expose the ID being streamed
    };
}