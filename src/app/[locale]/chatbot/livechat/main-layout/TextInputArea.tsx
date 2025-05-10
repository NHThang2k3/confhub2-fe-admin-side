// TextInputArea.tsx
import React, { useRef, useState } from "react";
import cn from "classnames";

type TextInputAreaProps = {
  connected: boolean;
  onSubmit: (text: string) => void;
};

const TextInputArea: React.FC<TextInputAreaProps> = ({
  connected,
  onSubmit,
}) => {
  const [textInput, setTextInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    onSubmit(textInput);
    setTextInput("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div
      className={cn(
        "flex items-center p-2 border border-gray-800 rounded-lg",
        {
          "opacity-50 cursor-not-allowed": !connected,
        },
      )}
    >
      <textarea
        className="flex-grow bg-transparent border-none text-gray-200 text-sm resize-none h-10 py-2 px-0 outline-none placeholder-gray-500 disabled:cursor-not-allowed"
        ref={inputRef}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit();
          }
        }}
        onChange={(e) => setTextInput(e.target.value)}
        value={textInput}
        placeholder="Type something..."
        disabled={!connected}
      />
      <button
        className="material-symbols-outlined filled p-2 text-gray-500 rounded cursor-pointer disabled:cursor-not-allowed disabled:text-gray-700 hover:text-gray-200"
        onClick={handleSubmit}
        disabled={!connected}
      >
        send
      </button>
    </div>
  );
};

export default TextInputArea;