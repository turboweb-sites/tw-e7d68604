interface BotInfoProps {
  name: string;
  status: string;
  emoji: string;
}

export default function BotInfo({ name, status, emoji }: BotInfoProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-telegram-header border-b border-telegram-border min-h-[56px]">
      <div className="flex items-center gap-3">
        <button className="text-telegram-accent hover:text-white transition-colors p-1">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xl shadow-lg">
          {emoji}
        </div>
        <div className="flex flex-col">
          <span className="text-telegram-text font-semibold text-[15px] leading-tight">{name}</span>
          <span className="text-telegram-accent text-[13px] leading-tight">{status}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button className="text-telegram-secondary hover:text-white transition-colors p-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>
        <button className="text-telegram-secondary hover:text-white transition-colors p-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
        </button>
        <button className="text-telegram-secondary hover:text-white transition-colors p-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
          </svg>
        </button>
      </div>
    </div>
  );
}