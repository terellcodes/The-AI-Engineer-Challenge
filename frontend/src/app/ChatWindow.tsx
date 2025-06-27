import { AnimatePresence, motion } from "framer-motion";
import { FaFeatherAlt, FaUser, FaRobot } from "react-icons/fa";
import React from "react";

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
  chatEndRef: React.RefObject<HTMLDivElement>;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  loading,
  userInput,
  handleKeyDown,
  handleSend,
  clearChat,
  setUserInput,
  chatEndRef,
}) => {
  return (
    <motion.div
      className="w-4/5 max-w-8xl flex flex-col bg-ghibli-parchment ghibli-shadow ghibli-rounded p-4 sm:p-8 border-2 border-[#e6dcc3] relative z-10 h-[85vh] min-h-[500px] mx-auto"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, type: "spring" }}
    >
      <div className="flex-1 overflow-y-auto mb-2 pr-1">
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
                className={`ghibli-rounded px-4 py-2 max-w-[60%] text-base shadow flex items-start gap-2 ${
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
        className="flex items-end gap-2 relative pt-2 bg-transparent"
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
  );
};

export default ChatWindow; 