import { ChatMessageType } from './ChatMessage';
import React from 'react';
import Markdown from './Markdown';
import CursorSVG from './CursorSVG';

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
    <div id="chat-container" className="overflow-auto rounded p-4 flex space-y-2 flex-grow">
      {loading && (
        <div className="p-2 rounded-lg my-2 max-w-lg text-sm bg-gray-300 text-white self-start animate-pulse">
          Loading...
        </div>
      )}
      
      {chatMessages.map((message, index) => (
        <div key={index} className={`p-2 rounded-lg my-2 text-sm ${message.type ? 'bg-[#d3e4dd] max-w-2xl text-lime-950 self-end' : message.text.includes('generation-stopped') ? '' : 'bg-green-100 text-stone-900 self-start'}`}>
          {index === 0 && !message.type && message.session === sessionId && !completedTyping ? (
            <span>
              <Markdown>{displayResponse}</Markdown>
              {!completedTyping && <CursorSVG />}
            </span>
          ) : (
            <Markdown>{message.text}</Markdown>
          )}
        </div>
      ))}
    </div>
  );
}
