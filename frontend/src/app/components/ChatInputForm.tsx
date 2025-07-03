import React, { useRef, useEffect } from "react";
import { FaFeatherAlt } from "react-icons/fa";

interface ChatInputFormProps {
  userInput: string;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleSend: () => void;
  clearChat: () => void;
  setUserInput: (val: string) => void;
  loading: boolean;
  onUploadPDF?: (file: File) => void;
  uploadStatus?: string;
}

const ChatInputForm: React.FC<ChatInputFormProps> = ({
  userInput,
  handleKeyDown,
  handleSend,
  clearChat,
  setUserInput,
  loading,
  onUploadPDF,
  uploadStatus,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onUploadPDF) {
      onUploadPDF(e.target.files[0]);
      e.target.value = ""; // reset for next upload
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [userInput]);

  return (
    <div className="flex flex-col gap-2 mt-2">
      {/* PDF Upload UI */}
      <div className="flex items-center gap-2 mb-1">
        <button
          className="bg-[#23272e] text-gray-200 px-3 py-1 rounded border border-[#31343c] font-mono"
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          Upload PDF
        </button>
        <input
          type="file"
          accept="application/pdf"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        {uploadStatus && <span className="text-sm text-green-400 ml-2 font-mono">{uploadStatus}</span>}
      </div>
      {/* Chat input UI */}
      <form
        className="flex flex-col gap-2 relative pt-2 bg-[#181a20] border border-[#31343c] rounded-md px-3 py-2 font-mono"
        onSubmit={e => { e.preventDefault(); handleSend(); }}
      >
        <textarea
          ref={textareaRef}
          className="flex-1 pl-3 pr-3 py-2 resize-none text-base bg-transparent text-gray-200 outline-none font-mono overflow-hidden"
          placeholder="Type your message here..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <div className="flex flex-row justify-end gap-2 mt-2">
          <button
            type="submit"
            className="bg-[#23272e] text-gray-200 px-5 py-2 rounded border border-[#31343c] font-mono hover:bg-[#31343c]"
            disabled={loading || !userInput.trim()}
          >
            <FaFeatherAlt /> Send
          </button>
          <button
            type="button"
            className="bg-[#23272e] text-gray-200 px-4 py-2 rounded border border-[#31343c] font-mono hover:bg-[#31343c]"
            onClick={clearChat}
            disabled={loading}
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInputForm; 