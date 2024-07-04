import { ChatMessageType } from './ChatMessage';

interface ChatContainerProps {
  chatMessages: ChatMessageType[];
  displayResponse: string;
  loading: boolean;
  completedTyping: boolean;
  sessionId: string;
  sanitizedHtml: (html: string) => { __html: string };
}

export default function ChatContainer({
                                        chatMessages,
                                        displayResponse,
                                        loading,
                                        completedTyping,
                                        sessionId,
                                        sanitizedHtml,
                                      }: ChatContainerProps) {
  return (
    <div id="chat-container" className="overflow-auto rounded p-4 flex space-y-2 flex-grow">
      {loading && (
        <div className="p-2 rounded-lg my-2 max-w-sm text-sm bg-gray-300 text-white self-start animate-pulse">
          Loading...
        </div>
      )}
      {chatMessages.map((message, index) => (
        <div key={index} className={`p-2 rounded-lg my-2 max-w-sm text-sm ${message.type ? 'bg-[#d3e4dd] text-lime-950 self-end' : message.text.includes('generation-stopped') ? '' : 'bg-green-100 text-stone-900 self-start'}`}>
          {index === 0 && !message.type && message.session === sessionId && !completedTyping ? (
            <span dangerouslySetInnerHTML={sanitizedHtml(displayResponse + (!completedTyping ? '<span class="cursor"></span>' : ''))}></span>
          ) : (
            <span dangerouslySetInnerHTML={sanitizedHtml(message.text)}></span>
          )}
        </div>
      ))}
    </div>
  );
}
