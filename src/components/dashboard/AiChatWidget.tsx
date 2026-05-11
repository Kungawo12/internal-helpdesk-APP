"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your Helpdesk Assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open) scrollToBottom();
  }, [messages, open]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: messages.slice(-6), // Send last 6 messages as history
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {open && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 h-[500px] bg-[#0f172a] text-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-800 backdrop-blur-xl">
          {/* Header */}
          <div className="px-6 py-4 bg-[#1e293b] flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center text-lg">
                🤖
              </div>
              <div>
                <h3 className="font-bold text-sm">Helpdesk AI</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-[#1e293b] text-slate-200"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#1e293b] text-slate-200 rounded-2xl px-4 py-2.5 text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-800 bg-[#0a0f1e]">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-[#1e293b] text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-700"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!open && (
        <div className="flex items-center gap-3">
          <div className="bg-white text-slate-800 text-xs font-black px-4 py-2.5 rounded-2xl shadow-xl border border-slate-100 whitespace-nowrap">
            AI Assistant
            <span className="ml-2 inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          <button
            onClick={() => setOpen(true)}
            className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-2xl hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
            aria-label="Open AI Chat"
          >
            🤖
          </button>
        </div>
      )}
      {open && (
        <button
          onClick={() => setOpen(false)}
          className="w-14 h-14 bg-slate-800 text-white rounded-2xl flex items-center justify-center text-xl shadow-2xl hover:bg-slate-700 transition-all"
          aria-label="Close AI Chat"
        >
          ✕
        </button>
      )}
    </div>
  );
}
