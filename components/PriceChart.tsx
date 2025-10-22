import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, LineData, CandlestickData, Time } from 'lightweight-charts';

interface PriceChartProps {
    basePrice: number;
    levels: number[];
    theme: 'light' | 'dark';
}

type ChartType = 'line' | 'candlestick';

// --- Chart Data Generation ---
const generateCandlestickData = (basePrice: number, count = 50): CandlestickData[] => {
    const data: CandlestickData[] = [];
    let lastClose = basePrice * (1 + (Math.random() - 0.5) * 0.1); // Start within 10% of base price
    const today = new Date();

    for (let i = 0; i < count; i++) {
        const date = new Date(today.getTime() - (count - i) * 24 * 60 * 60 * 1000);
        const time = (date.getTime() / 1000) as Time;

        const open = lastClose;
        const close = open + (Math.random() - 0.5) * (basePrice * 0.02);
        const high = Math.max(open, close) + Math.random() * (basePrice * 0.01);
        const low = Math.min(open, close) - Math.random() * (basePrice * 0.01);

        data.push({ time, open, high, low, close });
        lastClose = close;
    }
    return data;
};

const generateLineData = (candlestickData: CandlestickData[]): LineData[] => {
    return candlestickData.map(d => ({ time: d.time, value: d.close }));
};

const ChartTypeButton: React.FC<{ type: ChartType; currentType: ChartType; onClick: (type: ChartType) => void; children: React.ReactNode }> = ({ type, currentType, onClick, children }) => {
    const isActive = type === currentType;
    return (
        <button
            onClick={() => onClick(type)}
            className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors ${
                isActive
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-300/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-400/60 dark:hover:bg-slate-700/60'
            }`}
            aria-pressed={isActive}
        >
            {children}
        </button>
    );
};

export const PriceChart: React.FC<PriceChartProps> = ({ basePrice, levels, theme }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<'Line' | 'Candlestick'> | null>(null);
    const [chartType, setChartType] = useState<ChartType>('line');

    const candlestickData = useMemo(() => generateCandlestickData(basePrice), [basePrice]);
    const lineData = useMemo(() => generateLineData(candlestickData), [candlestickData]);

    // Effect for chart creation and destruction
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 250,
        });
        chartRef.current = chart;

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
            chartRef.current = null;
        };
    }, []);

    // Effect for updating theme
    useEffect(() => {
        const chart = chartRef.current;
        if (!chart) return;

        const isDark = theme === 'dark';
        chart.applyOptions({
            layout: {
                background: { type: ColorType.Solid, color: isDark ? '#1e293b' : '#ffffff' },
                textColor: isDark ? '#d1d5db' : '#1f2937',
            },
            grid: {
                vertLines: { color: isDark ? '#334155' : '#e5e7eb' },
                horzLines: { color: isDark ? '#334155' : '#e5e7eb' },
            },
            rightPriceScale: {
                borderColor: isDark ? '#334155' : '#e5e7eb',
            },
            timeScale: {
                borderColor: isDark ? '#334155' : '#e5e7eb',
                timeVisible: true,
                secondsVisible: false,
            }
        });
    }, [theme]);

    // Effect for updating series and levels
    useEffect(() => {
        const chart = chartRef.current;
        if (!chart) return;

        if (seriesRef.current) {
            chart.removeSeries(seriesRef.current);
            seriesRef.current = null;
        }

        let newSeries: ISeriesApi<'Line' | 'Candlestick'>;

        if (chartType === 'line') {
            newSeries = chart.addLineSeries({
                color: theme === 'dark' ? '#94a3b8' : '#6b7280',
                lineWidth: 2,
            });
            newSeries.setData(lineData);
        } else {
            newSeries = chart.addCandlestickSeries({
                upColor: theme === 'dark' ? '#22c55e' : '#16a34a',
                downColor: theme === 'dark' ? '#ef4444' : '#dc2626',
                borderDownColor: theme === 'dark' ? '#ef4444' : '#dc2626',
                borderUpColor: theme === 'dark' ? '#22c55e' : '#16a34a',
                wickDownColor: theme === 'dark' ? '#ef4444' : '#dc2626',
                wickUpColor: theme === 'dark' ? '#22c55e' : '#16a34a',
            });
            newSeries.setData(candlestickData);
        }

        seriesRef.current = newSeries;
        
        levels.forEach((level, index) => {
            const isSupport = index < 4;
            const isBase = index === 4;
            const isResistance = index > 4;

            let color = '';
            let title = '';
            if (isBase) {
                color = theme === 'dark' ? '#d97706' : '#f59e0b';
                title = `Base: ${level.toLocaleString()}`
            } else if (isSupport) {
                color = theme === 'dark' ? '#22c55e' : '#16a34a';
                title = `S${4 - index}: ${level.toLocaleString()}`;
            } else if (isResistance) {
                color = theme === 'dark' ? '#ef4444' : '#dc2626';
                title = `R${index - 4}: ${level.toLocaleString()}`;
            }

            newSeries.createPriceLine({
                price: level,
                color: color,
                lineWidth: 2,
                lineStyle: 2, // Dashed
                axisLabelVisible: true,
                title: title,
            });
        });

        chart.timeScale().fitContent();

    }, [chartType, levels, lineData, candlestickData, theme]);

    return (
        <div className="relative group">
            <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-md bg-slate-200/20 dark:bg-slate-900/20 backdrop-blur-sm p-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
                <ChartTypeButton type="line" currentType={chartType} onClick={setChartType}>Line</ChartTypeButton>
                <ChartTypeButton type="candlestick" currentType={chartType} onClick={setChartType}>Candle</ChartTypeButton>
            </div>
            <div ref={chartContainerRef} className="w-full h-[250px] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700" />
        </div>
    );
};
