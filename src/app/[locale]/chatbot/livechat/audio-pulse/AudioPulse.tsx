import { useEffect, useRef } from "react";
import c from "classnames"; // Bạn vẫn có thể dùng classnames, hoặc dùng template literals.

const lineCount = 3;

export type AudioPulseProps = {
  active: boolean;
  volume: number;
  hover?: boolean;
};

export default function AudioPulse({ active, volume, hover }: AudioPulseProps) {
  const lines = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    let timeout: number | null = null;
    const update = () => {
      lines.current.forEach(
        (line, i) => {
          if (line) { // Thêm kiểm tra null/undefined
            line.style.height = `${Math.min(
              24,
              4 + volume * (i === 1 ? 400 : 60),
            )}px`;
          }
        }
      );
      timeout = window.setTimeout(update, 100);
    };

    update();

    return () => clearTimeout(timeout as number);
  }, [volume]);

  return (
    <div
      className={c(
        "flex w-6 justify-evenly items-center transition-all duration-500 h-1 transition-opacity ease-in-out duration-300",
        {
          "opacity-100": active,
           hover: hover
        },
      )}
    >
      {Array(lineCount)
        .fill(null)
        .map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) {
                lines.current[i] = el;
              }
            }}
            style={{ animationDelay: `${i * 133}ms` }}
            className={c("bg-neutral-30 rounded-full w-1 min-h-[4px] transition-height duration-100", {
              "bg-neutral-80": active, 
            })}
          />
        ))}
    </div>
  );
}