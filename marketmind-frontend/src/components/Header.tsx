"use client";

import { Search, Bell, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onRefresh?: () => void;
  lastUpdated?: string;
}

export function Header({ onRefresh, lastUpdated }: HeaderProps) {
  return (
    <header className="fixed left-56 right-0 top-0 z-10 flex h-14 items-center justify-between border-b border-white/[.06] bg-gray-900/80 px-6 backdrop-blur-xl">
      {/* Search */}
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          placeholder="Search stocks, news..."
          className="h-9 rounded-lg border-white/[.06] bg-white/[.03] pl-10 text-sm text-white placeholder:text-gray-500 focus-visible:border-blue-500/50 focus-visible:ring-1 focus-visible:ring-blue-500/20"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {lastUpdated && (
          <span className="text-[11px] text-gray-500">
            Updated{" "}
            <span className="font-medium text-gray-400">{lastUpdated}</span>
          </span>
        )}
        <Button
          onClick={onRefresh}
          size="sm"
          className="h-8 gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-500"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Data
        </Button>
        <button className="relative rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/[.04] hover:text-white">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>
        <div className="flex items-center gap-2.5 border-l border-white/[.06] pl-3">
          <span className="text-xs text-gray-400">User</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold text-white">
            U
          </div>
        </div>
      </div>
    </header>
  );
}
