"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  DollarSign,
  LayoutDashboard,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const teacherNav = [
  { href: "/teacher/schedule", label: "Schedule", icon: Calendar },
  { href: "/teacher/availability", label: "Availability", icon: Clock },
  { href: "/teacher/earnings", label: "Earnings", icon: DollarSign },
  { href: "/teacher/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl animate-slide-in-right">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-bold">QA</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900">Teacher Portal</p>
                  <p className="text-xs text-slate-500">Quran Academy</p>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="p-4 space-y-1">
              {teacherNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <div className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                      isActive
                        ? "bg-gradient-to-r from-primary to-primary/90 text-white shadow-md"
                        : "text-slate-600 hover:bg-slate-100"
                    )}>
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
              <div className="flex items-center gap-3 mb-4">
                <Avatar name="Sheikh Ibrahim" size="md" />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Sheikh Ibrahim</p>
                  <p className="text-xs text-slate-500">teacher@example.com</p>
                </div>
              </div>
              <div className="space-y-1">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 text-red-600 hover:bg-red-50">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-slate-100">
        <div className="p-6 border-b">
          <Link href="/teacher/schedule" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold">QA</span>
            </div>
            <div>
              <p className="font-bold text-slate-900">Teacher Portal</p>
              <p className="text-xs text-slate-500">Quran Academy</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {teacherNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-primary to-primary/90 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-50"
                )}>
                  <item.icon className="h-5 w-5" />
                  {item.label}
                  {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-xl">
            <Avatar name="Sheikh Ibrahim" size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">Sheikh Ibrahim</p>
              <p className="text-xs text-slate-500 truncate">teacher@example.com</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start gap-2 mb-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 text-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t">
        <nav className="flex justify-around p-2">
          {teacherNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl min-w-[64px]",
                  isActive && "text-primary"
                )}>
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:pb-0 pb-20">{children}</main>
    </div>
  );
}
