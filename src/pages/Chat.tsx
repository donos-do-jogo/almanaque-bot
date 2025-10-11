import { useEffect } from "react";
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

export default Chat;
