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

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 300,
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      crosshair: {
        mode: 1, // Magnet
      },
      rightPriceScale: {
        borderColor: '#e0e0e0',
      },
      timeScale: {
        borderColor: '#e0e0e0',
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
      if (chartRef.current) {
        chartRef.current.chart.resize(chartContainerRef.current!.clientWidth, 300);
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
      <div ref={chartContainerRef} style={{ width: '100%', height: '300px' }} />
    </div>
  );
};

export default TradingChart;
