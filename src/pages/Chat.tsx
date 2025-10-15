// src/pages/Chat.tsx (Versão Final Corrigida)

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

  useEffect(() => {
    const initializeChat = async () => {
      setIsLoadingConversations(true);
      try {
        await getCurrentUser();
        console.log("✅ User is authenticated");

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
    try {
      const restOperation = post({ apiName: "ChatPersistence", path: "/chats", options: { body: { title: "Nova Conversa" } } });
      const { body } = await restOperation.response;
      const newConversation = await body.json();
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversationId(newConversation.id);
    } catch (error) {
      console.error("Erro ao criar nova conversa:", error);
      toast({ title: "Não foi possível iniciar uma nova conversa.", variant: "destructive" });
    }
  }, [toast]);

  const handleSendMessage = useCallback(async (prompt: string) => {
    if (!prompt || prompt.trim() === '') {
      toast({ title: "A mensagem não pode estar vazia.", variant: "destructive" });
      return;
    }
    if (!currentConversationId) {
      toast({ title: "Selecione ou crie uma conversa para começar.", variant: "default" });
      return;
    }
    setIsSendingMessage(true);
    const userMessage: Message = { content: prompt, role: 'user', createdAt: new Date().toISOString() };
    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages, userMessage];
      (async () => {
        try {
          await post({ apiName: "ChatPersistence", path: `/chats/${currentConversationId}/messages`, options: { body: userMessage } }).response;
          const restOperation = post({ apiName: "statsAi", path: "/chat", options: { body: { prompt, history: updatedMessages } } });
          const { body } = await restOperation.response;
          const botData = await body.json();
          const botResponseContent = botData.response || "Desculpe, não consegui processar a resposta.";
          const botMessage: Message = { content: botResponseContent, role: 'assistant', createdAt: new Date().toISOString() };
          await post({ apiName: "ChatPersistence", path: `/chats/${currentConversationId}/messages`, options: { body: botMessage } }).response;
          setMessages(prev => [...prev, botMessage]);
        } catch (error) {
          console.error("Erro no fluxo de envio de mensagem:", error);
          toast({ title: "Erro ao enviar mensagem.", variant: "destructive" });
          setMessages(prevMessages);
        } finally {
          setIsSendingMessage(false);
        }
      })();
      return updatedMessages;
    });
  }, [currentConversationId, toast]);

  // ✅ CORRIGIDO: O confirm() do navegador foi removido.
  const handleDeleteConversation = useCallback(async (id: string) => {
    try {
      const restOperation = del({
        apiName: "ChatPersistence",
        path: `/chats/${id}`
      });
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
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <ChatSidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={setCurrentConversationId}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
        />
        <div className="flex flex-col flex-1 h-screen overflow-hidden pt-16">
          <Navbar />
          <ChatContainer
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoadingMessages}
            isSending={isSendingMessage}
          />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Chat;
