import React from "react";
import { FaFeatherAlt, FaUser } from "react-icons/fa";

interface ChatInputFormProps {
  userInput: string;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleSend: () => void;
  clearChat: () => void;
  setUserInput: (val: string) => void;
  loading: boolean;
}

const ChatInputForm: React.FC<ChatInputFormProps> = ({
  userInput,
  handleKeyDown,
  handleSend,
  clearChat,
  setUserInput,
  loading,
}) => (
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
);

export default ChatInputForm; 