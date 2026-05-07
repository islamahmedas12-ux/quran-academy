"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  DollarSign,
  LayoutDashboard,
  Settings,
  LogOut,
} from "lucide-react";

const teacherNav = [
  { href: "/teacher/schedule", label: "Schedule", icon: Calendar },
  { href: "/teacher/availability", label: "Availability", icon: Clock },
  { href: "/teacher/earnings", label: "Earnings", icon: DollarSign },
];

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-background">
        <div className="p-6 border-b">
          <Link href="/teacher/schedule" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">QA</span>
            </div>
            <div>
              <p className="font-semibold">Teacher Portal</p>
              <p className="text-xs text-muted-foreground">Quran Academy</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {teacherNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2",
                    isActive && "bg-primary/10 text-primary"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-4">
            <Avatar name="Sheikh Ibrahim" size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">Sheikh Ibrahim</p>
              <p className="text-xs text-muted-foreground truncate">
                teacher@example.com
              </p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 mt-2">
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
        </div>
      </aside>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
        <nav className="flex justify-around p-2">
          {teacherNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex flex-col items-center gap-1 h-14",
                    isActive && "text-primary"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
    </div>
  );
}
