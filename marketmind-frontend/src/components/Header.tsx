'use client';

import { Search, Bell, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onRefresh?: () => void;
  lastUpdated?: string;
}

export function Header({ onRefresh, lastUpdated }: HeaderProps) {
  return (
    <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 fixed top-0 left-56 right-0 z-10">
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          placeholder="Search stocks, news, companies..."
          className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 rounded-xl"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {lastUpdated && (
          <span className="text-xs text-gray-500">
            Last updated <span className="text-blue-400">{lastUpdated}</span>
          </span>
        )}
        <Button
          onClick={onRefresh}
          variant="outline"
          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white border-0 gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </Button>
        <button className="relative p-2 rounded-lg hover:bg-gray-800 text-gray-400">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">User</span>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            U
          </div>
        </div>
      </div>
    </header>
  );
}
