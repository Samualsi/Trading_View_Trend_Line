import React, { useState } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';

interface CodeBlockProps {
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="relative group">
      <pre className="bg-slate-200 dark:bg-slate-900 text-slate-800 dark:text-slate-300 p-4 rounded-lg overflow-x-auto border border-slate-300 dark:border-slate-700">
        <code className="font-mono text-sm">{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 bg-slate-300 dark:bg-slate-700 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-400 dark:hover:bg-slate-600 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="Copy to clipboard"
      >
        {isCopied ? (
          <CheckIcon className="w-5 h-5 text-green-500" />
        ) : (
          <CopyIcon className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};