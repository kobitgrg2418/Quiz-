"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <>
      <div className="page-bg" />
      <div className="app-shell">
        {/* Mobile backdrop */}
        <div
          className={`sidebar-backdrop ${sidebarOpen ? "visible" : ""}`}
          onClick={closeSidebar}
        />
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        <div className="main-area">
          <Header onMenuClick={openSidebar} />
          <div className="screen-body">{children}</div>
        </div>
      </div>
    </>
  );
}
