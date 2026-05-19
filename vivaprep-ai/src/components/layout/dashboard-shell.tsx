"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="page-bg" />
      <div className="app-shell">
        <Sidebar />
        <div className="main-area">
          <Header />
          <div className="screen-body">{children}</div>
        </div>
      </div>
    </>
  );
}
