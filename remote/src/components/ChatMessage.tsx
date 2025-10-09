import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isBot: boolean;
  timestamp: Date;
}

const ChatMessage = ({ message, isBot, timestamp }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex gap-3 mb-4 animate-fade-in",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      {isBot && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg">
          <Bot className="w-5 h-5 text-primary-foreground" />
        </div>
      )}
      
      <div className={cn("flex flex-col gap-1 max-w-[75%] md:max-w-[60%]")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 shadow-md transition-all hover:shadow-lg",
            isBot
              ? "bg-chat-bot-bg text-chat-bot-text rounded-tl-sm"
              : "bg-chat-user-bg text-chat-user-text rounded-tr-sm"
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message}
          </p>
        </div>
        <span className={cn(
          "text-xs text-muted-foreground px-2",
          isBot ? "text-left" : "text-right"
        )}>
          {timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {!isBot && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center shadow-md">
          <User className="w-5 h-5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
