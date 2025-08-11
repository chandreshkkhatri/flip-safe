'use client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/trading', label: 'Trading' },
  { href: '/orders', label: 'Orders' },
  { href: '/positions', label: 'Positions' },
  { href: '/holdings', label: 'Holdings' },
  { href: '/accounts', label: 'Accounts' },
];

export function Header() {
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();
  const { isLoggedIn, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-2 px-3 md:px-6">
        <div className="flex items-center gap-3">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border/60 md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation menu"
          >
            <span className="h-4 w-4">
              <span className="block h-0.5 w-4 translate-y-[-4px] rounded bg-foreground transition" />
              <span className="block h-0.5 w-4 rounded bg-foreground transition" />
              <span className="block h-0.5 w-4 translate-y-[4px] rounded bg-foreground transition" />
            </span>
          </button>
          <Link
            href="/dashboard"
            className="font-semibold text-sm tracking-wide flex items-center gap-1"
          >
            <span className="text-primary">⚡</span> Flip Safe
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-md transition-colors hover:bg-muted/60 hover:text-foreground ${
                pathname === item.href
                  ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
                  : 'text-muted-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="text-lg"
          >
            {isDark ? '☀️' : '🌙'}
          </Button>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="outline" size="sm" className="font-medium">
                Menu
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="min-w-[180px] rounded-md border border-border bg-popover p-1 shadow-md focus:outline-none">
              {navItems.map(item => (
                <DropdownMenu.Item key={item.href} asChild>
                  <Link
                    href={item.href}
                    className={`flex cursor-pointer select-none items-center rounded px-2 py-1.5 text-xs outline-none transition-colors hover:bg-accent hover:text-accent-foreground ${
                      pathname === item.href ? 'text-primary font-semibold' : ''
                    }`}
                  >
                    {item.label}
                  </Link>
                </DropdownMenu.Item>
              ))}
              <DropdownMenu.Separator className="my-1 h-px bg-border" />
              <DropdownMenu.Item asChild>
                <button
                  onClick={toggleTheme}
                  className="w-full cursor-pointer select-none rounded px-2 py-1.5 text-left text-xs hover:bg-accent hover:text-accent-foreground"
                >
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>
              </DropdownMenu.Item>
              {isLoggedIn && (
                <DropdownMenu.Item asChild>
                  <button
                    onClick={() => logout()}
                    className="w-full cursor-pointer select-none rounded px-2 py-1.5 text-left text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    Logout
                  </button>
                </DropdownMenu.Item>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed left-0 top-14 h-[calc(100vh-56px)] w-64 transform border-r border-border bg-background px-3 py-4 transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-0.5 text-sm">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`rounded-md px-3 py-2 transition-colors hover:bg-muted/60 hover:text-foreground ${
                pathname === item.href
                  ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
                  : 'text-muted-foreground'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="secondary" onClick={toggleTheme} className="flex-1">
              {isDark ? 'Light' : 'Dark'} Mode
            </Button>
            {isLoggedIn && (
              <Button size="sm" variant="destructive" onClick={() => logout()} className="flex-1">
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
