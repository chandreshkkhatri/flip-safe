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
              <i className="material-icons">menu</i>
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
            <div className="background">
              <img src="/api/placeholder/300/200" alt="" />
            </div>
            <span className="name white-text">{title}</span>
          </div>
        </li>
        
        {navItems.map((item) => (
          <li key={item.href} className={isActiveRoute(item.href) ? 'active' : ''}>
            <Link 
              href={item.href} 
              className="sidenav-close"
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
              className="btn-flat left-align"
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
              className="btn-flat left-align"
            >
              ⚙️ API Config
            </button>
          </li>
        )}
        
        {isLoggedIn && (
          <li>
            <button onClick={handleLogout} className="btn-flat left-align">
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
          float: right;
          margin-top: 8px;
        }
        
        .sidenav {
          position: fixed;
          top: 0;
          left: -300px;
          width: 300px;
          height: 100vh;
          background-color: #fff;
          z-index: 999;
          transition: left 0.3s ease;
          box-shadow: 2px 0 10px rgba(0,0,0,0.16);
        }
        
        .sidenav-open {
          left: 0;
        }
        
        .sidenav-dark {
          background-color: #424242;
          color: white;
        }
        
        .sidenav-dark .name {
          color: white !important;
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
            display: block;
          }
        }
      `}</style>
    </>
  );
}