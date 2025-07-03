import { AnimatePresence, motion } from "framer-motion";
import { FaRobot, FaMagic } from "react-icons/fa";
import React, { useEffect, useRef, useState } from "react";
import ChatInputForm from "./components/ChatInputForm";
import ConversationBubble from "./components/ConversationBubble";

interface Message {
  role: "user" | "ai";
  content: string;
  time: string;
  followups?: string[];
}

interface ChatWindowProps {
  messages: Message[];
  loading: boolean;
  userInput: string;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleSend: () => void;
  clearChat: () => void;
  setUserInput: (val: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  missingApiKey?: boolean;
  onShowSettings?: () => void;
  onUploadPDF?: (file: File) => void;
  uploadStatus?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  loading,
  userInput,
  handleKeyDown,
  handleSend,
  clearChat,
  setUserInput,
  setMessages,
  missingApiKey,
  onShowSettings,
  onUploadPDF,
  uploadStatus,
}) => {
  const scrollableRef = useRef<HTMLDivElement>(null);
  const [regenLoadingIndex, setRegenLoadingIndex] = useState<number | null>(null);

  useEffect(() => {
    const el = scrollableRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, loading]);

  // Regenerate handler
  const handleRegenerate = async (aiIndex: number) => {
    setRegenLoadingIndex(aiIndex);
    // Find the user message before this AI message
    let userMsgIdx = aiIndex - 1;
    while (userMsgIdx >= 0 && messages[userMsgIdx].role !== "user") userMsgIdx--;
    if (userMsgIdx < 0) return setRegenLoadingIndex(null);
    const userMsg = messages[userMsgIdx];
    // Clear the AI message content before streaming
    setMessages((msgs) =>
      msgs.map((msg, idx) =>
        idx === aiIndex ? { ...msg, content: "Regenerating content..." } : msg
      )
    );
    // Use the same system prompt as in page.tsx
    const latexInstruction = `\nYou are a helpful AI assistant. When you include mathematical expressions in your responses, always format them using LaTeX syntax. Use single dollar signs \`$...$\` for inline math and double dollar signs \`$$...$$\` for display math. For example:\n\n- Inline: The solution is $x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$.\n- Display:\n$$\nx = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}\n$$\n\nDo not use any other delimiters for math. Always escape backslashes as needed for LaTeX.`;
    
    const apiBase = typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://localhost:8000/api/chat"
      : "https://the-ai-engineer-challenge-roan.vercel.app/api/chat";
    try {
      const response = await fetch(apiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          developer_message: messages[0]?.content + latexInstruction,
          user_message: userMsg.content,
          model: "gpt-4.1-mini",
          api_key: localStorage.getItem("openai_api_key") || "",
        }),
      });
      if (!response.ok) throw new Error("Failed to regenerate response");
      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      let aiMsg = "";
      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          aiMsg += new TextDecoder().decode(value);
          setMessages((msgs) =>
            msgs.map((msg, idx) =>
              idx === aiIndex ? { ...msg, content: aiMsg } : msg
            )
          );
        }
      }
    } catch {
      setMessages((msgs) =>
        msgs.map((msg, idx) =>
          idx === aiIndex ? { ...msg, content: "Error: Could not regenerate response." } : msg
        )
      );
    } finally {
      setRegenLoadingIndex(null);
    }
  };

  // Handle followup click
  const handleFollowupClick = (question: string) => {
    setUserInput(question);
    setTimeout(() => handleSend(), 0);
  };

  return (
    <div
      className="flex flex-col flex-1 h-full w-full bg-[#23272e] rounded-lg shadow-lg border border-[#31343c] p-0"
      style={{ fontFamily: 'var(--font-mono, monospace)' }}
    >
      <div className="flex-1 overflow-y-auto mb-2 pr-1 px-6 pt-6">
        {missingApiKey ? (
          <div className="flex justify-center mb-6">
            <div className="rounded bg-[#31343c] border border-gray-700 px-6 py-4 flex flex-col items-center shadow max-w-[60%]">
              <div className="text-gray-200 font-mono text-lg mb-2 flex items-center gap-2">
                Please add your OpenAI API key to start chatting!
              </div>
              <button
                className="bg-[#23272e] text-gray-200 px-4 py-2 rounded border border-[#31343c] mt-2 font-mono"
                onClick={onShowSettings}
              >
                Add OpenAI Key
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex mb-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <ConversationBubble
                  role={msg.role}
                  content={msg.content}
                  time={msg.time}
                  onRegenerate={msg.role === "ai" ? () => handleRegenerate(idx) : undefined}
                  followups={msg.followups}
                  onFollowupClick={handleFollowupClick}
                />
                {regenLoadingIndex === idx && (
                  <span className="ml-2 text-xs text-gray-400 animate-pulse">Regenerating...</span>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start mb-4">
                <div className="rounded px-4 py-2 max-w-[75%] text-base shadow bg-[#181a20] text-gray-200 rounded-bl-none flex items-center gap-2 border border-gray-700">
                  <span className="animate-bounce">🤖</span>
                  <span>AI is thinking...</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {!missingApiKey && (
        <div className="w-full border-t border-[#31343c] bg-[#181a20] px-6 py-4 flex flex-col">
          <ChatInputForm
            userInput={userInput}
            handleKeyDown={handleKeyDown}
            handleSend={handleSend}
            clearChat={clearChat}
            setUserInput={setUserInput}
            loading={loading}
            onUploadPDF={onUploadPDF}
            uploadStatus={uploadStatus}
          />
        </div>
      )}
    </div>
  );
};

export default ChatWindow;