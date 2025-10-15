/*import { useEffect } from "react";
import Navbar from "@/components/Navbar"; // 1. Trocado ChatHeader por Navbar
import ChatContainer from "@/components/ChatContainer";

const Chat = () => {
  useEffect(() => {
    // Previne zoom em dispositivos móveis ao focar inputs
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      );
    }
  }, []);

  return (
    // 2. Adicionado "pt-16" para criar espaço para a Navbar fixa
    <div className="flex flex-col h-screen bg-background overflow-hidden pt-16">
      <Navbar />
      <ChatContainer />
    </div>
  );
};

export default Chat; */
// src/pages/Chat.tsx (Versão Atualizada)
import { useEffect, useState, useCallback } from "react"; // 1. useCallback added
import { getCurrentUser } from 'aws-amplify/auth';
import { get, post } from 'aws-amplify/api';
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

  // 2. Combined initial data loading into a single, robust useEffect
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
        // Bonus: Automatically select the first conversation if one exists
        if (data.length > 0) {
          setCurrentConversationId(data[0].id);
        }
      } catch (error) {
        console.error("❌ Error during initialization:", error);
        toast({ title: "Erro ao carregar seus dados.", variant: "destructive" });
        // Could redirect to login here if error is from getCurrentUser
      } finally {
        setIsLoadingConversations(false);
      }
    };
    initializeChat();
  }, [toast]); // Dependency array is minimal

  // Fetch messages when conversation changes
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

  // Create a new conversation
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

  // Send a message
  const handleSendMessage = useCallback(async (prompt: string) => {
    // 3. BUG FIX: Prevent sending empty prompts to the AI
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
    // 4. FIX: Use an updater function to get the most recent state for the AI context
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
          // Optional: Revert optimistic update on failure
          setMessages(prevMessages);
        } finally {
          setIsSendingMessage(false);
        }
      })();
      return updatedMessages;
    });
  }, [currentConversationId, toast]);

  const handleDeleteConversation = async (id: string) => { /* ... */ };

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
