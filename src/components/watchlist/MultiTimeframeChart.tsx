'use client';

import { ColorType, createChart, UTCTimestamp, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';
import React, { useEffect, useRef, useState, useCallback } from 'react';

interface MultiTimeframeChartProps {
  symbol: string;
}

type ChartData = CandlestickData;

const MultiTimeframeChart: React.FC<MultiTimeframeChartProps> = ({ symbol }) => {
  const containerRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);
  const chartRefs = useRef<{ chart: IChartApi; series: ISeriesApi<'Candlestick'> | null }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeframes = [
    { interval: '1w', label: '1 Week', index: 0 },
    { interval: '1d', label: '1 Day', index: 1 },
    { interval: '1h', label: '1 Hour', index: 2 },
  ];
  
  const setContainerRef = (index: number) => (el: HTMLDivElement | null) => {
    containerRefs.current[index] = el;
  };

  const createSingleChart = (container: HTMLDivElement) => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    const isMobile = window.innerWidth <= 768;
    const chartHeight = isMobile ? 180 : 220;
    
    // Ensure container has minimum dimensions
    const containerWidth = Math.max(container.clientWidth || 300, 300);
    console.log(`Creating chart with dimensions: ${containerWidth}x${chartHeight}`);

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

    // Using type assertion to work around TypeScript definition issue
    let series;
    try {
      series = (chart as any).addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderDownColor: '#ef5350',
        borderUpColor: '#26a69a',
        wickDownColor: '#ef5350',
        wickUpColor: '#26a69a',
      }) as ISeriesApi<'Candlestick'>;
    } catch (seriesError) {
      console.error('Failed to add candlestick series:', seriesError);
      throw new Error('Chart library initialization failed');
    }

    return { chart, series };
  };

  const fetchChartData = async (interval: string): Promise<ChartData[]> => {
    try {
      console.log(`Fetching chart data for ${symbol} with interval ${interval}`);
      const response = await fetch(`/api/kc/historical-data?symbol=${symbol}&interval=${interval}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch ${interval} data:`, errorText);
        throw new Error(`Failed to fetch ${interval} data: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Received ${data.length} data points for ${interval}`);
      
      if (!Array.isArray(data) || data.length === 0) {
        console.warn(`No data received for ${interval}`);
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
    const initializeCharts = async () => {
      try {
        console.log('Initializing charts for symbol:', symbol);
        setLoading(true);
        setError(null);

        // Clear existing charts
        chartRefs.current.forEach(({ chart }) => {
          if (chart) chart.remove();
        });
        chartRefs.current = [];

        // Wait for DOM to be ready and refs to be available
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
          const availableContainers = timeframes.filter((tf, index) => {
            const container = containerRefs.current[index];
            const isAvailable = !!container;
            if (!isAvailable) {
              console.log(`Container for ${tf.label} is not available. Ref:`, container);
              // Check if element exists in DOM by ID or class
              const elements = document.querySelectorAll('.chart-container');
              console.log(`Found ${elements.length} .chart-container elements in DOM`);
            } else {
              console.log(`Container for ${tf.label} is available with dimensions:`, 
                container!.clientWidth, 'x', container!.clientHeight);
            }
            return isAvailable;
          });
          
          console.log(`Attempt ${attempts + 1}: ${availableContainers.length} of ${timeframes.length} chart containers available`);
          
          if (availableContainers.length === timeframes.length) {
            break;
          }
          
          await new Promise(resolve => setTimeout(resolve, 150));
          attempts++;
        }
        
        const availableContainers = containerRefs.current.filter(ref => ref !== null);
        if (availableContainers.length === 0) {
          console.error('No chart containers are available after all attempts');
          setError('Chart containers could not be initialized. This may be due to the modal not being fully rendered.');
          setLoading(false);
          return;
        }

        // Create charts for each timeframe
        const promises = timeframes.map(async (timeframe, index) => {
          const container = containerRefs.current[index];
          if (!container) {
            console.warn(`Container not available for ${timeframe.label}`);
            return null;
          }

          console.log(`Creating chart for ${timeframe.label}`);
          
          try {
            const { chart, series } = createSingleChart(container);
            chartRefs.current[index] = { chart, series };

            try {
              // Fetch and set data
              const data = await fetchChartData(timeframe.interval);
              console.log(`Setting ${data.length} data points for ${timeframe.label}`);
              
              if (data.length > 0) {
                series.setData(data);
                // Fit content to the chart
                chart.timeScale().fitContent();
                console.log(`Chart ${timeframe.label} loaded successfully`);
              } else {
                console.warn(`No data to display for ${timeframe.label}`);
              }
            } catch (dataError) {
              console.error(`Failed to load data for ${timeframe.label}:`, dataError);
              // Continue with other charts even if one fails
            }

            return { chart, series };
          } catch (chartError) {
            console.error(`Failed to create chart for ${timeframe.label}:`, chartError);
            return null;
          }
        });

        const results = await Promise.all(promises);
        const successfulCharts = results.filter(result => result !== null);
        console.log(`Successfully created ${successfulCharts.length} charts`);
        setLoading(false);
      } catch (err) {
        console.error('Error initializing charts:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to load charts: ${errorMessage}`);
        setLoading(false);
      }
    };

    // Use requestAnimationFrame to ensure DOM is ready
    const initCharts = () => {
      requestAnimationFrame(() => {
        initializeCharts();
      });
    };
    
    // Delay initialization to ensure modal is fully rendered
    const timeoutId = setTimeout(initCharts, 300);

    // Resize handler
    const handleResize = () => {
      chartRefs.current.forEach(({ chart }, index) => {
        const container = containerRefs.current[index];
        if (chart && container) {
          const isMobile = window.innerWidth <= 768;
          const chartHeight = isMobile ? 180 : 220;
          chart.resize(container.clientWidth, chartHeight);
        }
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      chartRefs.current.forEach(({ chart }) => {
        if (chart) chart.remove();
      });
    };
  }, [symbol]);

  console.log('Component render state:', { loading, error, containerRefs: containerRefs.current });
  
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
      {timeframes.map((timeframe) => {
        console.log(`Rendering ${timeframe.label} container`);
        return (
          <div key={timeframe.interval} className="chart-section">
            <div className="chart-header">
              <h4>{timeframe.label}</h4>
              <span className="symbol-name">{symbol}</span>
            </div>
            <div ref={setContainerRef(timeframe.index)} className="chart-container" />
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

        .chart-container {
          width: 100%;
          height: 220px;
          position: relative;
          min-height: 220px;
          min-width: 300px;
          background: var(--background);
          display: block;
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