'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Terminal, FileText, Wallet, Check, Copy, ExternalLink, Activity, X, Settings, RefreshCw, Sun, Moon, ShoppingBag } from 'lucide-react';
import { useOrchestrator } from '@/app/demo/_providers/OrchestratorProvider';
import { SettlementHistoryItem } from '@/types/orchestrator';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";

function SidebarBrand() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarHeader className={`py-4 flex flex-row items-center h-14 shrink-0 transition-all ${isCollapsed ? 'justify-center px-0' : 'justify-between px-5'}`}>
      {!isCollapsed && (
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl py-1 hover:opacity-80 transition-all cursor-pointer pointer-events-auto min-w-0"
        >
          <span className="font-extrabold text-sm text-foreground tracking-tight truncate">
            x402stream
          </span>
        </Link>
      )}
      <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors pointer-events-auto cursor-pointer hidden lg:inline-flex" />
    </SidebarHeader>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { realAddress, mockBalance, realBalance, running, alertStack, dismissAlert, refreshRealBalance } = useOrchestrator();
  const [copied, setCopied] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [theme, setTheme] = React.useState<'light' | 'dark'>('dark');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('x402stream_theme') as 'light' | 'dark' | null;
      const initialTheme = savedTheme || 'dark';
      setTheme(initialTheme);
      if (initialTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('x402stream_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const isLandingPage = pathname === '/';

  const navItems = [
    { label: 'Dashboard', href: '/demo', icon: Terminal },
    { label: 'Transaction Ledger', href: '/demo/ledgers', icon: FileText },
    { label: 'Mock Vendors', href: '/demo/vendors', icon: ShoppingBag },
    { label: 'Settings', href: '/demo/settings', icon: Settings },
  ];

  const handleCopy = () => {
    if (!realAddress) return;
    navigator.clipboard.writeText(realAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLandingPage) {
    return (
      <div className="flex min-h-screen bg-background font-sans text-foreground items-center justify-center relative">
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={toggleTheme}
            className="h-8 w-8 rounded-xl border border-border bg-card hover:bg-accent text-foreground flex items-center justify-center cursor-pointer pointer-events-auto transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-zinc-400" /> : <Moon className="h-3.5 w-3.5 text-zinc-500" />}
          </button>
        </div>
        <main className="flex-1 w-full py-8 px-4 lg:px-8 flex items-center justify-center">
          <div className="max-w-6xl w-full mx-auto flex items-center justify-center">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <div className="flex min-h-screen bg-background font-sans text-foreground w-full">
          <Sidebar collapsible="icon" className="hidden lg:flex border-r border-border bg-card/85 backdrop-blur-xl text-foreground">
            <SidebarBrand />

            {/* Navigation Menu */}
            <SidebarContent className="flex-1 px-4 py-6 group-data-[collapsible=icon]:px-2">
              <SidebarMenu className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className={`relative w-full rounded-xl px-4 py-2.5 transition-all text-xs font-semibold tracking-wide ${isActive
                          ? 'text-foreground font-bold bg-accent border border-border'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/40 border border-transparent'
                          }`}
                      >
                        <Link href={item.href} className="flex items-center gap-3 w-full whitespace-nowrap">
                          <Icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground group-hover/menu-button:text-foreground'}`} />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarContent>


          </Sidebar>

          {/* Main Content Area Wrapper using Shadcn Inset */}
          <SidebarInset className="flex flex-col flex-1 bg-background text-foreground min-h-screen">
            {/* Floating Top Right Controls */}
            <div className="absolute top-4 right-4 z-30 flex items-center gap-3">
              {/* Mock Cash Balance */}
              <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-2.5 py-1 text-[10px] font-semibold text-muted-foreground shadow-sm">
                <span className="text-muted-foreground/80 uppercase tracking-wider text-[8px] font-bold">Mock:</span>
                <span className="text-foreground">{mockBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ETH</span>
              </div>

              {/* Morph Testnet ETH */}
              <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-2.5 py-1 text-[10px] font-semibold text-muted-foreground shadow-sm">
                <span className="text-muted-foreground/80 uppercase tracking-wider text-[8px] font-bold">Morph:</span>
                <span className="text-foreground font-mono">{parseFloat(realBalance).toFixed(4)} ETH</span>
                {realAddress && (
                  <button
                    onClick={async () => {
                      setRefreshing(true);
                      try {
                        await refreshRealBalance();
                      } finally {
                        setRefreshing(false);
                      }
                    }}
                    disabled={refreshing}
                    className="text-muted-foreground hover:text-foreground transition-colors pointer-events-auto cursor-pointer"
                  >
                    <RefreshCw className={`h-2.5 w-2.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
                  </button>
                )}
              </div>

              {realAddress && (
                <Badge variant="outline" className="border-border text-muted-foreground text-[10px] font-mono px-2 py-0.5 rounded-xl bg-card shadow-sm hidden sm:inline-flex">
                  {realAddress.slice(0, 4)}...{realAddress.slice(-3)}
                </Badge>
              )}

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="h-8 w-8 rounded-xl border border-border bg-card hover:bg-accent text-foreground flex items-center justify-center cursor-pointer pointer-events-auto transition-colors shadow-sm"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              >
                {theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-zinc-400" /> : <Moon className="h-3.5 w-3.5 text-zinc-650" />}
              </button>
            </div>

            {/* Mobile Floating Logo */}
            <div className="absolute top-4 left-4 z-30 lg:hidden">
              <Link href="/" className="font-extrabold text-sm text-foreground tracking-tight cursor-pointer bg-card/85 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-border shadow-sm">
                x402stream
              </Link>
            </div>

            {/* Page Contents */}
            <main className="flex-1 py-6 px-4 lg:px-8 pb-28 lg:pb-8 pt-16">
              <div className="max-w-6xl mx-auto space-y-6">
                {children}
              </div>
            </main>

          </SidebarInset>

        </div>

        {/* Floating Success Settlement Alert Queue */}
        <div className="fixed bottom-20 lg:bottom-6 right-6 z-50 w-full max-w-md p-4 pointer-events-none flex flex-col gap-3 justify-end items-end">
          <AnimatePresence>
            {alertStack.map((item) => (
              <StackedAlertItem
                key={item.id}
                item={item}
                onDismiss={() => dismissAlert(item.id)}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom Navbar for Mobile & Tablet */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/85 backdrop-blur-xl border-t border-border px-6 py-2 pb-safe-bottom flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative ${isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomNavActiveMarker"
                    className="absolute inset-0 bg-accent/60 border border-border rounded-xl -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-foreground' : 'text-muted-foreground'}`} />
                <span className="text-[9px] font-black uppercase tracking-wider">{item.label}</span>
              </Link>
            );
          })}
        </div>

      </SidebarProvider>
    </TooltipProvider>
  );
}

function StackedAlertItem({
  item,
  onDismiss,
}: {
  item: SettlementHistoryItem;
  onDismiss: () => void;
}) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 8000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="w-full pointer-events-auto"
    >
      <Alert className="border-border bg-card/95 backdrop-blur-xl shadow-2xl p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between w-full gap-4">
          <div className="flex gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <Check className="h-4 w-4" />
            </div>
            <div>
              <AlertTitle className="text-xs font-black text-foreground uppercase tracking-wider">Goal Settled Successfully!</AlertTitle>
              <AlertDescription className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                {item.goal}
              </AlertDescription>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-accent/40 shrink-0 pointer-events-auto cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button
            onClick={onDismiss}
            className="text-[10px] text-muted-foreground hover:text-foreground font-bold px-3 py-1.5 rounded-lg border border-border hover:bg-accent/40 transition-colors pointer-events-auto cursor-pointer"
          >
            Dismiss
          </button>
          <Link
            href="/demo/ledgers"
            onClick={onDismiss}
            className="text-[10px] bg-foreground text-background font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer pointer-events-auto hover:bg-foreground/90"
          >
            View Details <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </Alert>
    </motion.div>
  );
}
