import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { FaUser, FaRobot, FaRegCopy, FaCheck, FaRedo } from "react-icons/fa";

interface ConversationBubbleProps {
  role: "user" | "ai";
  content: string;
  time: string;
  onRegenerate?: () => void;
  followups?: string[];
  onFollowupClick?: (question: string) => void;
}

const ConversationBubble: React.FC<ConversationBubbleProps> = ({ role, content, time, onRegenerate, followups, onFollowupClick }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div
      className={`rounded-lg px-4 py-2 max-w-[60%] text-base shadow flex items-start gap-2 font-mono ${
        role === "user"
          ? "bg-[#23272e] text-gray-200 rounded-br-none border border-[#31343c]"
          : "bg-[#181a20] text-[#7fffd4] rounded-bl-none border border-[#31343c]"
      }`}
      style={{ fontFamily: 'var(--font-mono, monospace)' }}
    >
      <span className="mt-1">
        {role === "user" ? (
          <FaUser className="text-[#7fffd4]" />
        ) : (
          <FaRobot className="text-[#e2e8f0]" />
        )}
      </span>
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="prose prose-sm max-w-none text-inherit font-mono">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {content}
          </ReactMarkdown>
        </div>
        <div className="flex items-end justify-between mt-1">
          <div className="text-xs text-gray-500 font-mono">{time}</div>
          {/* Copy and Regenerate buttons for AI bubbles only */}
          {role === "ai" && (
            <div className="flex items-center gap-1">
              <button
                className="p-1 rounded bg-[#23272e] border border-[#31343c] text-xs flex items-center gap-1 text-gray-200 hover:bg-[#31343c]"
                onClick={handleCopy}
                title={copied ? "Copied!" : "Copy to clipboard"}
                aria-label="Copy to clipboard"
              >
                {copied ? <FaCheck className="text-green-400" /> : <FaRegCopy />}
              </button>
              <button
                className="p-1 rounded bg-[#23272e] border border-[#31343c] text-xs flex items-center gap-1 text-gray-200 hover:bg-[#31343c]"
                onClick={onRegenerate}
                title="Regenerate response"
                aria-label="Regenerate response"
              >
                <FaRedo />
              </button>
            </div>
          )}
        </div>
        {/* Render followup questions below AI responses if present */}
        {role === "ai" && followups && followups.length > 0 && (
          <div className="flex flex-row gap-2 mt-2">
            {followups.map((q, i) => (
              <button
                key={i}
                className="px-3 py-1 rounded bg-[#23272e] border border-[#31343c] text-xs text-[#7fffd4] hover:bg-[#31343c] font-mono"
                onClick={() => onFollowupClick && onFollowupClick(q)}
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationBubble; 