"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleSidebar: () => void;
  closeMobile: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  isMobileOpen: false,
  toggleSidebar: () => {},
  closeMobile: () => {},
  setCollapsed: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsCollapsed(window.localStorage.getItem("sidebar_collapsed") === "true");
  }, []);

  const closeMobile = useCallback(() => setIsMobileOpen(false), []);

  const toggleSidebar = useCallback(() => {
    if (window.matchMedia("(max-width: 760px)").matches) {
      setIsMobileOpen((current) => !current);
      return;
    }

    setIsCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem("sidebar_collapsed", String(next));
      return next;
    });
  }, []);

  const setCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed);
    window.localStorage.setItem("sidebar_collapsed", String(collapsed));
  }, []);

  return (
    <SidebarContext.Provider value={{ isCollapsed, isMobileOpen, toggleSidebar, closeMobile, setCollapsed }}>
      <div className={`app-shell${isCollapsed ? " sidebar-collapsed" : ""}${isMobileOpen ? " mobile-sidebar-open" : ""}`}>
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
