'use client';

import { ReactNode } from 'react';

interface Column {
  key: string;
  header: string;
  render?: (value: any, row: any, index: number) => ReactNode;
  className?: string;
}

interface TableProps {
  columns: Column[];
  data: any[];
  emptyMessage?: string;
  className?: string;
  nightMode?: boolean;
}

export default function Table({
  columns,
  data,
  emptyMessage = 'No data available',
  className = '',
  nightMode = false,
}: TableProps) {
  if (data.length === 0) {
    return (
      <div className={`empty-state ${nightMode ? 'dark' : ''}`}>
        <p>{emptyMessage}</p>
        <style jsx>{`
          .empty-state {
            text-align: center;
            padding: 48px 24px;
            color: #666;
            background: #f8f9fa;
            border-radius: 8px;
            border: 2px dashed #ddd;
          }
          
          .empty-state.dark {
            background: #2d3748;
            color: #a0aec0;
            border-color: #4a5568;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`table-container ${nightMode ? 'dark' : ''} ${className}`}>
      <div className="table-wrapper">
        <table className="responsive-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={column.className}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="table-row">
                {columns.map((column) => (
                  <td key={column.key} className={column.className}>
                    {column.render
                      ? column.render(row[column.key], row, index)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .table-container {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .table-container.dark {
          background: #1e1e1e;
          color: white;
        }
        
        .table-wrapper {
          overflow-x: auto;
        }
        
        .responsive-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        
        .responsive-table th {
          background-color: #f8f9fa;
          padding: 16px 12px;
          text-align: left;
          font-weight: 600;
          color: #495057;
          border-bottom: 1px solid #e9ecef;
        }
        
        .dark .responsive-table th {
          background-color: #2d3748;
          color: #e2e8f0;
          border-bottom-color: #4a5568;
        }
        
        .responsive-table td {
          padding: 16px 12px;
          border-bottom: 1px solid #f1f3f4;
          vertical-align: middle;
        }
        
        .dark .responsive-table td {
          border-bottom-color: #2d3748;
        }
        
        .table-row {
          transition: background-color 0.2s ease;
        }
        
        .table-row:hover {
          background-color: #f8f9fa;
        }
        
        .dark .table-row:hover {
          background-color: #2d3748;
        }
        
        .table-row:last-child td {
          border-bottom: none;
        }
        
        @media only screen and (max-width: 768px) {
          .responsive-table {
            font-size: 12px;
          }
          
          .responsive-table th,
          .responsive-table td {
            padding: 12px 8px;
          }
        }
        
        @media only screen and (max-width: 480px) {
          .table-wrapper {
            margin: 0 -16px;
          }
          
          .responsive-table th,
          .responsive-table td {
            padding: 8px 6px;
            min-width: 100px;
          }
        }
      `}</style>
    </div>
  );
}