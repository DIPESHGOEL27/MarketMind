"use client";

import {
  LayoutDashboard,
  Briefcase,
  Newspaper,
  TrendingUp,
  MessageSquare,
  Settings,
  Brain,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "portfolio", label: "Portfolio", icon: Briefcase },
  { id: "news", label: "News Feed", icon: Newspaper },
  { id: "analysis", label: "Analysis", icon: TrendingUp },
  { id: "chat", label: "AI Chat", icon: MessageSquare },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 flex h-screen w-56 flex-col border-r border-white/[.06] bg-gray-900">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-white/[.06] p-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
          <Brain className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-white">
            MarketMind
          </h1>
          <p className="text-[10px] font-medium uppercase tracking-widest text-gray-500">
            Intelligent Insights
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-600/15 text-blue-400"
                  : "text-gray-400 hover:bg-white/[.04] hover:text-gray-200"
              }`}
            >
              <Icon
                className={`h-[18px] w-[18px] ${isActive ? "text-blue-400" : ""}`}
              />
              {item.label}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="border-t border-white/[.06] p-3">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-all hover:bg-white/[.04] hover:text-gray-200">
          <Settings className="h-[18px] w-[18px]" />
          Settings
        </button>
      </div>
    </aside>
  );
}
