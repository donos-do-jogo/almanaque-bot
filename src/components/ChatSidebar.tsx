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

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

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

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <div className="flex flex-col h-full">
        {/* Header com trigger */}
        <div className="flex items-center justify-between p-4 border-b">
          {!isCollapsed && (
            <h2 className="font-semibold text-lg">Conversas</h2>
          )}
          <SidebarTrigger />
        </div>

        {/* Botão Nova Conversa */}
        <div className="p-4">
          <Button
            onClick={onNewConversation}
            className="w-full justify-start gap-2"
            variant="default"
          >
            <Plus className="h-4 w-4" />
            {!isCollapsed && <span>Nova Conversa</span>}
          </Button>
        </div>

        {/* Lista de conversas */}
        <SidebarContent className="flex-1">
          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel>Conversas Anteriores</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <ScrollArea className="h-full">
                <SidebarMenu>
                  {conversations.map((conversation) => (
                    <SidebarMenuItem key={conversation.id}>
                      <SidebarMenuButton
                        onClick={() => onSelectConversation(conversation.id)}
                        isActive={currentConversationId === conversation.id}
                        className="group relative"
                      >
                        <MessageSquare className="h-4 w-4 shrink-0" />
                        {!isCollapsed && (
                          <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-medium">
                              {conversation.title}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {conversation.lastMessage}
                            </p>
                          </div>
                        )}
                        {!isCollapsed && (
                          // ✨ FIX: Changed <button> to <div> to prevent nesting error
                          <div
                            role="button" // Add role for accessibility
                            tabIndex={0}   // Make it focusable
                            onClick={(e) => {
                              e.stopPropagation(); // Prevents parent onClick
                              onDeleteConversation(conversation.id);
                            }}
                            // Make focus style visible for accessibility
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.stopPropagation();
                                onDeleteConversation(conversation.id);
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </div>
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
  );
}
