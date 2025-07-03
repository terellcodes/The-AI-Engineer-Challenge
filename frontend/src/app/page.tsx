"use client";
import { useEffect, useRef, useState } from "react";
import ChatWindow from "./ChatWindow";
import Sidebar from "./components/Sidebar";

interface Message {
  role: "user" | "ai";
  content: string;
  time: string;
  followups?: string[];
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
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | undefined>(undefined);
  const [pdfUploaded, setPdfUploaded] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const missingApiKey = !apiKey;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const getApiBaseUrl = () => {
    if (typeof window !== "undefined" && window.location.hostname === "localhost") {
      return "http://localhost:8000/api/chat";
    }
    return "https://the-ai-engineer-challenge-roan.vercel.app/api/chat";
  };

  const handleUploadPDF = async (file: File) => {
    setUploadStatus("Uploading...");
    setPdfUploaded(false);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      const response = await fetch("/api/upload_pdf", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        setUploadStatus("Upload failed");
        return;
      }
      setUploadStatus("PDF uploaded and indexed!");
      setPdfUploaded(true);
      setMessages([
        {
          role: "ai",
          content: "PDF uploaded and indexed! You can now ask questions about your document.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      console.log(err);
      setUploadStatus("Upload error");
    }
  };

  const handleSend = async () => {
    if (!userInput.trim() || loading) return;
    if (!apiKey) {
      alert("Please enter your OpenAI API key in settings.");
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
      let response;
      if (pdfUploaded) {
        response = await fetch("/api/chat_with_pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_message: userInput,
            api_key: apiKey,
            k: 5,
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
        const data = await response.json();
        let aiContent = data.response || "";
        let followups = data.followups || [];
        // If the response is a stringified JSON, parse it
        if (typeof aiContent === "string" && aiContent.trim().startsWith("{")) {
          try {
            const parsed = JSON.parse(aiContent);
            aiContent = parsed.response || aiContent;
            followups = parsed.followups || followups;
          } catch {}
        }
        setMessages((msgs) => [
          ...msgs,
          {
            role: "ai",
            content: aiContent,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            followups,
          },
        ]);
        setLoading(false);
        return;
      } else {
        const latexInstruction = `\nYou are a helpful AI assistant. When you include mathematical expressions in your responses, always format them using LaTeX syntax. Use single dollar signs \`$...$\` for inline math and double dollar signs \`$$...$$\` for display math. For example:\n\n- Inline: The solution is $x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$.\n- Display:\n$$\nx = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}\n$$\n\nDo not use any other delimiters for math. Always escape backslashes as needed for LaTeX.`;
        response = await fetch(getApiBaseUrl(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            developer_message: systemPrompt + '\n\n' + latexInstruction,
            user_message: userInput,
            model,
            api_key: apiKey,
          }),
        });
      }
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
    } catch (err: unknown) {
      let message = "Unknown error";
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "string") {
        message = err;
      }
      setMessages((msgs) => [
        ...msgs,
        {
          role: "ai",
          content: `Error: ${message}`,
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

  return (
    <div className="min-h-screen h-screen flex font-mono bg-[#181a20] relative">
      {/* Sidebar - slides in and pushes main content */}
      <Sidebar
        apiKey={apiKey}
        setApiKey={setApiKey}
        model={model}
        setModel={setModel}
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
        onUploadPDF={handleUploadPDF}
        uploadStatus={uploadStatus}
        onClose={() => setSidebarOpen(false)}
        open={sidebarOpen}
      />
      {/* Main Content Panel - shifts right when sidebar is open */}
      <div className={`flex-1 flex flex-col h-screen justify-start relative pt-2 pb-0 transition-all duration-300 ${sidebarOpen ? 'ml-[270px]' : ''}`}>
        {/* Header */}
        <header className="w-full flex items-center justify-between py-3 px-4 mb-2">
          <h1 className="text-2xl font-bold flex items-center gap-3 select-none text-[#e2e8f0] tracking-wider">
            <span className="font-mono">PDF RAG IDE</span>
          </h1>
          <button
            className="px-4 py-2 bg-[#23272e] text-[#e2e8f0] rounded hover:bg-[#31343c] border border-[#31343c] font-mono"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Settings"
          >
            Settings
          </button>
        </header>
        {/* Chat Container as a separate component */}
        <ChatWindow
          messages={messages}
          loading={loading}
          userInput={userInput}
          handleKeyDown={handleKeyDown}
          handleSend={handleSend}
          clearChat={clearChat}
          setUserInput={setUserInput}
          setMessages={setMessages}
          missingApiKey={missingApiKey}
          onShowSettings={() => setSidebarOpen(true)}
          onUploadPDF={handleUploadPDF}
          uploadStatus={uploadStatus}
        />
        <footer className="text-xs text-gray-500 font-mono mt-1 mb-0">Built with Next.js, Tailwind CSS, Framer Motion, and FastAPI &mdash; IDE Inspired</footer>
      </div>
    </div>
  );
}
