import React, { useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import { Message } from "@/pages/Chat";

interface ChatContainerProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isSending: boolean;
}

export default function ChatContainer({ messages, onSendMessage, isLoading, isSending }: ChatContainerProps): JSX.Element {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  // Se estiver carregando o histórico, mostre um loader
  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center">Carregando histórico...</div>;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-10">
        {messages.map((m, index) => (
          <ChatMessage
            key={`${m.createdAt}-${index}`}
            message={m.content}
            isBot={m.role === 'assistant'}
            timestamp={new Date(m.createdAt)}
          />
        ))}
        {isSending && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSendMessage={onSendMessage} disabled={isSending} />
    </div>
  );
}
