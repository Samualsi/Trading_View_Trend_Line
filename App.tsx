import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { CodeBlock } from './components/CodeBlock';
import { ChartIcon } from './components/icons/ChartIcon';

const App: React.FC = () => {
  const [symbol, setSymbol] = useState<string>('');
  const [script, setScript] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const generatePineScript = useCallback((basePrice: number, forSymbol: string) => {
    const base = Math.floor(Math.sqrt(basePrice));
    
    if (base < 2) {
      setError(`Price for ${forSymbol.toUpperCase()} is too low to generate meaningful trend lines (must be >= 4).`);
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
//@version=5
indicator("Perfect Square Trendlines (Generated)", overlay=true)

// Generated for symbol: ${forSymbol.toUpperCase()} around price: ${basePrice}
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) {
      setError('Please enter an asset symbol.');
      setScript('');
      return;
    }

    setIsLoading(true);
    setError('');
    setScript('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `What is the current price of the asset with the symbol ${symbol}? Respond with only the numerical value, without any currency symbols, commas, or explanatory text.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{googleSearch: {}}],
        },
      });

      const priceText = response.text;
      const cleanedPriceText = priceText.replace(/[^0-9.]/g, '');
      const numericPrice = parseFloat(cleanedPriceText);

      if (isNaN(numericPrice) || numericPrice <= 0) {
        setError(`Could not determine a valid price for "${symbol}". Please check the symbol and try again. The model may not have access to real-time data for this asset.`);
        return;
      }

      generatePineScript(numericPrice, symbol);

    } catch (err) {
      console.error("Error fetching price:", err);
      setError('Failed to fetch the price from the API. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <div className="inline-block bg-slate-800 p-4 rounded-full mb-4">
            <ChartIcon className="h-12 w-12 text-teal-400" />
          </div>
          <h1 className="text-4xl font-bold text-slate-100">Pine Script Trend Line Generator</h1>
          <p className="text-slate-400 mt-2">Enter an asset symbol to fetch its price and generate a TradingView script.</p>
        </header>

        <main className="bg-slate-800/50 rounded-lg shadow-2xl p-6 md:p-8 backdrop-blur-sm border border-slate-700">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="relative w-full">
              <label htmlFor="symbol" className="sr-only">Asset Symbol</label>
              <input
                id="symbol"
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="Enter symbol (e.g., BTCUSD, AAPL)"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-200 placeholder-slate-500"
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-teal-500 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Fetching Price...' : 'Generate Script'}
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