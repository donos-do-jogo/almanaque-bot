// src/pages/Chat.tsx (Versão Final com Layout Corrigido)

import { useEffect, useState, useCallback } from "react";
import { get, post, del } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';
import Navbar from "@/components/Navbar";
import ChatContainer from "@/components/ChatContainer";
import { ChatSidebar } from "@/components/ChatSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useToast } from "@/components/ui/use-toast";

export interface Conversation {
  id: string;
  title: string;
  updatedAt?: string;
}

export interface Message {
  content: string;
  role: 'user' | 'assistant';
  createdAt: string;
}

const Chat = () => {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // ... (todas as suas funções e hooks como useEffect, handleSendMessage, etc. permanecem exatamente iguais) ...
  useEffect(() => {
    const initializeChat = async () => {
      setIsLoadingConversations(true);
      try {
        await getCurrentUser();
        const restOperation = get({ apiName: "ChatPersistence", path: "/chats" });
        const { body } = await restOperation.response;
        const data = await body.json() as Conversation[];
        setConversations(data);
        if (data.length > 0) {
          setCurrentConversationId(data[0].id);
        }
      } catch (error) {
        console.error("❌ Error during initialization:", error);
        toast({ title: "Erro ao carregar seus dados.", variant: "destructive" });
      } finally {
        setIsLoadingConversations(false);
      }
    };
    initializeChat();
  }, [toast]);

  useEffect(() => {
    if (!currentConversationId) {
      setMessages([]);
      return;
    }
    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const restOperation = get({ apiName: "ChatPersistence", path: `/chats/${currentConversationId}/messages` });
        const { body } = await restOperation.response;
        const data = await body.json();
        setMessages(data);
      } catch (error) {
        console.error("Erro ao buscar mensagens:", error);
        toast({ title: "Erro ao carregar o histórico da conversa.", variant: "destructive" });
      } finally {
        setIsLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [currentConversationId, toast]);

  const handleNewConversation = useCallback(async () => {
    setCurrentConversationId(null);
    setMessages([]);
  }, []);

  const handleSendMessage = useCallback(async (prompt: string) => {
    if (!prompt || prompt.trim() === '') {
      toast({ title: "A mensagem não pode estar vazia.", variant: "destructive" });
      return;
    }
    setIsSendingMessage(true);

    const isNewConversation = !currentConversationId;
    const userMessage: Message = { content: prompt, role: 'user', createdAt: new Date().toISOString() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    let conversationId = currentConversationId;
    let finalMessages: Message[] = [];

    try {
      if (isNewConversation) {
        const titleResponse = await post({ apiName: "statsAi", path: "/chat", options: { body: { prompt } } }).response;
        const titleData = await titleResponse.body.json();
        const newTitle = titleData.title || "Nova Conversa";

        const createChatResponse = await post({ apiName: "ChatPersistence", path: "/chats", options: { body: { title: newTitle } } }).response;
        const newConversation = await createChatResponse.body.json();
        conversationId = newConversation.id;

        await post({ apiName: "ChatPersistence", path: `/chats/${conversationId}/messages`, options: { body: userMessage } }).response;

        const chatResponse = await post({ apiName: "statsAi", path: "/chat", options: { body: { prompt, history: [userMessage] } } }).response;
        const botData = await chatResponse.body.json();
        const botResponseContent = botData.response || "Desculpe, não consegui processar a resposta.";
        const botMessage: Message = { content: botResponseContent, role: 'assistant', createdAt: new Date().toISOString() };

        await post({ apiName: "ChatPersistence", path: `/chats/${conversationId}/messages`, options: { body: botMessage } }).response;

        setConversations(prev => [newConversation, ...prev]);
        finalMessages = [userMessage, botMessage];

      } else {
        if (!conversationId) throw new Error("ID da conversa é nulo.");

        const historyForAI = [...messages, userMessage];

        await post({ apiName: "ChatPersistence", path: `/chats/${conversationId}/messages`, options: { body: userMessage } }).response;
        const chatResponse = await post({ apiName: "statsAi", path: "/chat", options: { body: { prompt, history: historyForAI } } }).response;
        const botData = await chatResponse.body.json();
        const botResponseContent = botData.response || "Desculpe, não consegui processar a resposta.";
        const botMessage: Message = { content: botResponseContent, role: 'assistant', createdAt: new Date().toISOString() };

        setMessages(prev => [...prev, botMessage]);
        await post({ apiName: "ChatPersistence", path: `/chats/${conversationId}/messages`, options: { body: botMessage } }).response;

        setConversations(prev => {
          const conversationToMove = prev.find(c => c.id === conversationId);
          if (!conversationToMove) return prev;
          const otherConversations = prev.filter(c => c.id !== conversationId);
          return [conversationToMove, ...otherConversations];
        });
      }

      if (isNewConversation && conversationId) {
        setCurrentConversationId(conversationId);
        setMessages(finalMessages);
      }

    } catch (error) {
      console.error("Erro no fluxo de envio de mensagem:", error);
      toast({ title: "Erro ao enviar mensagem.", variant: "destructive" });
      setMessages(prev => prev.filter(msg => msg.createdAt !== userMessage.createdAt));
    } finally {
      setIsSendingMessage(false);
    }
  }, [currentConversationId, messages, toast]);

  const handleDeleteConversation = useCallback(async (id: string) => {
    try {
      const restOperation = del({ apiName: "ChatPersistence", path: `/chats/${id}` });
      await restOperation.response;
      setConversations(prev => prev.filter(convo => convo.id !== id));
      if (currentConversationId === id) {
        setCurrentConversationId(null);
        setMessages([]);
      }
      toast({ title: "Conversa excluída com sucesso." });
    } catch (error) {
      console.error("Erro ao excluir conversa:", error);
      toast({ title: "Não foi possível excluir a conversa.", variant: "destructive" });
    }
  }, [currentConversationId, toast]);

  return (
    <SidebarProvider>
      {/* --- ✅ INÍCIO DA CORREÇÃO DE LAYOUT --- */}
      <div className="flex h-screen w-full bg-background">
        <ChatSidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={setCurrentConversationId}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
        />

        {/* Este 'main' é o container principal do seu chat. */}
        {/* 'flex-1' faz com que ele ocupe todo o espaço restante. */}
        {/* 'overflow-hidden' previne barras de rolagem duplas. */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <ChatContainer
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoadingMessages}
            isSending={isSendingMessage}
          />
        </main>
      </div>
      {/* --- FIM DA CORREÇÃO DE LAYOUT --- */}
    </SidebarProvider>
  );
};

export default Chat;
