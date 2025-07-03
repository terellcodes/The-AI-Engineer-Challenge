import React from "react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  apiKey: string;
  setApiKey: (val: string) => void;
  model: string;
  setModel: (val: string) => void;
  systemPrompt: string;
  setSystemPrompt: (val: string) => void;
  onUploadPDF: (file: File) => void;
  uploadStatus?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  open,
  onClose,
  apiKey,
  setApiKey,
  model,
  setModel,
  systemPrompt,
  setSystemPrompt,
  onUploadPDF,
  uploadStatus,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadPDF(e.target.files[0]);
      e.target.value = "";
    }
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen w-[270px] bg-[#23272e] text-white shadow-lg z-40 flex flex-col transform transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      style={{ fontFamily: 'var(--font-mono, monospace)' }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <span className="text-lg font-bold tracking-wide">Settings</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">×</button>
      </div>
      <div className="p-4 flex flex-col gap-4 flex-1 overflow-y-auto">
        <div>
          <label htmlFor="apiKey" className="block text-xs font-semibold mb-1">OpenAI API Key</label>
          <input
            id="apiKey"
            type="password"
            className="w-full px-3 py-2 rounded bg-[#181a20] border border-gray-600 text-sm"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="Enter your OpenAI API key"
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor="model" className="block text-xs font-semibold mb-1">Model</label>
          <select
            id="model"
            className="w-full px-3 py-2 rounded bg-[#181a20] border border-gray-600 text-sm"
            value={model}
            onChange={e => setModel(e.target.value)}
          >
            <option value="gpt-4.1-mini">GPT-4.1 Mini</option>
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          </select>
        </div>
        <div>
          <label htmlFor="systemPrompt" className="block text-xs font-semibold mb-1">System Prompt</label>
          <textarea
            id="systemPrompt"
            className="w-full px-3 py-2 rounded bg-[#181a20] border border-gray-600 text-sm"
            value={systemPrompt}
            onChange={e => setSystemPrompt(e.target.value)}
            rows={3}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Upload PDF</label>
          <button
            className="w-full bg-[#2d323c] hover:bg-[#3a3f4b] text-xs py-2 rounded border border-gray-600 mb-1"
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
          {uploadStatus && <span className="text-green-400 text-xs mt-1 block">{uploadStatus}</span>}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 