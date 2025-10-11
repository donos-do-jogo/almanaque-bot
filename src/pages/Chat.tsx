import { useEffect } from "react";
import ChatHeader from "@/components/ChatHeader";
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
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <ChatHeader />
      <ChatContainer />
    </div>
  );
};

export default Chat;
