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
import { Conversation } from "@/pages/Chat";
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setConversationToDelete(id);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (conversationToDelete) {
      onDeleteConversation(conversationToDelete);
    }
    setIsDialogOpen(false);
    setConversationToDelete(null);
  };

  return (
    <>
      <Sidebar className={isCollapsed ? "w-15" : "w-72"} collapsible="icon">
        <div className="flex flex-col h-full">
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
                          className="flex w-full justify-between items-center gap-2"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <MessageSquare className="h-4 w-4 shrink-0" />
                            {!isCollapsed && (
                              // --- ✅ A CORREÇÃO ESTÁ AQUI ---
                              <p className="truncate text-sm font-medium text-left max-w-[180px]">
                                {conversation.title}
                              </p>
                            )}
                          </div>

                          {!isCollapsed && hoveredId === conversation.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
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

      <DeleteConfirmationDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
