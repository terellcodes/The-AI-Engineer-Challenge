import { AnimatePresence, motion } from "framer-motion";
import { FaUser, FaRobot, FaMagic } from "react-icons/fa";
import React, { useEffect, useRef } from "react";
import ChatInputForm from "./components/ChatInputForm";
import ConversationBubble from "./components/ConversationBubble";

interface Message {
  role: "user" | "ai";
  content: string;
  time: string;
}

interface ChatWindowProps {
  messages: Message[];
  loading: boolean;
  userInput: string;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleSend: () => void;
  clearChat: () => void;
  setUserInput: (val: string) => void;
  missingApiKey?: boolean;
  onShowSettings?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  loading,
  userInput,
  handleKeyDown,
  handleSend,
  clearChat,
  setUserInput,
  missingApiKey,
  onShowSettings,
}) => {
  const scrollableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollableRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <motion.div
      className="w-4/5 max-w-8xl flex flex-col ghibli-shadow ghibli-rounded p-4 sm:p-8 border-2 border-[#e6dcc3] relative z-10 h-[85vh] min-h-[500px] mx-auto"
      style={{ background: 'rgba(180, 210, 180, 0.35)' }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, type: "spring" }}
    >
      <div className="flex-1 overflow-y-auto mb-2 pr-1" ref={scrollableRef}>
        {missingApiKey ? (
          <div className="flex justify-center mb-6">
            <div className="ghibli-rounded bg-yellow-100 border-2 border-yellow-300 px-6 py-4 flex flex-col items-center shadow max-w-[60%]">
              <div className="text-yellow-900 font-noto-serif text-lg mb-2 flex items-center gap-2">
                <FaMagic className="text-yellow-700" />
                Please add your OpenAI API key to start chatting!
              </div>
              <button
                className="ghibli-btn px-4 py-2 mt-2"
                onClick={onShowSettings}
              >
                Add OpenAI Key
              </button>
            </div>
          </div>
        ) : (
          <>
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
                  <ConversationBubble role={msg.role} content={msg.content} time={msg.time} />
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
          </>
        )}
      </div>
      {!missingApiKey && (
        <ChatInputForm
          userInput={userInput}
          handleKeyDown={handleKeyDown}
          handleSend={handleSend}
          clearChat={clearChat}
          setUserInput={setUserInput}
          loading={loading}
        />
      )}
    </motion.div>
  );
};

export default ChatWindow; 