import { ChatMessageType } from "./ChatMessage";
import React from "react";
import Markdown from "./Markdown";
import ReactMarkdown from "react-markdown";

interface ChatContainerProps {
  chatMessages: ChatMessageType[];
  displayResponse: string;
  loading: boolean;
  completedTyping: boolean;
  sessionId: string;
}

export default function ChatContainer({
  chatMessages,
  displayResponse,
  loading,
  completedTyping,
  sessionId,
}: ChatContainerProps) {
  return (
    <div
      id="chat-container"
      className="flex flex-grow space-y-2 overflow-auto rounded p-4"
    >
      {loading && (
        <div className="my-2 max-w-lg animate-pulse self-start rounded-lg bg-gray-300 p-2 text-sm text-white">
          Loading...
        </div>
      )}
      {chatMessages.map((message, index) => (
        <div
          key={index}
          className={`my-2 rounded-lg p-2 text-sm ${message.type ? "max-w-2xl self-end bg-[#d3e4dd] text-lime-950" : message.text.includes("generation-stopped") ? "" : "self-start bg-green-100 text-stone-900"}`}
        >
          {index === 0 &&
          !message.type &&
          message.session === sessionId &&
          !completedTyping ? (
            <Markdown>{displayResponse}</Markdown>
          ) : (
            <Markdown>{message.text}</Markdown>
          )}
        </div>
      ))}
    </div>
  );
}
