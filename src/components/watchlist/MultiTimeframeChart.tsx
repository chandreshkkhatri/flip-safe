'use client';

import { ColorType, createChart, UTCTimestamp, CandlestickSeries } from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';

interface MultiTimeframeChartProps {
  symbol: string;
}

interface ChartData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
}

const MultiTimeframeChart: React.FC<MultiTimeframeChartProps> = ({ symbol }) => {
  const weekChartRef = useRef<HTMLDivElement>(null);
  const dayChartRef = useRef<HTMLDivElement>(null);
  const hourChartRef = useRef<HTMLDivElement>(null);
  
  const chartRefs = useRef<{ chart: any; series: any }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const timeframes = [
    { interval: '1w', label: '1 Week', ref: weekChartRef },
    { interval: '1d', label: '1 Day', ref: dayChartRef },
    { interval: '1h', label: '1 Hour', ref: hourChartRef },
  ];

  const createSingleChart = (container: HTMLDivElement, title: string) => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    const isMobile = window.innerWidth <= 768;
    const chartHeight = isMobile ? 180 : 220;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: chartHeight,
      layout: {
        background: { type: ColorType.Solid, color: isDarkMode ? '#18181b' : '#ffffff' },
        textColor: isDarkMode ? '#e4e4e7' : '#333',
      },
      grid: {
        vertLines: { color: isDarkMode ? '#27272a' : '#f0f0f0' },
        horzLines: { color: isDarkMode ? '#27272a' : '#f0f0f0' },
      },
      crosshair: {
        mode: 1, // Magnet
      },
      rightPriceScale: {
        borderColor: isDarkMode ? '#3f3f46' : '#e0e0e0',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: isDarkMode ? '#3f3f46' : '#e0e0e0',
        rightOffset: isMobile ? 3 : 8,
        barSpacing: isMobile ? 2 : 4,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderDownColor: '#ef5350',
      borderUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      wickUpColor: '#26a69a',
    });

    return { chart, series };
  };

  const fetchChartData = async (interval: string): Promise<ChartData[]> => {
    const response = await fetch(`/api/kc/historical-data?symbol=${symbol}&interval=${interval}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${interval} data`);
    }
    const data = await response.json();
    
    return data.map((d: any) => ({
      time: (new Date(d.date).getTime() / 1000) as UTCTimestamp,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));
  };

  useEffect(() => {
    const initializeCharts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Clear existing charts
        chartRefs.current.forEach(({ chart }) => {
          if (chart) chart.remove();
        });
        chartRefs.current = [];

        // Wait a bit for refs to be available
        await new Promise(resolve => setTimeout(resolve, 100));

        // Create charts for each timeframe
        const promises = timeframes.map(async (timeframe, index) => {
          if (!timeframe.ref.current) {
            return null;
          }

          const { chart, series } = createSingleChart(timeframe.ref.current, timeframe.label);
          chartRefs.current[index] = { chart, series };

          // Fetch and set data
          const data = await fetchChartData(timeframe.interval);
          series.setData(data);

          return { chart, series };
        });

        await Promise.all(promises);
        setLoading(false);
      } catch (err) {
        console.error('Error initializing charts:', err);
        setError('Failed to load chart data');
        setLoading(false);
      }
    };

    initializeCharts();

    // Resize handler
    const handleResize = () => {
      chartRefs.current.forEach(({ chart }, index) => {
        if (chart && timeframes[index].ref.current) {
          const isMobile = window.innerWidth <= 768;
          const chartHeight = isMobile ? 180 : 220;
          chart.resize(timeframes[index].ref.current.clientWidth, chartHeight);
        }
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartRefs.current.forEach(({ chart }) => {
        if (chart) chart.remove();
      });
    };
  }, [symbol]);

  if (loading) {
    return (
      <div className="multi-chart-loading">
        <div className="loading-spinner"></div>
        <p>Loading charts...</p>
        <style jsx>{`
          .multi-chart-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 600px;
            color: var(--muted-foreground);
          }
          .loading-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid var(--muted);
            border-top: 3px solid var(--primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="multi-chart-error">
        <p>⚠️ {error}</p>
        <style jsx>{`
          .multi-chart-error {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 200px;
            color: var(--destructive);
            text-align: center;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="multi-timeframe-charts">
      {timeframes.map((timeframe, index) => (
        <div key={timeframe.interval} className="chart-section">
          <div className="chart-header">
            <h4>{timeframe.label}</h4>
            <span className="symbol-name">{symbol}</span>
          </div>
          <div ref={timeframe.ref} className="chart-container" />
        </div>
      ))}

      <style jsx>{`
        .multi-timeframe-charts {
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .chart-section {
          background: var(--card);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        :global(.dark) .chart-section {
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: var(--muted);
          border-bottom: 1px solid var(--border);
        }

        .chart-header h4 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--foreground);
        }

        .symbol-name {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--muted-foreground);
          background: var(--background);
          padding: 4px 8px;
          border-radius: 4px;
          border: 1px solid var(--border);
        }

        .chart-container {
          width: 100%;
          height: 220px;
          position: relative;
          min-height: 220px;
          background: var(--background);
        }

        @media (max-width: 768px) {
          .multi-timeframe-charts {
            gap: 16px;
          }

          .chart-container {
            height: 180px;
          }

          .chart-header {
            padding: 10px 12px;
          }

          .chart-header h4 {
            font-size: 0.9rem;
          }

          .symbol-name {
            font-size: 0.8rem;
            padding: 3px 6px;
          }
        }

        @media (max-width: 480px) {
          .chart-header {
            flex-direction: column;
            gap: 8px;
            align-items: stretch;
          }

          .symbol-name {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default MultiTimeframeChart;