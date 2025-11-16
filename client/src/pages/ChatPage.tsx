import { useEffect, useRef, useState } from "react";
import { Message, messageService } from "@services/messageService";
import { useSocket } from "@hooks/useSocket";
import { useAuth } from "@hooks/useAuth";
import { Sidebar } from "@components/layout/Sidebar";
import { Header } from "@components/layout/Header";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { formatTime } from "@utils/helpers";
import { MessageCircle } from "lucide-react";

export default function ChatPage() {
  const { user } = useAuth();
  const { socket, emit, on } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    if (!socket || !user) return;

    const unsubscribeMessage = on("message-received", (message: unknown) => {
      setMessages((prev) => [...prev, message as Message]);
    });

    const unsubscribeTyping = on("user-typing", (data: unknown) => {
      const typingData = data as { userId: string; name: string };
      setTypingUsers((prev) => {
        if (!prev.includes(typingData.name)) {
          return [...prev, typingData.name];
        }
        return prev;
      });
    });

    const unsubscribeStopTyping = on("user-stopped-typing", (data: unknown) => {
      const stopData = data as { userId: string };
      setTypingUsers((prev) => prev.filter((name) => name !== stopData.userId));
    });

    return () => {
      unsubscribeMessage?.();
      unsubscribeTyping?.();
      unsubscribeStopTyping?.();
    };
  }, [socket, user, on]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await messageService.getMessages(50);
      if (response.success) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const content = input.trim();
    setInput("");
    if (user.teamId) {
      emit("stop-typing", {
        teamId: user.teamId,
        userId: user._id,
      });
    }
    setIsTyping(false);

    try {
      const response = await messageService.sendMessage({
        content,
        messageType: "TEXT",
      });

      if (response.success) {
        emit("send-message", response.data);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleTyping = () => {
    if (!isTyping && user && user.teamId) {
      emit("typing", {
        teamId: user.teamId,
        userId: user._id,
        userName: user.name,
      });
      setIsTyping(true);

      setTimeout(() => {
        emit("stop-typing", {
          teamId: user.teamId,
          userId: user._id,
        });
        setIsTyping(false);
      }, 3000);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="bg-transparent px-8 py-6 ">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-lg ">
                <MessageCircle className="h-6 w-6 text-slate-700" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-700">Team Chat</h2>
                <p className="text-slate-700/80 text-sm">
                  Real-time team communication
                </p>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full h-20 w-20 flex items-center justify-center mb-4">
                      <MessageCircle className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-muted-foreground text-lg">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                )}
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${
                      message.senderId._id === user?._id
                        ? "justify-end"
                        : "justify-start"
                    } animate-fadeIn`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md xl:max-w-lg px-5 py-3 rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg ${
                        message.senderId._id === user?._id
                          ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-none"
                          : "bg-white dark:bg-slate-800 text-foreground border-2 border-blue-100 dark:border-blue-900 rounded-bl-none"
                      }`}
                    >
                      <p
                        className={`text-xs font-bold mb-1 ${
                          message.senderId._id === user?._id
                            ? "text-white/80"
                            : "text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {message.senderId._id === user?._id
                          ? "You"
                          : message.senderId.name}
                      </p>
                      <p className="text-sm leading-relaxed">
                        {message.content}
                      </p>
                      <p
                        className={`text-xs mt-2 ${
                          message.senderId._id === user?._id
                            ? "text-white/60"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}

            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 pl-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]"></div>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  {typingUsers.join(", ")}{" "}
                  {typingUsers.length === 1 ? "is" : "are"} typing...
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-800 p-4">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <Input
                type="text"
                placeholder="Type your message here..."
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  handleTyping();
                }}
                className="flex-1 rounded-full px-5 py-3 border-2 border-blue-200 dark:border-blue-900 focus:border-purple-500 focus:outline-none transition-colors"
              />
              <Button
                type="submit"
                disabled={!input.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Send
              </Button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
