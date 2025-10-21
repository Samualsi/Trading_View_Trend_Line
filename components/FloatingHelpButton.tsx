import React from 'react';
import { QuestionMarkIcon } from './icons/QuestionMarkIcon';

interface FloatingHelpButtonProps {
    onClick: () => void;
}

export const FloatingHelpButton: React.FC<FloatingHelpButtonProps> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="p-2 bg-slate-200/50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 rounded-full hover:bg-slate-300 dark:hover:bg-slate-700 hover:text-teal-500 dark:hover:text-teal-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-teal-500"
        aria-label="Show help"
    >
        <QuestionMarkIcon className="w-6 h-6" />
    </button>
);