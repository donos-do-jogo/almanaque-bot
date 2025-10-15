import { useState } from "react";
import { Plus, MessageSquare, Trash2 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Conversation } from "@/pages/Chat"; // Verifique se o caminho para seu arquivo Chat.tsx está correto

// 1. Importa o novo componente de diálogo
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";

interface ChatSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
}

export function ChatSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}: ChatSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // 2. Adiciona estados para controlar o diálogo
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  // Função para abrir o diálogo e guardar o ID da conversa a ser deletada
  const handleDeleteClick = (id: string) => {
    setConversationToDelete(id);
    setIsDialogOpen(true);
  };

  // Função chamada quando a exclusão é confirmada dentro do diálogo
  const handleConfirmDelete = () => {
    if (conversationToDelete) {
      onDeleteConversation(conversationToDelete);
    }
    // Fecha o diálogo e limpa o estado
    setIsDialogOpen(false);
    setConversationToDelete(null);
  };

  return (
    <>
      <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
        <div className="flex flex-col h-full">
          {/* ... (código do cabeçalho e botão 'Nova Conversa' permanece o mesmo) ... */}
          <div className="flex items-center justify-between p-4 border-b">
            {!isCollapsed && <h2 className="font-semibold text-lg">Conversas</h2>}
            <SidebarTrigger />
          </div>
          <div className="p-4">
            <Button onClick={onNewConversation} className="w-full justify-start gap-2" variant="default">
              <Plus className="h-4 w-4" />
              {!isCollapsed && <span>Nova Conversa</span>}
            </Button>
          </div>

          <SidebarContent className="flex-1">
            <SidebarGroup>
              {!isCollapsed && <SidebarGroupLabel>Conversas Anteriores</SidebarGroupLabel>}
              <SidebarGroupContent>
                <ScrollArea className="h-full">
                  <SidebarMenu>
                    {conversations.map((conversation) => (
                      <SidebarMenuItem
                        key={conversation.id}
                        onMouseEnter={() => setHoveredId(conversation.id)}
                        onMouseLeave={() => setHoveredId(null)}
                      >
                        <SidebarMenuButton
                          onClick={() => onSelectConversation(conversation.id)}
                          isActive={currentConversationId === conversation.id}
                          className="flex justify-between items-center w-full"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <MessageSquare className="h-4 w-4 shrink-0" />
                            {!isCollapsed && (
                              <p className="truncate text-sm font-medium">{conversation.title}</p>
                            )}
                          </div>

                          {!isCollapsed && hoveredId === conversation.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              // 3. O clique agora abre o diálogo em vez de deletar diretamente
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(conversation.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </ScrollArea>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </div>
      </Sidebar>

      {/* 4. Renderiza o componente de diálogo aqui */}
      <DeleteConfirmationDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConversationToDelete(null)}
      />
    </>
  );
}
