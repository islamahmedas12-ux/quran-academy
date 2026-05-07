"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  BarChart3,
  Settings,
  LayoutDashboard,
  ChevronRight,
  Bell,
  Menu,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

const adminNav = [
  { name: "Dashboard", href: "/(admin)/analytics", icon: LayoutDashboard },
  { name: "Users", href: "/(admin)/users", icon: Users },
  { name: "Courses", href: "/(admin)/courses", icon: BookOpen },
  { name: "Analytics", href: "/(admin)/analytics", icon: BarChart3 },
  { name: "Settings", href: "/(admin)/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
            <div className="flex items-center gap-3 p-4 border-b">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold">QA</span>
              </div>
              <div>
                <p className="font-semibold">Quran Academy</p>
                <p className="text-xs text-slate-500">Admin Portal</p>
              </div>
            </div>
            <nav className="p-4 space-y-1">
              {adminNav.map((item) => (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Button>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r">
        <div className="flex items-center gap-3 p-6 border-b">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold">QA</span>
          </div>
          <div>
            <p className="font-semibold">Quran Academy</p>
            <p className="text-xs text-slate-500">Admin Portal</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {adminNav.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3"
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-4">
            <Avatar name="Admin User" size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">Admin User</p>
              <p className="text-xs text-slate-500 truncate">admin@quranacademy.com</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start gap-2 text-red-600">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div />
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-lg hover:bg-slate-100">
                <Bell className="h-5 w-5 text-slate-500" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <Avatar name="Admin User" size="sm" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main>{children}</main>
      </div>
    </div>
  );
}