import React, { RefObject } from 'react';

interface InputFieldProps {
  inputRef: RefObject<HTMLInputElement>;
  inputText: string;
  isGenerating: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSubmit: () => void;
  handleStopGeneration: () => void;
}

export default function InputField({
                                     inputRef,
                                     inputText,
                                     isGenerating,
                                     handleInputChange,
                                     handleKeyPress,
                                     handleSubmit,
                                     handleStopGeneration,
                                   }: InputFieldProps) {
  return (
    <div className="w-full flex items-center bg-transparent p-12 border-12 mb-12">
      <input
        ref={inputRef}
        type="text"
        className="border rounded py-1 px-2 flex-grow text-black text-sm mr-2"
        value={inputText}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder="Enter text for LLM"
        aria-label="Text input for LLM prompt"
        disabled={isGenerating}
      />
      <button
        className="group relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#3a5e4d]"
        onClick={isGenerating ? handleStopGeneration : handleSubmit}
        aria-label={isGenerating ? "Stop Generation" : "Submit prompt to LLM"}
      >
        <div className="transition duration-300 group-hover:rotate-[360deg]">
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-[#FEFEFE]"
          >
            <path
              d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            ></path>
          </svg>
        </div>
      </button>
    </div>
  );
}
