'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

interface NavBarProps {
  title?: string;
  showNightModeToggle?: boolean;
  showApiConfig?: boolean;
  onToggleNightMode?: () => void;
  onShowApiPanel?: () => void;
  nightMode?: boolean;
}

export default function NavBar({
  title = 'Flip Safe',
  showNightModeToggle = false,
  showApiConfig = false,
  onToggleNightMode,
  onShowApiPanel,
  nightMode = false,
}: NavBarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isLoggedIn, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/trading', label: 'Trading' },
    { href: '/orders', label: 'Orders' },
    { href: '/positions', label: 'Positions' },
    { href: '/holdings', label: 'Holdings' },
    { href: '/accounts', label: 'Accounts' },
  ];

  const isActiveRoute = (href: string) => pathname === href;

  return (
    <>
      <nav className={`navbar-fixed ${nightMode ? 'navbar-dark' : ''}`}>
        <nav className={`${nightMode ? 'grey darken-4' : 'blue'} z-depth-1`}>
          <div className="nav-wrapper container">
            <Link href="/dashboard" className="brand-logo">
              {title}
            </Link>

            {/* Mobile menu trigger */}
            <button
              className="sidenav-trigger"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              <span className="hamburger-icon">☰</span>
            </button>

            {/* Desktop navigation */}
            <ul className="right hide-on-med-and-down">
              {navItems.map((item) => (
                <li key={item.href} className={isActiveRoute(item.href) ? 'active' : ''}>
                  <Link href={item.href} className="nav-link">
                    {item.label}
                  </Link>
                </li>
              ))}
              
              {showNightModeToggle && (
                <li>
                  <button
                    onClick={onToggleNightMode}
                    className="btn-flat white-text"
                    title={nightMode ? 'Light Mode' : 'Dark Mode'}
                    aria-label={nightMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {nightMode ? '☀️' : '🌙'}
                  </button>
                </li>
              )}
              
              {showApiConfig && (
                <li>
                  <button
                    onClick={onShowApiPanel}
                    className="btn-flat white-text"
                    title="Configure API"
                    aria-label="Configure API credentials"
                  >
                    ⚙️ API Config
                  </button>
                </li>
              )}
              
              {isLoggedIn && (
                <li>
                  <button
                    onClick={handleLogout}
                    className="btn-flat white-text"
                    aria-label="Logout"
                  >
                    Logout
                  </button>
                </li>
              )}
            </ul>
          </div>
        </nav>
      </nav>

      {/* Mobile side navigation */}
      <ul className={`sidenav ${isMenuOpen ? 'sidenav-open' : ''} ${nightMode ? 'sidenav-dark' : ''}`}>
        <li>
          <div className="user-view">
            <span className="name">{title}</span>
          </div>
        </li>
        
        {navItems.map((item) => (
          <li key={item.href} className={isActiveRoute(item.href) ? 'active' : ''}>
            <Link 
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          </li>
        ))}
        
        <li><div className="divider"></div></li>
        
        {showNightModeToggle && (
          <li>
            <button
              onClick={() => {
                onToggleNightMode?.();
                setIsMenuOpen(false);
              }}
            >
              {nightMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </li>
        )}
        
        {showApiConfig && (
          <li>
            <button
              onClick={() => {
                onShowApiPanel?.();
                setIsMenuOpen(false);
              }}
            >
              ⚙️ API Config
            </button>
          </li>
        )}
        
        {isLoggedIn && (
          <li>
            <button onClick={handleLogout}>
              Logout
            </button>
          </li>
        )}
      </ul>

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div
          className="sidenav-overlay"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <style jsx>{`
        .navbar-dark .nav-wrapper {
          background-color: #424242;
        }
        
        .sidenav-trigger {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          display: none;
          position: absolute;
          top: 12px;
          right: 16px;
          padding: 10px;
          border-radius: 4px;
          font-size: 1.2rem;
          line-height: 1;
          z-index: 1000;
          min-width: 44px;
          min-height: 44px;
        }

        .sidenav-trigger:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .sidenav-trigger:active {
          background-color: rgba(255, 255, 255, 0.3);
        }

        .hamburger-icon {
          font-size: 1.5rem;
          display: block;
          pointer-events: none;
        }
        
        .sidenav {
          position: fixed;
          top: 0;
          left: 0;
          width: 300px;
          max-width: 85vw;
          height: 100vh;
          background-color: #fff;
          z-index: 999;
          transition: transform 0.3s ease-in-out;
          box-shadow: 2px 0 20px rgba(0,0,0,0.3);
          overflow-y: auto;
          padding: 0;
          margin: 0;
          list-style: none;
          transform: translateX(-100%);
        }
        
        .sidenav-open {
          transform: translateX(0) !important;
        }

        .sidenav li {
          margin: 0;
          padding: 0;
        }

        .sidenav li a {
          display: block;
          padding: 16px 32px;
          color: #333;
          text-decoration: none;
          border-bottom: 1px solid #f0f0f0;
          transition: background-color 0.2s ease;
        }

        .sidenav li a:hover {
          background-color: #f5f5f5;
        }

        .sidenav li.active a {
          background-color: #e3f2fd;
          color: #1976d2;
          font-weight: 500;
        }

        .sidenav li button {
          display: block;
          width: 100%;
          padding: 16px 32px;
          background: none;
          border: none;
          color: #333;
          text-align: left;
          cursor: pointer;
          border-bottom: 1px solid #f0f0f0;
          transition: background-color 0.2s ease;
        }

        .sidenav li button:hover {
          background-color: #f5f5f5;
        }
        
        .sidenav-dark {
          background-color: #424242;
          color: white;
        }

        .sidenav-dark li a {
          color: white;
          border-bottom-color: #555;
        }

        .sidenav-dark li a:hover {
          background-color: #555;
        }

        .sidenav-dark li.active a {
          background-color: #1976d2;
          color: white;
        }

        .sidenav-dark li button {
          color: white;
          border-bottom-color: #555;
        }

        .sidenav-dark li button:hover {
          background-color: #555;
        }
        
        .sidenav-dark .name {
          color: white !important;
        }

        .user-view {
          padding: 32px 32px 16px;
          background: linear-gradient(135deg, #1976d2, #1565c0);
          margin-bottom: 0;
        }

        .user-view .name {
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0;
        }

        .divider {
          height: 1px;
          background-color: #f0f0f0;
          margin: 8px 0;
        }

        .sidenav-dark .divider {
          background-color: #555;
        }
        
        .sidenav-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 998;
        }
        
        .nav-link {
          padding: 0 15px;
          line-height: 64px;
          display: block;
          color: white;
          text-decoration: none;
        }
        
        .nav-link:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        .active .nav-link {
          background-color: rgba(255, 255, 255, 0.2);
        }
        
        @media only screen and (max-width: 992px) {
          .sidenav-trigger {
            display: block !important;
          }
          
          .hide-on-med-and-down {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}