import { CheckCheck } from "lucide-react";
import type { Message } from "../../types/chat";

export interface ChatMessageProps {
  message: Message;
  isMe: boolean;
  onDelete?: (messageId: string) => void;
  isDeleting?: boolean;
}

function ChatMessage({
  message,
  isMe,
  onDelete,
  isDeleting = false,
}: ChatMessageProps) {
  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex group py-1 ${isMe ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`
          relative max-w-[85%] sm:max-w-[70%] md:max-w-[65%] rounded-2xl px-4 py-2.5 text-xs shadow-2xs transition-all
          ${
            isMe
              ? "bg-indigo-600 text-white rounded-br-xs shadow-indigo-500/10"
              : "bg-white text-slate-900 border border-slate-200/90 rounded-bl-xs"
          }
        `.trim().replace(/\s+/g, " ")}
      >
        {message.isDeleted ? (
          <p className="italic text-xs opacity-60">
            This message was deleted.
          </p>
        ) : (
          <p className="whitespace-pre-wrap break-words leading-relaxed text-[13px]">
            {message.content}
          </p>
        )}

        <div
          className={`mt-1 flex items-center justify-end gap-1.5 text-[10px] select-none ${
            isMe ? "text-indigo-200" : "text-slate-400"
          }`}
        >
          <span>{formattedTime}</span>
          {isMe && !message.isDeleted && (
            <CheckCheck className="h-3 w-3 shrink-0" aria-label="Delivered" />
          )}
        </div>

        {/* Delete action button on hover for sender with animated dustbin lid */}
        {isMe && !message.isDeleted && onDelete && (
          <button
            onClick={() => onDelete(message.id)}
            disabled={isDeleting}
            className="group/trash absolute -left-8 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center justify-center h-6 w-6 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 shadow-xs transition-colors cursor-pointer"
            title="Delete message"
            aria-label="Delete message"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5 overflow-visible"
              aria-hidden="true"
            >
              {/* Animated lid that opens up on hover */}
              <g className="transition-transform duration-300 ease-out origin-[4px_6px] group-hover/trash:-rotate-25 group-hover/trash:-translate-y-0.5">
                <path d="M3 6h18" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </g>
              {/* Canister base */}
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;
