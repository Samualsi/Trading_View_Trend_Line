
import React, { useState, useCallback } from 'react';
import { CodeBlock } from './components/CodeBlock';
import { ChartIcon } from './components/icons/ChartIcon';

const App: React.FC = () => {
  const [price, setPrice] = useState<string>('');
  const [script, setScript] = useState<string>('');
  const [error, setError] = useState<string>('');

  const generatePineScript = useCallback((basePrice: number) => {
    const base = Math.floor(Math.sqrt(basePrice));
    
    if (base < 2) {
      setError("Price is too low to generate meaningful trend lines. Please enter a price greater than or equal to 4.");
      setScript('');
      return;
    }

    const levels = [
      (base - 2) * (base - 2),
      (base - 1) * (base - 1),
      base * base,
      (base + 1) * (base + 1),
      (base + 2) * (base + 2),
    ];

    const adjustedLevels = levels.map(level => (level % 2 === 0 ? level + 1 : level));

    const scriptContent = `
//@version=6
indicator("Perfect Square Trendlines (Generated)", overlay=true)

// Generated for a price around: ${basePrice}
// Base perfect square root: ${base}
// Logic: If a calculated level is an even number, 1 is added to it.

// --- Trendline Levels ---
plot(${adjustedLevels[0]}, "Level -2", color=color.white, style=plot.style_line, linewidth=2)
plot(${adjustedLevels[1]}, "Level -1", color=color.white, style=plot.style_line, linewidth=2)
plot(${adjustedLevels[2]}, "Base Level", color=color.white, style=plot.style_line, linewidth=3)
plot(${adjustedLevels[3]}, "Level +1", color=color.white, style=plot.style_line, linewidth=2)
plot(${adjustedLevels[4]}, "Level +2", color=color.white, style=plot.style_line, linewidth=2)
`;
    setScript(scriptContent.trim());
    setError('');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setError('Please enter a valid, positive number for the price.');
      setScript('');
      return;
    }
    generatePineScript(numericPrice);
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <div className="inline-block bg-slate-800 p-4 rounded-full mb-4">
            <ChartIcon className="h-12 w-12 text-teal-400" />
          </div>
          <h1 className="text-4xl font-bold text-slate-100">Pine Script Trend Line Generator</h1>
          <p className="text-slate-400 mt-2">Create a TradingView script to draw 5 trend lines based on the square root of a price.</p>
        </header>

        <main className="bg-slate-800/50 rounded-lg shadow-2xl p-6 md:p-8 backdrop-blur-sm border border-slate-700">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="relative w-full">
              <label htmlFor="price" className="sr-only">Current Price</label>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                id="price"
                type="number"
                step="any"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter current symbol price (e.g., 50000)"
                className="w-full pl-7 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-200 placeholder-slate-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-teal-500 transition-colors shrink-0"
            >
              Generate Script
            </button>
          </form>

          {error && (
            <div className="bg-red-900/50 text-red-300 border border-red-700 p-3 rounded-md text-center mb-6">
              {error}
            </div>
          )}

          {script && (
            <div className="mt-8 animate-fade-in">
              <h2 className="text-xl font-semibold text-slate-200 mb-3">Generated Pine Script</h2>
              <CodeBlock code={script} />
              <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                  <h3 className="font-semibold text-lg text-teal-400 mb-2">How to use:</h3>
                  <ol className="list-decimal list-inside text-slate-400 space-y-1">
                      <li>Click the 'Copy' button above to copy the script.</li>
                      <li>Open your chart on <a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer" className="text-teal-500 hover:underline">TradingView</a>.</li>
                      <li>At the bottom of the screen, click on the 'Pine Editor' tab.</li>
                      <li>Paste the copied script into the editor.</li>
                      <li>Click 'Add to Chart'. The trend lines will appear on your chart.</li>
                  </ol>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
