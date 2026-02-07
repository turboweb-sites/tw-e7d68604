export interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  time: string;
  buttons?: string[];
}

interface ChatMessageProps {
  message: Message;
  onButtonClick?: (text: string) => void;
}

export default function ChatMessage({ message, onButtonClick }: ChatMessageProps) {
  const isBot = message.sender === 'bot';

  return (
    <div className={`flex w-full mb-1.5 ${isBot ? 'justify-start' : 'justify-end'} animate-fadeIn`}>
      <div
        className={`relative max-w-[85%] px-3 py-1.5 rounded-lg shadow-sm ${
          isBot
            ? 'bg-telegram-bubble text-telegram-text rounded-tl-sm'
            : 'bg-telegram-userBubble text-telegram-text rounded-tr-sm'
        }`}
      >
        <div className="text-[14.5px] leading-[1.4] whitespace-pre-wrap break-words pr-12">
          {message.text}
        </div>
        <div className={`flex items-center gap-1 justify-end -mt-3 ${isBot ? 'pr-0' : 'pr-0'}`}>
          <span className="text-[11px] text-telegram-secondary opacity-70">{message.time}</span>
          {!isBot && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-telegram-accent opacity-70">
              <polyline points="9 11 12 14 22 4"></polyline>
              <polyline points="9 11 12 14 22 4" transform="translate(-4, 0)"></polyline>
            </svg>
          )}
        </div>
        {message.buttons && message.buttons.length > 0 && (
          <div className="mt-2 flex flex-col gap-1.5 pb-1">
            {message.buttons.map((btn, idx) => (
              <button
                key={idx}
                onClick={() => onButtonClick?.(btn)}
                className="w-full text-left px-3 py-2 bg-telegram-header/60 hover:bg-telegram-header border border-telegram-border/50 rounded-lg text-telegram-accent text-[13.5px] transition-all duration-200 hover:border-telegram-accent/40 active:scale-[0.98]"
              >
                {btn}
              </button>
            ))}
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}