'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TradingTabsProps {
  className?: string;
}

export default function TradingTabs({ className = '' }: TradingTabsProps) {
  return (
    <div className={`trading-tabs-container ${className}`}>
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Active Orders</h3>
            <div className="flex items-center gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="executed">Executed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                Refresh
              </Button>
            </div>
          </div>

          <div className="border rounded-lg">
            <div className="grid grid-cols-6 gap-4 p-4 font-semibold border-b bg-muted/50">
              <div>Symbol</div>
              <div>Type</div>
              <div>Qty</div>
              <div>Price</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
            <div className="p-8 text-center text-muted-foreground">No active orders</div>
          </div>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Open Positions</h3>
            <div className="flex items-center gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  <SelectItem value="kite">Zerodha Kite</SelectItem>
                  <SelectItem value="upstox">Upstox</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                Square Off All
              </Button>
            </div>
          </div>

          <div className="border rounded-lg">
            <div className="grid grid-cols-7 gap-4 p-4 font-semibold border-b bg-muted/50">
              <div>Symbol</div>
              <div>Qty</div>
              <div>Avg Price</div>
              <div>LTP</div>
              <div>P&L</div>
              <div>Day Change</div>
              <div>Actions</div>
            </div>
            <div className="p-8 text-center text-muted-foreground">No open positions</div>
          </div>
        </TabsContent>

        <TabsContent value="holdings" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Portfolio Holdings</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Portfolio Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Portfolio</DropdownMenuLabel>
                <DropdownMenuItem>Export Holdings</DropdownMenuItem>
                <DropdownMenuItem>Download Report</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Sync Holdings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="border rounded-lg">
            <div className="grid grid-cols-8 gap-4 p-4 font-semibold border-b bg-muted/50">
              <div>Symbol</div>
              <div>Qty</div>
              <div>Avg Price</div>
              <div>LTP</div>
              <div>Current Value</div>
              <div>P&L</div>
              <div>Day Change</div>
              <div>Actions</div>
            </div>
            <div className="p-8 text-center text-muted-foreground">No holdings found</div>
          </div>
        </TabsContent>

        <TabsContent value="watchlist" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Market Watchlist</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Add Symbol
              </Button>
              <Button variant="trading" size="sm">
                Create Alert
              </Button>
            </div>
          </div>

          <div className="border rounded-lg">
            <div className="grid grid-cols-6 gap-4 p-4 font-semibold border-b bg-muted/50">
              <div>Symbol</div>
              <div>LTP</div>
              <div>Change</div>
              <div>% Change</div>
              <div>Volume</div>
              <div>Actions</div>
            </div>
            <div className="space-y-2 p-4">
              <div className="grid grid-cols-6 gap-4 p-2 hover:bg-muted/50 rounded">
                <div className="font-medium">NIFTY 50</div>
                <div className="text-green-600">24,850.25</div>
                <div className="text-green-600">+125.30</div>
                <div className="text-green-600">+0.51%</div>
                <div className="text-sm text-muted-foreground">-</div>
                <div>
                  <Button variant="ghost" size="sm">
                    Trade
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-6 gap-4 p-2 hover:bg-muted/50 rounded">
                <div className="font-medium">RELIANCE</div>
                <div className="text-red-600">2,847.15</div>
                <div className="text-red-600">-23.85</div>
                <div className="text-red-600">-0.83%</div>
                <div className="text-sm text-muted-foreground">1,23,456</div>
                <div>
                  <Button variant="ghost" size="sm">
                    Trade
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
