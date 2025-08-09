'use client';

import { ReactNode } from 'react';
import NavBar from './NavBar';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  showNightModeToggle?: boolean;
  showApiConfig?: boolean;
  onToggleNightMode?: () => void;
  onShowApiPanel?: () => void;
  nightMode?: boolean;
  className?: string;
}

export default function PageLayout({
  children,
  title,
  showNightModeToggle = false,
  showApiConfig = false,
  onToggleNightMode,
  onShowApiPanel,
  nightMode = false,
  className = '',
}: PageLayoutProps) {
  return (
    <div className={`page-layout ${nightMode ? 'dark-theme' : ''} ${className}`}>
      <NavBar
        title={title}
        showNightModeToggle={showNightModeToggle}
        showApiConfig={showApiConfig}
        onToggleNightMode={onToggleNightMode}
        onShowApiPanel={onShowApiPanel}
        nightMode={nightMode}
      />
      
      <main className="main-content">
        <div className="container">
          {children}
        </div>
      </main>

      <style jsx>{`
        .page-layout {
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
        
        .page-layout.dark-theme {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%);
          color: #ffffff;
        }
        
        .main-content {
          margin-top: 80px;
          padding-bottom: 40px;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }
        
        @media only screen and (max-width: 600px) {
          .main-content {
            margin-top: 70px;
          }
          
          .container {
            padding: 0 15px;
          }
        }
      `}</style>
    </div>
  );
}