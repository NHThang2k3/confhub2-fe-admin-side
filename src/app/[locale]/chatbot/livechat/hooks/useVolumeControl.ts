// hooks/useVolumeControl.ts
import { useEffect } from "react";

const useVolumeControl = (inVolume: number) => {
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--volume",
      `${Math.max(5, Math.min(inVolume * 200, 8))}px`,
    );
  }, [inVolume]);
};

export default useVolumeControl;