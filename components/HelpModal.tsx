
import React, { useEffect } from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Step: React.FC<{ number: number; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
    <li className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center font-bold text-white">
            {number}
        </div>
        <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h4>
            <div className="text-slate-600 dark:text-slate-400">{children}</div>
        </div>
    </li>
);

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl p-6 w-full max-w-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="help-modal-title" className="text-xl font-bold text-slate-800 dark:text-slate-100">
            How to Use Pine Script in TradingView
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 transition"
            aria-label="Close help modal"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <ol className="space-y-4">
          <Step number={1} title="Copy the Script">
              Click the copy icon on the generated code block to copy the entire script to your clipboard.
          </Step>
          <Step number={2} title="Open TradingView">
              Navigate to your chart on{' '}
              <a href="https://www.tradingview.com/chart/" target="_blank" rel="noopener noreferrer" className="text-teal-500 dark:text-teal-400 hover:underline">
                  TradingView.com
              </a>.
          </Step>
          <Step number={3} title="Open Pine Editor">
              At the bottom of the chart screen, click on the <strong className="font-semibold text-slate-700 dark:text-slate-200">"Pine Editor"</strong> tab.
          </Step>
          <Step number={4} title="Paste the Script">
              Delete any existing content in the editor and paste the script you copied earlier.
          </Step>
          <Step number={5} title="Add to Chart">
              Click the <strong className="font-semibold text-slate-700 dark:text-slate-200">"Add to Chart"</strong> button located above the editor. The trend lines will now appear on your chart!
          </Step>
        </ol>
      </div>
    </div>
  );
};
