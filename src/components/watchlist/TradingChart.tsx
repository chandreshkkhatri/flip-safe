'use client';

import { ColorType, createChart, UTCTimestamp, CandlestickSeries } from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';

interface TradingChartProps {
  symbol: string;
}

const TradingChart: React.FC<TradingChartProps> = ({ symbol }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<{ chart: any; series: any } | null>(null);
  const [timeframe, setTimeframe] = useState('1h');

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Adjust chart height based on screen size
    const isMobile = window.innerWidth <= 768;
    const chartHeight = isMobile ? 200 : 300;

    const isDarkMode = document.documentElement.classList.contains('dark');
    
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
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
          top: isMobile ? 0.15 : 0.1,
          bottom: isMobile ? 0.15 : 0.1,
        },
      },
      timeScale: {
        borderColor: isDarkMode ? '#3f3f46' : '#e0e0e0',
        rightOffset: isMobile ? 5 : 12,
        barSpacing: isMobile ? 3 : 6,
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

    chartRef.current = { chart, series };

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        const isMobile = window.innerWidth <= 768;
        const chartHeight = isMobile ? 200 : 300;
        chartRef.current.chart.resize(chartContainerRef.current.clientWidth, chartHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.chart.remove();
      }
    };
  }, []);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!chartRef.current) return;

      try {
        const response = await fetch(
          `/api/kc/historical-data?symbol=${symbol}&interval=${timeframe}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch historical data');
        }
        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error('Historical data is not in expected format');
        }

        const formattedData = data.map((d: any) => ({
          time: (new Date(d.date).getTime() / 1000) as UTCTimestamp,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }));

        chartRef.current.series.setData(formattedData);
      } catch (error) {
        // eslint-disable-next-line no-console -- error is surfaced for debugging
        console.error('Error fetching historical data:', error);
      }
    };

    fetchHistoricalData();
  }, [symbol, timeframe]);

  return (
    <div className="trading-chart">
      <div className="chart-controls">
        <select value={timeframe} onChange={e => setTimeframe(e.target.value)}>
          <option value="1m">1m</option>
          <option value="5m">5m</option>
          <option value="15m">15m</option>
          <option value="1h">1h</option>
          <option value="4h">4h</option>
          <option value="1d">1d</option>
        </select>
      </div>
      <div ref={chartContainerRef} className="chart-container" />
      <style jsx>{`
        .trading-chart {
          width: 100%;
          display: flex;
          flex-direction: column;
        }

        .chart-controls {
          padding: 8px;
          background: var(--muted);
          color: var(--muted-foreground);
          border-bottom: 1px solid var(--border);
        }

        .chart-controls select {
          padding: 4px 8px;
          border: 1px solid var(--border);
          border-radius: 4px;
          font-size: 0.85rem;
          background: var(--background);
          color: var(--foreground);
          cursor: pointer;
        }

        .chart-container {
          width: 100%;
          height: 300px;
        }

        @media (max-width: 768px) {
          .chart-container {
            height: 200px;
          }

          .chart-controls {
            padding: 6px;
          }

          .chart-controls select {
            font-size: 0.9rem;
            padding: 6px 10px;
          }
        }

        @media (max-width: 480px) {
          .chart-container {
            height: 180px;
          }
        }
      `}</style>
    </div>
  );
};

export default TradingChart;
