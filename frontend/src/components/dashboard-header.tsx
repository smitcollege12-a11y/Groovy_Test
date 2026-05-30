"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileSidebar } from "@/components/sidebar";

interface DashboardHeaderProps {
  role: "student" | "instructor";
}

export function DashboardHeader({ role }: DashboardHeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b px-4 py-3 lg:px-6">
      <div className="flex items-center gap-3">
        <MobileSidebar role={role} />
        <span className="text-lg font-semibold font-[var(--font-heading)] lg:hidden">
          EduPath
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground sm:inline">{user?.email}</span>
        <ThemeToggle />
        <Button variant="outline" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
}