
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { CodeBlock } from './components/CodeBlock';
import { ChartIcon } from './components/icons/ChartIcon';

// --- Type Definitions ---
type Sender = 'user' | 'bot';

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
        <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse"></div>
        <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse [animation-delay:0.2s]"></div>
        <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse [animation-delay:0.4s]"></div>
    </div>
);

const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
    const isBot = message.sender === 'bot';
    return (
        <div className={`flex items-start gap-3 ${isBot ? '' : 'justify-end'}`}>
            {isBot && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                    <ChartIcon className="w-5 h-5 text-teal-400" />
                </div>
            )}
            <div className={`p-3 rounded-lg max-w-lg ${isBot ? 'bg-slate-700 text-slate-300' : 'bg-teal-600 text-white'}`}>
                {message.content}
            </div>
            {!isBot && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-slate-300" />
                </div>
            )}
        </div>
    );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
      { id: Date.now(), sender: 'bot', content: 'Hello! I can generate a Pine Script for you. Please enter an asset symbol to get started (e.g., BTCUSD, AAPL).' }
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generatePineScript = useCallback((basePrice: number, forSymbol: string): { script: string } | { error: string } => {
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
//@version=5
indicator("Perfect Square Trendlines (Generated)", overlay=true)

// Generated for symbol: ${forSymbol.toUpperCase()} around price: ${basePrice}
// Base perfect square root: ${base}
// Logic: If a calculated level is an even number, 1 is added to it.

plot(${adjustedLevels[0]}, "Level -2", color=color.white, style=plot.style_line, linewidth=2)
plot(${adjustedLevels[1]}, "Level -1", color=color.white, style=plot.style_line, linewidth=2)
plot(${adjustedLevels[2]}, "Base Level", color=color.white, style=plot.style_line, linewidth=3)
plot(${adjustedLevels[3]}, "Level +1", color=color.white, style=plot.style_line, linewidth=2)
plot(${adjustedLevels[4]}, "Level +2", color=color.white, style=plot.style_line, linewidth=2)
`.trim();
    return { script: scriptContent };
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
                <p className="mb-4">Here is the Pine Script for {symbol.toUpperCase()}:</p>
                <CodeBlock code={result.script} />
                <div className="mt-4 p-3 bg-slate-800 rounded-lg border border-slate-600">
                  <h3 className="font-semibold text-md text-teal-400 mb-2">How to use:</h3>
                  <ol className="list-decimal list-inside text-slate-400 space-y-1 text-sm">
                      <li>Click the 'Copy' button on the script block.</li>
                      <li>Open your chart on <a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer" className="text-teal-500 hover:underline">TradingView</a>.</li>
                      <li>Open the 'Pine Editor' tab at the bottom.</li>
                      <li>Paste the script and click 'Add to Chart'.</li>
                  </ol>
              </div>
            </div>
        );
      } else {
        botResponse = result.error;
      }

    } catch (err) {
      console.error("Error in bot response generation:", err);
      botResponse = (err as Error).message || 'An unexpected error occurred. Please try again.';
    } finally {
      setMessages(prev => prev.filter(m => m.id !== loadingMessageId));
      setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', content: botResponse }]);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans flex flex-col p-4">
      <div className="w-full max-w-2xl mx-auto flex flex-col h-[calc(100vh-2rem)]">
        <header className="text-center mb-4 shrink-0">
          <h1 className="text-3xl font-bold text-slate-100">Pine Script Bot</h1>
          <p className="text-slate-400 mt-1">Chat to generate a TradingView script.</p>
        </header>

        <main className="bg-slate-800/50 rounded-lg shadow-2xl backdrop-blur-sm border border-slate-700 flex-grow flex flex-col overflow-hidden">
            <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                {messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
                <div ref={messagesEndRef} />
            </div>
          
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700 bg-slate-800/70 flex items-center gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter symbol (e.g., BTCUSD, AAPL)"
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-full focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-200 placeholder-slate-500"
                required
                disabled={isLoading}
              />
              <button
                type="submit"
                className="px-5 py-2 bg-teal-600 text-white font-semibold rounded-full hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-teal-500 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !inputValue.trim()}
              >
                Send
              </button>
            </form>
        </main>
      </div>
    </div>
  );
};

export default App;
