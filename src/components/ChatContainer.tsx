/*import React, { useState, useRef, useEffect, useCallback } from "react";
import { post } from "aws-amplify/api";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  status?: "pending" | "sent" | "error";
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    text: "Olá! 👋 Bem-vindo ao Almanaque Bot. Sou seu assistente pessoal para apostas esportivas. Posso ajudar com:\n\n• 🎯 Análise de odds e probabilidades\n• 💡 Dicas de apostas\n• 📊 Estatísticas de times e jogadores\n• 🧠 Estratégias de apostas\n\nO que você gostaria de saber?",
    isBot: true,
    timestamp: new Date(),
  },
];

const makeId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? (crypto as any).randomUUID()
    : Date.now().toString();

export default function ChatContainer(): JSX.Element {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // ref para evitar stale closures
  const messagesRef = useRef<Message[]>(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // request id para ignorar respostas antigas
  const requestIdRef = useRef(0);

  // scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text || !text.trim()) return;

    const userId = makeId();
    const botId = makeId();

    const userMessage: Message = {
      id: userId,
      text,
      isBot: false,
      timestamp: new Date(),
      status: "sent",
    };

    const botPlaceholder: Message = {
      id: botId,
      text: "",
      isBot: true,
      timestamp: new Date(),
      status: "pending",
    };

    setMessages((prev) => [...prev, userMessage, botPlaceholder]);
    setIsTyping(true);

    const historyForBackend = messagesRef.current.map((m) => ({
      text: m.text,
      isBot: m.isBot,
    }));
    historyForBackend.push({ text, isBot: false });

    const myRequestId = ++requestIdRef.current;

    try {
      const restOperation = await post({
        apiName: "statsAi",
        path: "/chat",
        options: { body: { prompt: text, history: historyForBackend } },
      });

      let data: any = null;
      if (restOperation && (restOperation as any).response) {
        const { body } = await (restOperation as any).response;
        data = await body.json();
      } else {
        data = restOperation;
      }

      if (requestIdRef.current !== myRequestId) return;

      const botText =
        (data &&
          (data.response ??
            data.text ??
            (typeof data === "string" ? data : ""))) ||
        "⚠️ Nenhuma resposta do servidor.";

      setMessages((prev) =>
        prev.map((m) =>
          m.id === botId
            ? { ...m, text: botText, status: "sent", timestamp: new Date() }
            : m
        )
      );
    } catch (err: any) {
      console.error("Error fetching bot response:", err);
      if (requestIdRef.current !== myRequestId) return;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === botId
            ? {
              ...m,
              text: "Desculpe, não foi possível conectar ao servidor. Tente novamente.",
              status: "error",
              timestamp: new Date(),
            }
            : m
        )
      );
    } finally {
      if (requestIdRef.current === myRequestId) setIsTyping(false);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen w-full"> */
//{/* Chat messages */}
/*<div className="flex-1 overflow-y-auto w-full px-6 py-6">
  <div className="max-w-screen-xl mx-auto flex flex-col gap-4">
    {messages.map((m) => (
      <ChatMessage
        key={m.id}
        message={m.text}
        isBot={m.isBot}
        timestamp={m.timestamp}
      />
    ))}
    {isTyping && <TypingIndicator />}
    <div ref={messagesEndRef} />
  </div>
</div>

// {/* Chat input }
/* <div className="w-full border-t p-4">
  <div className="max-w-screen-xl mx-auto">
    <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
  </div>
</div>
</div>
);
} */

// src/components/ChatContainer.tsx (Versão Simplificada)

import React, { useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import { Message } from "@/pages/Chat"; // Importar a interface do Chat.tsx

interface ChatContainerProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean; // Para mostrar um loader geral
  isSending: boolean; // Para o typing indicator e desabilitar o input
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
      <div className="flex-1 overflow-y-auto p-6">
        {messages.map((m, index) => (
          <ChatMessage
            key={`${m.createdAt}-${index}`} // Usar uma chave mais robusta
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
