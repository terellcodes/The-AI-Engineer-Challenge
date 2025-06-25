"use client";
import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "ai";
  content: string;
  time: string;
}

const defaultSystemPrompt =
  "You are a helpful AI assistant. Provide clear, accurate, and helpful responses to user questions.";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gpt-4.1-mini");
  const [systemPrompt, setSystemPrompt] = useState(defaultSystemPrompt);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!userInput.trim() || loading) return;
    if (!apiKey) {
      alert("Please enter your OpenAI API key in settings.");
      setShowSettings(true);
      return;
    }
    const userMsg: Message = {
      role: "user",
      content: userInput,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((msgs) => [...msgs, userMsg]);
    setUserInput("");
    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          developer_message: systemPrompt,
          user_message: userInput,
          model,
          api_key: apiKey,
        }),
      });
      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      let aiMsg = "";
      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          aiMsg += new TextDecoder().decode(value);
          setMessages((msgs) => {
            const last = msgs[msgs.length - 1];
            if (last.role === "ai") {
              return [...msgs.slice(0, -1), { ...last, content: aiMsg }];
            } else {
              return [
                ...msgs,
                {
                  role: "ai",
                  content: aiMsg,
                  time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
              ];
            }
          });
        }
      }
      setLoading(false);
    } catch (err: any) {
      setMessages((msgs) => [
        ...msgs,
        {
          role: "ai",
          content: `Error: ${err.message}`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "ai",
        content: "Hello! I'm your AI assistant. How can I help you today?",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  // Settings persistence (localStorage)
  useEffect(() => {
    setApiKey(localStorage.getItem("openai_api_key") || "");
    setModel(localStorage.getItem("openai_model") || "gpt-4.1-mini");
    setSystemPrompt(localStorage.getItem("openai_system_prompt") || defaultSystemPrompt);
  }, []);
  const saveSettings = () => {
    localStorage.setItem("openai_api_key", apiKey);
    localStorage.setItem("openai_model", model);
    localStorage.setItem("openai_system_prompt", systemPrompt);
    setShowSettings(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans">
      {/* Header */}
      <header className="w-full max-w-2xl mx-auto flex items-center justify-between py-6 px-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span role="img" aria-label="robot">🤖</span> AI Chat Assistant
        </h1>
        <button
          className="text-gray-500 hover:text-gray-800"
          onClick={() => setShowSettings((s) => !s)}
          aria-label="Settings"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </button>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Settings</h2>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1" htmlFor="apiKey">OpenAI API Key</label>
              <input
                id="apiKey"
                type="password"
                className="w-full border rounded px-3 py-2"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your OpenAI API key"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1" htmlFor="model">Model</label>
              <select
                id="model"
                className="w-full border rounded px-3 py-2"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                <option value="gpt-4.1-mini">GPT-4.1 Mini</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1" htmlFor="systemPrompt">System Prompt</label>
              <textarea
                id="systemPrompt"
                className="w-full border rounded px-3 py-2"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setShowSettings(false)}
              >Cancel</button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={saveSettings}
              >Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Container */}
      <div className="w-full max-w-2xl flex-1 flex flex-col bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-8">
        <div className="flex-1 overflow-y-auto mb-4" style={{ maxHeight: "60vh" }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex mb-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[75%] text-sm shadow ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-900 rounded-bl-none"
                }`}
              >
                <div>{msg.content}</div>
                <div className="text-xs text-gray-400 mt-1 text-right">{msg.time}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start mb-4">
              <div className="rounded-lg px-4 py-2 max-w-[75%] text-sm shadow bg-gray-100 text-gray-900 rounded-bl-none flex items-center gap-2">
                <span>AI is thinking</span>
                <span className="animate-bounce">...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="flex items-end gap-2">
          <textarea
            className="flex-1 border rounded px-3 py-2 resize-none min-h-[40px] max-h-[120px]"
            placeholder="Type your message here..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={loading}
          />
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300"
            onClick={handleSend}
            disabled={loading || !userInput.trim()}
          >
            Send
          </button>
          <button
            className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
            onClick={clearChat}
            disabled={loading}
          >
            Clear
          </button>
        </div>
      </div>
      <footer className="text-xs text-gray-400 mb-2">Built with Next.js, Tailwind CSS, and FastAPI</footer>
    </div>
  );
}
