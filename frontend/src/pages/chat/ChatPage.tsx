import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  Send,
  Plus,
  ArrowLeft,
  Users,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getConversations,
  createConversation,
} from "../../api/conversation.api";
import {
  getMessages,
  sendMessage,
  markConversationAsRead,
  deleteMessage,
} from "../../api/message.api";
import { getStudyPartners } from "../../api/studyPartner.api";

import { useAuth } from "../../features/auth/useAuth";
import { useSocket } from "../../context/SocketContext";
import { getErrorMessage } from "../../utils/error";
import Avatar from "../../components/ui/Avatar";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import SearchInput from "../../components/ui/SearchInput";
import ChatMessage from "../../components/ui/ChatMessage";
import { Skeleton, SkeletonAvatar } from "../../components/ui/Skeleton";
import type { Conversation, Message } from "../../types/chat";

function ChatPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const { socket, joinConversation, leaveConversation, isUserOnline } =
    useSocket();

  const conversationIdFromUrl = searchParams.get("conversationId");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [conversationSearch, setConversationSearch] = useState("");
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isUserScrolledUpRef = useRef(false);

  /* ─ Load all conversations ───────────────────────────────────────────────── */
  const {
    data: conversations = [],
    isLoading: loadingConversations,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
  });

  // Helper to extract the peer user in 1-on-1 conversations
  const getPartnerUser = (conv?: Conversation) => {
    if (!conv) return null;
    const partner = conv.participants.find(
      (p) => p.userId !== currentUser?.id
    );
    return partner?.user || null;
  };

  // Determine active conversation id
  const activeConversationId = useMemo(() => {
    if (conversationIdFromUrl) return conversationIdFromUrl;
    if (selectedId) return selectedId;
    return conversations.length > 0 ? conversations[0].id : null;
  }, [conversationIdFromUrl, selectedId, conversations]);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );
  const activePartner = getPartnerUser(activeConversation);
  const isPartnerOnline = activePartner ? isUserOnline(activePartner.id) : false;

  /* ─ Messages Query ───────────────────────────────────────────────────────── */
  const {
    data: messages = [],
    isLoading: loadingMessages,
  } = useQuery({
    queryKey: ["messages", activeConversationId],
    queryFn: () => getMessages(activeConversationId!),
    enabled: !!activeConversationId,
    refetchInterval: 5000,
  });

  /* ─ Study Partners for "New Chat" modal ──────────────────────────────────── */
  const { data: studyPartners = [] } = useQuery({
    queryKey: ["studyPartners"],
    queryFn: getStudyPartners,
    enabled: isNewChatOpen,
  });

  /* ─ Socket.IO room handling ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!activeConversationId) return;

    joinConversation(activeConversationId);
    markConversationAsRead(activeConversationId).catch(() => {});

    return () => {
      leaveConversation(activeConversationId);
    };
  }, [activeConversationId, joinConversation, leaveConversation]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMsg: Message) => {
      if (newMsg.conversationId === activeConversationId) {
        queryClient.setQueryData<Message[]>(
          ["messages", activeConversationId],
          (prev = []) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          }
        );
        markConversationAsRead(activeConversationId).catch(() => {});
      }

      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    const handleConversationUpdated = (updatedConv: Conversation) => {
      queryClient.setQueryData<Conversation[]>(
        ["conversations"],
        (prev = []) => {
          return prev.map((c) =>
            c.id === updatedConv.id ? updatedConv : c
          );
        }
      );
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("conversationUpdated", handleConversationUpdated);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("conversationUpdated", handleConversationUpdated);
    };
  }, [socket, activeConversationId, queryClient]);

  /* ─ Intelligent Auto-Scroll ─────────────────────────────────────────────── */
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    // Consider scrolled up if more than 120px from bottom
    isUserScrolledUpRef.current = scrollHeight - (scrollTop + clientHeight) > 120;
  };

  useEffect(() => {
    if (!isUserScrolledUpRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // When changing conversation, scroll to bottom immediately
  useEffect(() => {
    isUserScrolledUpRef.current = false;
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [activeConversationId]);

  /* ─ Mutations ────────────────────────────────────────────────────────────── */
  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      sendMessage({
        conversationId: activeConversationId!,
        content,
        type: "TEXT",
      }),
    onSuccess: (res) => {
      setMessageText("");
      queryClient.setQueryData<Message[]>(
        ["messages", activeConversationId],
        (prev = []) => {
          if (prev.some((m) => m.id === res.data.id)) return prev;
          return [...prev, res.data];
        }
      );
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      // Always scroll to bottom when user sends a message
      isUserScrolledUpRef.current = false;
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Failed to send message."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (messageId: string) => deleteMessage(messageId),
    onSuccess: (_, messageId) => {
      queryClient.setQueryData<Message[]>(
        ["messages", activeConversationId],
        (prev = []) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, isDeleted: true, content: "This message was deleted." }
              : m
          )
      );
      toast.success("Message deleted.");
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Could not delete message."));
    },
  });

  const newChatMutation = useMutation({
    mutationFn: (partnerId: string) => createConversation(partnerId),
    onSuccess: (res) => {
      setIsNewChatOpen(false);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setSelectedId(res.data.id);
      setSearchParams({ conversationId: res.data.id });
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Failed to start chat."));
    },
  });

  const handleSend = () => {
    const trimmed = messageText.trim();
    if (!trimmed || !activeConversationId || sendMutation.isPending) return;
    sendMutation.mutate(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ─ Filter conversations ─────────────────────────────────────────────────── */
  const filteredConversations = conversations.filter((c) => {
    const partner = getPartnerUser(c);
    const title = partner?.fullName || c.title || "";
    return title.toLowerCase().includes(conversationSearch.toLowerCase());
  });

  const sampleStarters = [
    "Hi! Ready to review topics together?",
    "Can we discuss questions on our shared syllabus?",
    "Hey! Are you free for a clinical study session?",
  ];

  return (
    <div className="h-full w-full max-w-7xl mx-auto flex rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
      {/* ── LEFT PANEL: Conversation Thread List ────────────────────────────── */}
      <div
        className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-200/80 bg-white shrink-0 ${
          activeConversationId ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4 sm:px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold">
              <MessageSquare className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 leading-tight">
                Study Chats
              </h2>
              <span className="text-[11px] text-slate-400">
                {conversations.length} active {conversations.length === 1 ? "thread" : "threads"}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="xs"
            onClick={() => setIsNewChatOpen(true)}
            className="!h-8 !w-8 !p-0 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer"
            title="Start new conversation"
            aria-label="Start new conversation"
          >
            <Plus className="h-4.5 w-4.5" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-100/90">
          <SearchInput
            value={conversationSearch}
            onChange={setConversationSearch}
            placeholder="Search conversations..."
            size="sm"
          />
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingConversations ? (
            <div className="space-y-2 p-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100/60">
                  <SkeletonAvatar size="sm" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-2.5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                <MessageSquare className="h-5 w-5" />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {conversationSearch
                  ? "No conversations match your search."
                  : "No study conversations yet."}
              </p>
              <Button
                variant="outline"
                size="xs"
                onClick={() => setIsNewChatOpen(true)}
                leftIcon={<Plus className="h-3 w-3" />}
              >
                New Study Chat
              </Button>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const partner = getPartnerUser(conv);
              const isSelected = conv.id === activeConversationId;
              const online = partner ? isUserOnline(partner.id) : false;

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    setSelectedId(conv.id);
                    setSearchParams({ conversationId: conv.id });
                  }}
                  className={`
                    relative flex items-center gap-3 p-3 rounded-xl transition-all duration-150 cursor-pointer select-none
                    ${
                      isSelected
                        ? "bg-indigo-50/90 text-indigo-950 font-medium border border-indigo-100/80 shadow-2xs"
                        : "hover:bg-slate-50/80 text-slate-800 border border-transparent"
                    }
                  `.trim().replace(/\s+/g, " ")}
                >
                  <Avatar
                    src={partner?.profileImage}
                    name={partner?.fullName}
                    size="sm"
                    isOnline={online}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3
                        className={`truncate text-xs ${
                          isSelected
                            ? "font-semibold text-indigo-950"
                            : "font-semibold text-slate-900"
                        }`}
                      >
                        {partner?.fullName || conv.title || "Study Partner"}
                      </h3>
                      {conv.lastMessage && (
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {new Date(
                            conv.lastMessage.createdAt
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>

                    <p
                      className={`truncate text-[11px] mt-0.5 ${
                        isSelected ? "text-indigo-800/80 font-medium" : "text-slate-500"
                      }`}
                    >
                      {conv.lastMessage?.content || "No messages yet"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── CENTER / RIGHT PANEL: Active Conversation ──────────────────────── */}
      <div
        className={`flex-1 flex flex-col bg-slate-50/50 overflow-hidden ${
          !activeConversationId ? "hidden md:flex" : "flex"
        }`}
      >
        {activeConversation ? (
          <>
            {/* Active Chat Header */}
            <div className="flex h-16 items-center justify-between border-b border-slate-200/80 bg-white px-4 md:px-6 shrink-0 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile Back Button */}
                <button
                  onClick={() => {
                    setSelectedId(null);
                    setSearchParams({});
                  }}
                  className="rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 md:hidden cursor-pointer"
                  aria-label="Back to conversations list"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <Avatar
                  src={activePartner?.profileImage}
                  name={activePartner?.fullName}
                  size="sm"
                  isOnline={isPartnerOnline}
                />

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 truncate leading-snug">
                    {activePartner?.fullName || "Study Partner"}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
                    <span
                      className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                        isPartnerOnline ? "bg-emerald-500 shadow-xs shadow-emerald-500/50" : "bg-slate-300"
                      }`}
                    />
                    <span className="font-medium truncate">
                      {isPartnerOnline ? "Online now" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>

              {activePartner && (
                <Link to={`/students/${activePartner.id}`} className="shrink-0">
                  <Button
                    variant="outline"
                    size="xs"
                    rightIcon={<ExternalLink className="h-3 w-3" />}
                  >
                    Profile
                  </Button>
                </Link>
              )}
            </div>

            {/* Message Stream */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2.5"
            >
              {loadingMessages ? (
                <div className="space-y-4 max-w-md mx-auto py-10">
                  <div className="flex justify-start">
                    <Skeleton className="h-10 w-44 rounded-2xl" />
                  </div>
                  <div className="flex justify-end">
                    <Skeleton className="h-12 w-60 rounded-2xl" />
                  </div>
                  <div className="flex justify-start">
                    <Skeleton className="h-9 w-36 rounded-2xl" />
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="py-14 text-center space-y-4 max-w-sm mx-auto">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-2xs">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-slate-900">
                      Direct Collaboration Started
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Say hello to {activePartner?.fullName || "your peer"} and start sharing curriculum notes!
                    </p>
                  </div>

                  <div className="pt-2 space-y-1.5 text-left">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
                      Conversation Starters
                    </p>
                    {sampleStarters.map((starter, i) => (
                      <button
                        key={i}
                        onClick={() => setMessageText(starter)}
                        className="w-full text-left p-2.5 rounded-xl border border-slate-200/80 bg-white hover:border-indigo-300 hover:bg-indigo-50/50 text-xs text-slate-700 transition cursor-pointer"
                      >
                        "{starter}"
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === currentUser?.id;
                  return (
                    <ChatMessage
                      key={msg.id}
                      message={msg}
                      isMe={isMe}
                      onDelete={(id) => deleteMutation.mutate(id)}
                      isDeleting={deleteMutation.isPending}
                    />
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Message Composer */}
            <div className="border-t border-slate-200/80 bg-white p-3 md:p-4 shrink-0 shadow-sm">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-end gap-2.5"
              >
                <div className="flex-1 relative rounded-xl border border-slate-200/90 bg-slate-50/70 focus-within:bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100/80 transition-all">
                  <textarea
                    rows={1}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                    className="w-full resize-none border-none bg-transparent px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none max-h-32 leading-relaxed"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!messageText.trim() || sendMutation.isPending}
                  isLoading={sendMutation.isPending}
                  className="shrink-0 !h-10 !w-10 !p-0 rounded-xl"
                  title="Send message"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <EmptyState
              icon={<MessageSquare className="h-8 w-8" />}
              title="Select a study conversation"
              description="Choose an existing conversation from the list or start a new direct chat with one of your connected study partners."
              actionLabel="Start New Chat"
              onAction={() => setIsNewChatOpen(true)}
              size="md"
            />
          </div>
        )}
      </div>

      {/* Start New Chat Modal */}
      {isNewChatOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsNewChatOpen(false)}
          title="Start Study Chat"
          description="Select an accepted study partner to open a direct messaging room."
          width="md"
        >
          {studyPartners.length === 0 ? (
            <div className="py-6 text-center">
              <EmptyState
                icon={<Users className="h-6 w-6" />}
                title="No connected study partners yet"
                description="You haven't connected with study partners yet. Explore the student directory and send connection requests first!"
                actionLabel="Discover Students"
                onAction={() => {
                  setIsNewChatOpen(false);
                  queryClient.invalidateQueries();
                }}
                size="sm"
              />
            </div>
          ) : (
            <div className="space-y-2">
              {studyPartners.map((p) => (
                <div
                  key={p.id}
                  onClick={() => newChatMutation.mutate(p.id)}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 hover:bg-indigo-50/60 hover:border-indigo-200 transition cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      src={p.profileImage}
                      name={p.fullName}
                      size="sm"
                      isOnline={isUserOnline(p.id)}
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-slate-900 block truncate">
                        {p.fullName}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate block">
                        {p.college || p.course || "Medical Student"}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="xs"
                    isLoading={newChatMutation.isPending}
                  >
                    Open Chat
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

export default ChatPage;
