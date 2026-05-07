"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  BookOpen,
  BarChart3,
  Settings,
  LayoutDashboard,
  Bell,
  Menu,
  LogOut,
  ChevronRight,
  GraduationCap,
  DollarSign,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface PageTitleContextType {
  title: string;
  setTitle: (title: string) => void;
}

const PageTitleContext = React.createContext<PageTitleContextType>({
  title: "Dashboard",
  setTitle: () => {},
});

export function usePageTitle() {
  return React.useContext(PageTitleContext);
}

const adminNav = [
  {
    section: "Main",
    items: [
      { name: "Dashboard", href: "/(admin)/dashboard", icon: LayoutDashboard },
      { name: "Analytics", href: "/(admin)/analytics", icon: BarChart3 },
      { name: "Users", href: "/(admin)/users", icon: Users },
      { name: "Courses", href: "/(admin)/courses", icon: BookOpen },
    ],
  },
  {
    section: "Finance",
    items: [
      { name: "Earnings", href: "/(admin)/earnings", icon: DollarSign },
      { name: "Transactions", href: "/(admin)/transactions", icon: FileText },
    ],
  },
  {
    section: "Settings",
    items: [
      { name: "Settings", href: "/(admin)/settings", icon: Settings },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl animate-slide-in-right">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Quran Academy</p>
                  <p className="text-xs text-slate-500">Admin Portal</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <Menu className="h-5 w-5" />
              </button>
            </div>

            <nav className="p-4 space-y-6 overflow-y-auto h-[calc(100%-140px)]">
              {adminNav.map((section) => (
                <div key={section.section}>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
                    {section.section}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link key={item.name} href={item.href} onClick={() => setSidebarOpen(false)}>
                          <div className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                            isActive
                              ? "bg-gradient-to-r from-primary to-primary/90 text-white shadow-md"
                              : "text-slate-600 hover:bg-slate-100"
                          )}>
                            <item.icon className="h-4 w-4" />
                            {item.name}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-slate-100">
        <div className="flex items-center gap-3 p-6 border-b">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900">Quran Academy</p>
            <p className="text-xs text-slate-500">Admin Portal</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {adminNav.map((section) => (
            <div key={section.section}>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
                {section.section}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.name} href={item.href}>
                      <div className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                        isActive
                          ? "bg-gradient-to-r from-primary to-primary/90 text-white shadow-md"
                          : "text-slate-600 hover:bg-slate-50"
                      )}>
                        <item.icon className="h-4 w-4" />
                        {item.name}
                        {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-3">
            <Avatar name="Admin User" size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">Admin User</p>
              <p className="text-xs text-slate-500 truncate">admin@quranacademy.com</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start gap-2 text-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100">
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden lg:block">
              <h2 className="text-sm font-medium text-slate-500">Dashboard</h2>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <Bell className="h-5 w-5 text-slate-500" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <Avatar name="Admin User" size="sm" className="hidden lg:block" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
