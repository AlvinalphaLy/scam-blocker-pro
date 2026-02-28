import { Flag } from "lucide-react";

interface ChatMessageProps {
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  onFlag?: () => void;
  flagged?: boolean;
  feedbackText?: string;
}

const ChatMessage = ({ sender, text, timestamp, onFlag, flagged, feedbackText }: ChatMessageProps) => {
  const isBot = sender === "bot";

  return (
    <div className={`flex flex-col ${isBot ? "items-start" : "items-end"} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isBot
            ? "bg-destructive/10 border border-destructive/20 rounded-tl-sm"
            : "bg-primary/15 border border-primary/20 rounded-tr-sm"
        }`}
      >
        <p className="text-sm leading-relaxed">{text}</p>
      </div>
      <div className="flex items-center gap-2 mt-1 px-1">
        <span className="text-[10px] text-muted-foreground">{timestamp}</span>
        {isBot && onFlag && (
          <button
            onClick={onFlag}
            className={`flex items-center gap-1 text-[10px] font-medium transition-all ${
              flagged
                ? "text-warning"
                : "text-primary border border-primary/40 rounded-full px-2 py-0.5 animate-pulse hover:animate-none hover:bg-primary hover:text-primary-foreground"
            }`}
          >
            <Flag className="w-3 h-3" />
            {flagged ? "Flagged" : "Flag Tactic ↑"}
          </button>
        )}
      </div>
      {feedbackText && (
        <div className="mt-1 max-w-[80%] px-3 py-2 rounded-lg bg-success/10 border border-success/20">
          <p className="text-xs text-success">{feedbackText}</p>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
