/*import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isBot: boolean;
  timestamp: Date;
}

const ChatMessage = ({ message, isBot, timestamp }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex gap-3 mb-4 animate-fade-in",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      {isBot && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg">
          <Bot className="w-5 h-5 text-primary-foreground" />
        </div>
      )}
      
      <div className={cn("flex flex-col gap-1 max-w-[75%] md:max-w-[60%]")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 shadow-md transition-all hover:shadow-lg",
            isBot
              ? "bg-chat-bot-bg text-chat-bot-text rounded-tl-sm"
              : "bg-chat-user-bg text-chat-user-text rounded-tr-sm"
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message}
          </p>
        </div>
        <span className={cn(
          "text-xs text-muted-foreground px-2",
          isBot ? "text-left" : "text-right"
        )}>
          {timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {!isBot && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center shadow-md">
          <User className="w-5 h-5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;*/

import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

interface ChatMessageProps {
  message: string;
  isBot: boolean;
  timestamp: Date;
}

const ChatMessage = ({ message, isBot, timestamp }: ChatMessageProps) => {
  const safeMessage =
    typeof message === "string" && message.trim() !== "" ? message : "";

  return (
    <div
      className={cn(
        "flex gap-3 mb-4 animate-fade-in",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      {/* Bot icon */}
      {isBot && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg">
          <Bot className="w-5 h-5 text-primary-foreground" />
        </div>
      )}

      {/* Message bubble */}
      <div className={cn("flex flex-col gap-1 max-w-[75%] md:max-w-[60%]")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 shadow-md transition-all hover:shadow-lg text-sm leading-relaxed break-words",
            isBot
              ? "bg-chat-bot-bg text-chat-bot-text rounded-tl-sm"
              : "bg-chat-user-bg text-chat-user-text rounded-tr-sm"
          )}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
            components={{
              p: ({ children }) => (
                <p className="mb-2 last:mb-0 whitespace-pre-wrap">{children}</p>
              ),
              a: ({ href, children }) => (
                <a
                  href={href ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  {children}
                </a>
              ),
              ul: ({ children }) => (
                <ul className="list-disc ml-5 mb-2 space-y-1">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal ml-5 mb-2 space-y-1">{children}</ol>
              ),
              li: ({ children }) => <li className="mb-1">{children}</li>,
              code: ({ inline, children }) =>
                inline ? (
                  <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs font-mono">
                    {children}
                  </code>
                ) : (
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto text-xs font-mono mb-2">
                    <code>{children}</code>
                  </pre>
                ),
              strong: ({ children }) => (
                <strong className="font-semibold">{children}</strong>
              ),
              em: ({ children }) => <em className="italic">{children}</em>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-gray-400 pl-3 italic text-gray-600 dark:text-gray-300">
                  {children}
                </blockquote>
              ),
            }}
          >
            {safeMessage}
          </ReactMarkdown>
        </div>

        {/* Timestamp */}
        <span
          className={cn(
            "text-xs text-muted-foreground px-2",
            isBot ? "text-left" : "text-right"
          )}
        >
          {timestamp.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {/* User icon */}
      {!isBot && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center shadow-md">
          <User className="w-5 h-5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
