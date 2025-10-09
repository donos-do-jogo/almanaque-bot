import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSendMessage, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="bg-card border-t border-border sticky bottom-0 backdrop-blur-sm bg-card/95"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-2 items-center">
          <Input
            type="text"
            placeholder="Digite sua pergunta sobre apostas..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={disabled}
            className="flex-1 bg-background border-border focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <Button
            type="submit"
            disabled={!message.trim() || disabled}
            className="bg-gradient-primary hover:opacity-90 transition-all shadow-lg hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
            size="icon"
          >
            <Send className="w-5 h-5" />
            <span className="sr-only">Enviar mensagem</span>
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ChatInput;
