"use client";

import { useState } from "react";
import { Session } from "next-auth";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface DashboardShellProps {
  children: React.ReactNode;
  session: Session;
}

export function DashboardShell({ children, session }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const user = session.user as any;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        role={user?.role || "USER"}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          user={{
            name: user?.name || "",
            email: user?.email || "",
            role: user?.role || "USER",
          }}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
