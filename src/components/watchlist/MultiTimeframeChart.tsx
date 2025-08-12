'use client';

import { ColorType, createChart, UTCTimestamp, IChartApi, CandlestickData, CandlestickSeries } from 'lightweight-charts';
import React, { useEffect, useRef, useState, useCallback, memo } from 'react';

interface MultiTimeframeChartProps {
  symbol: string;
}

// Test with just one chart first to isolate the issue
const timeframes = [
  { interval: '1d', label: '1 Day', index: 0 },
  // { interval: '1w', label: '1 Week', index: 1 },
  // { interval: '1h', label: '1 Hour', index: 2 },
];

const MultiTimeframeChart = memo<MultiTimeframeChartProps>(({ symbol }) => {
  const containerRefs = useRef<(HTMLDivElement | null)[]>([null]);
  const chartRefs = useRef<{ chart: IChartApi; series: any | null }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const setContainerRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    console.log(`Setting container ref for index ${index}:`, el ? 'element found' : 'element is null');
    containerRefs.current[index] = el;
  }, []);

  const createSingleChart = (container: HTMLDivElement) => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    const isMobile = window.innerWidth <= 768;
    const chartHeight = isMobile ? 180 : 220;
    
    const containerWidth = Math.max(container.clientWidth || 300, 300);

    const chart = createChart(container, {
      width: containerWidth,
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
        mode: 1,
      },
      rightPriceScale: {
        borderColor: isDarkMode ? '#3f3f46' : '#e0e0e0',
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: isDarkMode ? '#3f3f46' : '#e0e0e0',
        rightOffset: isMobile ? 3 : 8,
        barSpacing: isMobile ? 2 : 4,
      },
    });

    // Use the correct v5 API: addSeries(CandlestickSeries, options)
    console.log('Creating candlestick series with v5 API...');
    const candlestickOptions = {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderDownColor: '#ef5350',
      borderUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      wickUpColor: '#26a69a',
    };
    
    const series = chart.addSeries(CandlestickSeries, candlestickOptions);
    
    console.log('Candlestick series created:', series, typeof series);

    return { chart, series };
  };

  const fetchChartData = async (interval: string): Promise<CandlestickData[]> => {
    try {
      const response = await fetch(`/api/kc/historical-data?symbol=${symbol}&interval=${interval}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${interval} data: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data) || data.length === 0) {
        return [];
      }
      
      return data.map((d: any) => ({
        time: (new Date(d.date).getTime() / 1000) as UTCTimestamp,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));
    } catch (error) {
      console.error(`Error fetching chart data for ${interval}:`, error);
      throw error;
    }
  };

  useEffect(() => {
    console.log('Initializing charts for symbol:', symbol);
    
    const initializeCharts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Clear existing charts
        chartRefs.current.forEach(({ chart }) => {
          if (chart) chart.remove();
        });
        chartRefs.current = [];

        // Wait for container refs to be available 
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Create chart for the single timeframe
        const promises = timeframes.map(async (timeframe, index) => {
          const container = containerRefs.current[index];
          if (!container) {
            console.warn(`Container not available for ${timeframe.label}`);
            return null;
          }

          console.log(`Container found for ${timeframe.label}, dimensions:`, container.clientWidth, 'x', container.clientHeight);

          try {
            const { chart, series } = createSingleChart(container);
            chartRefs.current[index] = { chart, series };

            const data = await fetchChartData(timeframe.interval);
            
            console.log(`Series object for ${timeframe.label}:`, series);
            console.log(`Data points:`, data.length);
            
            if (data.length > 0 && series && typeof series.setData === 'function') {
              series.setData(data);
              chart.timeScale().fitContent();
              console.log(`Chart ${timeframe.label} loaded successfully with ${data.length} data points`);
            } else {
              console.warn(`Cannot set data for ${timeframe.label}: series=${!!series}, setData=${typeof series?.setData}, dataLength=${data.length}`);
            }

            return { chart, series };
          } catch (chartError) {
            console.error(`Failed to create chart for ${timeframe.label}:`, chartError);
            return null;
          }
        });

        await Promise.all(promises);
        setLoading(false);
      } catch (err) {
        console.error('Error initializing charts:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to load charts: ${errorMessage}`);
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(initializeCharts, 500);

    return () => {
      clearTimeout(timeoutId);
      chartRefs.current.forEach(({ chart }) => {
        if (chart) chart.remove();
      });
    };
  }, [symbol]);

  console.log('Component render state:', { loading, error });

  return (
    <div className="multi-timeframe-charts">
      {timeframes.map((timeframe) => {
        return (
          <div key={timeframe.interval} className="chart-section">
            <div className="chart-header">
              <h4>{timeframe.label}</h4>
              <span className="symbol-name">{symbol}</span>
            </div>
            <div className="chart-container-wrapper">
              <div ref={setContainerRef(timeframe.index)} className="chart-container" />
              {loading && (
                <div className="chart-loading-overlay">
                  <div className="loading-spinner"></div>
                  <p>Loading {timeframe.label}...</p>
                </div>
              )}
              {error && (
                <div className="chart-error-overlay">
                  <p>⚠️ {error}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}

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

        .chart-container-wrapper {
          position: relative;
          width: 100%;
          height: 220px;
        }

        .chart-container {
          width: 100%;
          height: 220px;
          position: relative;
          min-height: 220px;
          min-width: 300px;
          background: var(--background);
          display: block;
        }

        .chart-loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10;
          border-radius: 4px;
        }

        :global(.dark) .chart-loading-overlay {
          background: rgba(24, 24, 27, 0.9);
        }

        .loading-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid #e0e0e0;
          border-top: 2px solid #2196f3;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 8px;
        }

        .chart-loading-overlay p {
          margin: 0;
          font-size: 0.8rem;
          color: var(--foreground);
        }

        .chart-error-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 243, 205, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          border-radius: 4px;
        }

        .chart-error-overlay p {
          margin: 0;
          font-size: 0.8rem;
          color: #856404;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .multi-timeframe-charts {
            gap: 16px;
          }

          .chart-container-wrapper {
            height: 180px;
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
});

MultiTimeframeChart.displayName = 'MultiTimeframeChart';

export default MultiTimeframeChart;