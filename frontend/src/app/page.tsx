"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaFeatherAlt, FaMagic, FaUser, FaRobot } from "react-icons/fa";

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

  const getApiBaseUrl = () => {
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      return "http://localhost:8000/api/chat";
    }
    return "https://api-empty-paper-274.fly.dev/api/chat";
  };

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
      const response = await fetch(getApiBaseUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          developer_message: systemPrompt,
          user_message: userInput,
          model,
          api_key: apiKey,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setMessages((msgs) => [
          ...msgs,
          {
            role: "ai",
            content: `Error: ${response.status} ${response.statusText}\n${errorText}`,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        setLoading(false);
        return;
      }

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
    <div className="min-h-screen flex flex-col items-center justify-center font-quicksand relative">
      {/* Grain overlay for texture */}
      <div className="ghibli-grain" aria-hidden="true" />
      {/* Header */}
      <header className="w-full max-w-2xl mx-auto flex items-center justify-between py-6 px-4">
        <motion.h1
          className="text-3xl font-bold flex items-center gap-3 select-none text-[#355c3a]"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          <FaFeatherAlt className="text-yellow-700 drop-shadow" />
          <span className="font-noto-serif">Ghibli Chat</span>
        </motion.h1>
        <motion.button
          className="ghibli-btn px-4 py-2 flex items-center gap-2"
          onClick={() => setShowSettings((s) => !s)}
          aria-label="Settings"
          whileHover={{ scale: 1.08, boxShadow: "0 0 16px #ffe9b3" }}
        >
          <FaMagic className="text-yellow-700" />
          Settings
        </motion.button>
      </header>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-ghibli-parchment ghibli-shadow ghibli-rounded p-7 w-full max-w-md relative border-2 border-[#e6dcc3]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
            >
              <h2 className="text-xl font-noto-serif mb-4 text-yellow-900 flex items-center gap-2">
                <FaMagic className="text-yellow-700" /> Settings
              </h2>
              <div className="mb-3 relative">
                <span className="input-icon"><FaMagic /></span>
                <input
                  id="apiKey"
                  type="password"
                  className="ghibli-input w-full pl-10 py-2"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your OpenAI API key"
                />
              </div>
              <div className="mb-3 relative">
                <span className="input-icon"><FaFeatherAlt /></span>
                <select
                  id="model"
                  className="ghibli-input w-full pl-10 py-2"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                >
                  <option value="gpt-4.1-mini">GPT-4.1 Mini</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
              </div>
              <div className="mb-3 relative">
                <span className="input-icon"><FaFeatherAlt /></span>
                <textarea
                  id="systemPrompt"
                  className="ghibli-input w-full pl-10 py-2"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  className="ghibli-btn px-4 py-2"
                  onClick={() => setShowSettings(false)}
                >Cancel</button>
                <button
                  className="ghibli-btn px-4 py-2"
                  onClick={saveSettings}
                >Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Container */}
      <motion.div
        className="w-full max-w-2xl flex-1 flex flex-col bg-ghibli-parchment ghibli-shadow ghibli-rounded p-4 sm:p-6 mb-8 border-2 border-[#e6dcc3] relative z-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring" }}
      >
        <div className="flex-1 overflow-y-auto mb-4" style={{ maxHeight: "60vh" }}>
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                className={`flex mb-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, type: "spring" }}
              >
                <div
                  className={`ghibli-rounded px-4 py-2 max-w-[75%] text-base shadow flex items-start gap-2 ${
                    msg.role === "user"
                      ? "bg-yellow-100 text-yellow-900 rounded-br-none border-2 border-yellow-200"
                      : "bg-white text-green-900 rounded-bl-none border-2 border-green-100"
                  }`}
                  style={{ fontFamily: msg.role === "user" ? 'Quicksand' : 'Noto Serif JP' }}
                >
                  <span className="mt-1">
                    {msg.role === "user" ? (
                      <FaUser className="text-yellow-700" />
                    ) : (
                      <FaRobot className="text-green-700" />
                    )}
                  </span>
                  <div>
                    <div>{msg.content}</div>
                    <div className="text-xs text-gray-400 mt-1 text-right font-quicksand">{msg.time}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <motion.div
              className="flex justify-start mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="ghibli-rounded px-4 py-2 max-w-[75%] text-base shadow bg-white text-green-900 rounded-bl-none flex items-center gap-2 border-2 border-green-100">
                <FaRobot className="animate-bounce text-green-700" />
                <span>AI is thinking...</span>
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>
        <form
          className="flex items-end gap-2 relative"
          onSubmit={e => { e.preventDefault(); handleSend(); }}
        >
          <span className="input-icon left-4"><FaUser /></span>
          <textarea
            className="ghibli-input flex-1 pl-10 pr-3 py-2 resize-none min-h-[40px] max-h-[120px] text-base"
            placeholder="Type your message here..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={loading}
            style={{ fontFamily: 'Quicksand' }}
          />
          <button
            type="submit"
            className="ghibli-btn px-5 py-2 flex items-center gap-2"
            disabled={loading || !userInput.trim()}
          >
            <FaFeatherAlt /> Send
          </button>
          <button
            type="button"
            className="ghibli-btn px-4 py-2"
            onClick={clearChat}
            disabled={loading}
          >
            Clear
          </button>
        </form>
      </motion.div>
      <footer className="text-xs text-yellow-900 mb-2 font-noto-serif drop-shadow-sm">Built with Next.js, Tailwind CSS, Framer Motion, and FastAPI &mdash; Inspired by Studio Ghibli</footer>
    </div>
  );
}
