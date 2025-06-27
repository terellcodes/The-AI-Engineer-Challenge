import React from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { FaUser, FaRobot } from "react-icons/fa";

interface ConversationBubbleProps {
  role: "user" | "ai";
  content: string;
  time: string;
}

const ConversationBubble: React.FC<ConversationBubbleProps> = ({ role, content, time }) => (
  <div
    className={`ghibli-rounded px-4 py-2 max-w-[60%] text-base shadow flex items-start gap-2 ${
      role === "user"
        ? "bg-yellow-100 text-yellow-900 rounded-br-none border-2 border-yellow-200"
        : "bg-white text-green-900 rounded-bl-none border-2 border-green-100"
    }`}
    style={{ fontFamily: role === "user" ? 'Quicksand' : 'Noto Serif JP' }}
  >
    <span className="mt-1">
      {role === "user" ? (
        <FaUser className="text-yellow-700" />
      ) : (
        <FaRobot className="text-green-700" />
      )}
    </span>
    <div>
      <div className="prose prose-sm max-w-none text-inherit">
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {content}
        </ReactMarkdown>
      </div>
      <div className="text-xs text-gray-400 mt-1 text-right font-quicksand">{time}</div>
    </div>
  </div>
);

export default ConversationBubble; 