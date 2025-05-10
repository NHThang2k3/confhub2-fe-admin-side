// hooks/useTimer.ts
import { useState, useEffect } from "react";

const useTimer = (isConnecting: boolean, connected: boolean, streamStartTime: number | null) => {
    const [elapsedTime, setElapsedTime] = useState(0);
    const [showTimer, setShowTimer] = useState(false);

     useEffect(() => {
        let intervalId: NodeJS.Timeout | undefined;

        if (isConnecting) {
            setShowTimer(true);
        } else if (connected && streamStartTime) {
            setShowTimer(true);
            intervalId = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - streamStartTime) / 1000));
            }, 1000);
        } else {
            setShowTimer(false);
            if (intervalId) {
                clearInterval(intervalId);
            }
            setElapsedTime(0);
        }

        return () => clearInterval(intervalId);
    }, [connected, streamStartTime, isConnecting]);

    const handleCloseTimer = () => {
        setShowTimer(false);
    }

    return { elapsedTime, showTimer, handleCloseTimer };
};

export default useTimer;