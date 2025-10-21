import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { CodeBlock } from './components/CodeBlock';
import { ChartIcon } from './components/icons/ChartIcon';
import { FloatingHelpButton } from './components/FloatingHelpButton';
import { HelpModal } from './components/HelpModal';
import { ThemeToggleButton } from './components/ThemeToggleButton';

// --- Type Definitions ---
type Sender = 'user' | 'bot';
type Theme = 'light' | 'dark';

interface Message {
  id: number;
  sender: Sender;
  content: React.ReactNode;
}

// --- Helper Components ---

const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const LoadingIndicator: React.FC = () => (
    <div className="flex items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-slate-500 dark:bg-slate-400 animate-pulse"></div>
        <div className="w-2 h-2 rounded-full bg-slate-500 dark:bg-slate-400 animate-pulse [animation-delay:0.2s]"></div>
        <div className="w-2 h-2 rounded-full bg-slate-500 dark:bg-slate-400 animate-pulse [animation-delay:0.4s]"></div>
    </div>
);

const LevelsDisplay: React.FC<{ levels: number[] }> = ({ levels }) => (
    <div className="my-4 p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
        <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Levels:</h4>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center">
            {levels.map((level, index) => {
                const isBase = index === 2;
                return (
                    <div key={index} className={`p-2 rounded-md flex items-center justify-center ${isBase ? 'bg-teal-600 font-bold text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'}`}>
                        <p className="font-mono text-sm sm:text-base">{level.toLocaleString()}</p>
                    </div>
                );
            })}
        </div>
    </div>
);


const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
    const isBot = message.sender === 'bot';
    return (
        <div className={`flex items-start gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isBot ? 'bg-slate-200 dark:bg-slate-700' : 'bg-slate-500 dark:bg-slate-600'}`}>
                {isBot ? <ChartIcon className="w-5 h-5 text-teal-500 dark:text-teal-400" /> : <UserIcon className="w-5 h-5 text-slate-100 dark:text-slate-300" />}
            </div>
            <div className={`p-3 rounded-lg max-w-[85%] sm:max-w-md ${isBot ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-sm' : 'bg-teal-600 text-white'}`}>
                {message.content}
            </div>
        </div>
    );
};

// --- Main App Component ---

const initialMessage: Message = {
    id: 1,
    sender: 'bot',
    content: 'Hello! I can generate a Pine Script for you. Please enter an asset symbol to get started (e.g., BTCUSD, AAPL).'
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme');
      if (storedTheme === 'light' || storedTheme === 'dark') {
        return storedTheme;
      }
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#1e293b' : '#f1f5f9');
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const generatePineScript = useCallback((basePrice: number, forSymbol: string): { script: string; levels: number[] } | { error: string } => {
    const base = Math.floor(Math.sqrt(basePrice));
    
    if (base < 2) {
      return { error: `Price for ${forSymbol.toUpperCase()} is too low to generate meaningful trend lines (must be >= 4).` };
    }

    const levels = [
      (base - 2) * (base - 2), (base - 1) * (base - 1), base * base,
      (base + 1) * (base + 1), (base + 2) * (base + 2),
    ];
    const adjustedLevels = levels.map(level => (level % 2 === 0 ? level + 1 : level));

    const scriptContent = `
//@version=6
indicator("Trendlines (Generated)", overlay=true)

// Generated for symbol: ${forSymbol.toUpperCase()} around price: ${basePrice}

hline(${adjustedLevels[0]}, "Level -2", color=color.new(color.gray, 25), linestyle=hline.style_solid, linewidth=2)
hline(${adjustedLevels[1]}, "Level -1", color=color.new(color.gray, 25), linestyle=hline.style_solid, linewidth=2)
hline(${adjustedLevels[2]}, "Base Level", color=color.new(color.blue, 25), linestyle=hline.style_solid, linewidth=3)
hline(${adjustedLevels[3]}, "Level +1", color=color.new(color.gray, 25), linestyle=hline.style_solid, linewidth=2)
hline(${adjustedLevels[4]}, "Level +2", color=color.new(color.gray, 25), linestyle=hline.style_solid, linewidth=2)
`.trim();
    return { script: scriptContent, levels: adjustedLevels };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const symbol = inputValue.trim();
    if (!symbol || isLoading) return;

    setIsLoading(true);
    setInputValue('');
    
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', content: symbol }]);
    const loadingMessageId = Date.now() + 1;
    setMessages(prev => [...prev, { id: loadingMessageId, sender: 'bot', content: <LoadingIndicator /> }]);

    let botResponse: React.ReactNode;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `What is the current price of the asset with the symbol ${symbol}? Respond with only the numerical value, without any currency symbols, commas, or explanatory text.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] },
      });

      const priceText = response.text;
      const cleanedPriceText = priceText.replace(/[^0-9.]/g, '');
      const numericPrice = parseFloat(cleanedPriceText);

      if (isNaN(numericPrice) || numericPrice <= 0) {
        throw new Error(`Could not determine a valid price for "${symbol}". Please check the symbol and try again.`);
      }

      const result = generatePineScript(numericPrice, symbol);
      if ('script' in result) {
        botResponse = (
          <div>
            <p className="mb-2">Here is the Pine Script for <strong>{symbol.toUpperCase()}</strong> based on its current price of ~${numericPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2})}:</p>
            <LevelsDisplay levels={result.levels} />
            <CodeBlock code={result.script} />
          </div>
        );
      } else {
        botResponse = result.error;
      }
    } catch (error: any) {
      botResponse = error.message || 'An unexpected error occurred. Please try again.';
    } finally {
      setMessages(prev => {
          const filteredMessages = prev.filter(m => m.id !== loadingMessageId);
          return [...filteredMessages, { id: Date.now(), sender: 'bot', content: botResponse }];
      });
      setIsLoading(false);
    }
  };
  
  const handleClear = () => {
    setInputValue('');
    setMessages([{...initialMessage, id: Date.now()}]);
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-sans">
        <header className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm p-4 border-b border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center">
                <ChartIcon className="w-6 h-6 mr-3 text-teal-500 dark:text-teal-400" />
                <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">Trend Line generator</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggleButton theme={theme} onToggle={handleThemeToggle} />
              <FloatingHelpButton onClick={() => setIsHelpModalOpen(true)} />
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          <div className="space-y-6 max-w-2xl mx-auto">
            {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
            ))}
          </div>
          <div ref={messagesEndRef} />
        </main>
        
        <footer className="p-3 sm:p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-3 max-w-2xl mx-auto">
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter an asset symbol (e.g., BTCUSD)"
                className="flex-1 p-2 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 transition w-full text-slate-800 dark:text-slate-200"
                disabled={isLoading}
                aria-label="Asset symbol input"
            />
            <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition"
                aria-label="Send message"
            >
                {isLoading ? 'Generating...' : 'Generate'}
            </button>
            <button
                type="button"
                onClick={handleClear}
                disabled={isLoading || messages.length <= 1}
                className="px-4 py-2 bg-slate-500 text-white rounded-md hover:bg-slate-600 dark:hover:bg-slate-500 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed transition"
                aria-label="Clear conversation"
            >
                Clear
            </button>
            </form>
        </footer>
        <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
    </div>
  );
};

export default App;