import { Bot } from "lucide-react";

const TypingIndicator = () => {
  return (
    <div className="flex gap-3 mb-4 animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg">
        <Bot className="w-5 h-5 text-primary-foreground" />
      </div>
      
      <div className="bg-chat-bot-bg text-chat-bot-text rounded-2xl rounded-tl-sm px-4 py-3 shadow-md">
        <div className="flex gap-1.5 items-center">
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse-glow" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse-glow" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse-glow" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
