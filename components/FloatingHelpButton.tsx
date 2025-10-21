import React from 'react';
import { QuestionMarkIcon } from './icons/QuestionMarkIcon';

interface FloatingHelpButtonProps {
    onClick: () => void;
}

export const FloatingHelpButton: React.FC<FloatingHelpButtonProps> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="fixed top-4 right-4 z-20 w-14 h-14 bg-teal-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-teal-500 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-teal-500"
        aria-label="Show help"
    >
        <QuestionMarkIcon className="w-7 h-7" />
    </button>
);