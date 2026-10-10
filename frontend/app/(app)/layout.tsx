import Sidebar from "@/components/sidebar";
import AppHeader from "@/components/app-header";
import { SidebarProvider } from "@/components/sidebar-context";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TalentIQ",
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar />
      <div className="main-content">
        <AppHeader />
        <main className="app-page-body">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
