'use client';

import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { memo, useEffect, useState } from 'react';

interface SymbolSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  instrument_type?: string;
  token?: string;
}

interface SymbolSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSymbol: (symbol: string) => void;
  accountType: string;
}

const SymbolSearchModal = memo(function SymbolSearchModal({
  isOpen,
  onClose,
  onSelectSymbol,
  accountType,
}: SymbolSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SymbolSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const searchTimeout = setTimeout(() => {
      searchSymbols();
    }, 500); // Debounce search

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const searchSymbols = async () => {
    try {
      setLoading(true);
      setError(null);

      // Search in local database - no need for accountId
      const response = await fetch(
        `/api/search/symbols?query=${encodeURIComponent(searchQuery)}&vendor=${accountType}`
      );
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.results);
      } else {
        setError(data.error || 'Failed to search symbols');
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Error searching symbols:', err);
      setError('Failed to search symbols');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSymbol = (symbol: string) => {
    onSelectSymbol(symbol);
    setSearchQuery('');
    setSearchResults([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Symbol to Watchlist</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder={`Search ${accountType} symbols...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="search-input"
              autoFocus
            />
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading && <div className="loading-state">Searching symbols...</div>}

        {!loading && searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map(result => (
              <div
                key={result.symbol}
                className="search-result-item"
                onClick={() => handleSelectSymbol(result.symbol)}
              >
                <div className="symbol-info">
                  <div className="symbol-name">{result.symbol}</div>
                  <div className="symbol-details">
                    {result.name} • {result.exchange}
                    {result.instrument_type && ` • ${result.instrument_type}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && searchQuery.length >= 2 && searchResults.length === 0 && (
          <div className="no-results">No symbols found matching "{searchQuery}"</div>
        )}

        {searchQuery.length < 2 && <div className="hint">Type at least 2 characters to search</div>}

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
          }

          .modal-content {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          }

          :global(.dark) .modal-content {
            background: #18181b;
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #e5e5e5;
          }

          :global(.dark) .modal-header {
            border-bottom-color: #3f3f46;
          }

          .modal-header h2 {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 600;
            color: #333;
          }

          :global(.dark) .modal-header h2 {
            color: #ffffff;
          }

          .search-container {
            padding: 20px;
          }

          .search-input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
          }

          .search-icon {
            position: absolute;
            left: 12px;
            color: #666;
          }

          .search-input {
            width: 100%;
            padding: 12px 12px 12px 44px;
            border: 1px solid #e5e5e5;
            border-radius: 8px;
            font-size: 1rem;
            background: #ffffff;
            color: #333;
            outline: none;
            transition: border-color 0.2s;
          }

          :global(.dark) .search-input {
            background: #27272a;
            border-color: #3f3f46;
            color: #ffffff;
          }

          .search-input:focus {
            border-color: #3b82f6;
          }

          .error-message {
            margin: 0 20px;
            padding: 12px;
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            color: #dc2626;
            font-size: 0.875rem;
          }

          :global(.dark) .error-message {
            background: rgba(220, 38, 38, 0.1);
            border-color: rgba(220, 38, 38, 0.3);
            color: #fca5a5;
          }

          .loading-state {
            padding: 40px;
            text-align: center;
            color: #666;
          }

          :global(.dark) .loading-state {
            color: #a1a1aa;
          }

          .search-results {
            flex: 1;
            overflow-y: auto;
            max-height: 400px;
          }

          .search-result-item {
            padding: 16px 20px;
            border-bottom: 1px solid #e5e5e5;
            cursor: pointer;
            transition: background-color 0.2s;
          }

          :global(.dark) .search-result-item {
            border-bottom-color: #3f3f46;
          }

          .search-result-item:hover {
            background: #f3f4f6;
          }

          :global(.dark) .search-result-item:hover {
            background: #27272a;
          }

          .symbol-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .symbol-name {
            font-weight: 600;
            color: #333;
            font-size: 0.95rem;
          }

          :global(.dark) .symbol-name {
            color: #ffffff;
          }

          .symbol-details {
            font-size: 0.85rem;
            color: #666;
          }

          :global(.dark) .symbol-details {
            color: #a1a1aa;
          }

          .no-results,
          .hint {
            padding: 40px;
            text-align: center;
            color: #666;
            font-size: 0.9rem;
          }

          :global(.dark) .no-results,
          :global(.dark) .hint {
            color: #a1a1aa;
          }

          @media (max-width: 768px) {
            .modal-content {
              width: 95%;
              max-height: 90vh;
            }
          }
        `}</style>
      </div>
    </div>
  );
});

export default SymbolSearchModal;
