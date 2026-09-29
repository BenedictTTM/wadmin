'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookMarked,
  CheckSquare,
  History,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  User,
  LogOut,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element | null {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Derive role from authenticated user
  const role = user?.role ?? 'GUEST';
  const isStaff = ['ADMIN', 'TEACHER', 'CONTENT_DEVELOPER'].includes(role);
  const canViewAuditLog = ['ADMIN', 'TEACHER', 'CONTENT_DEVELOPER'].includes(role);

  // Auth Guard: redirect to login if unauthenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-xs text-slate-400 font-medium">Validating admin session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const allNavItems = [
    {
      name: 'Question Bank',
      href: '/questions',
      icon: BookMarked,
      active: pathname.startsWith('/questions'),
      visible: isStaff,
    },
    {
      name: 'Review Queue',
      href: '/review',
      icon: CheckSquare,
      active: pathname.startsWith('/review'),
      visible: isStaff,
    },
    {
      name: 'Audit Log',
      href: '/audit',
      icon: History,
      active: pathname.startsWith('/audit'),
      visible: canViewAuditLog,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      active: pathname.startsWith('/settings'),
      visible: true,
    },
  ];
  const navItems = allNavItems.filter((item) => item.visible);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/questions?search=${encodeURIComponent(searchInput.trim())}`);
    } else {
      router.push('/questions');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F1E8] font-sans antialiased text-[#141827]">
      {/* Left Sidebar */}
      <aside
        className={cn(
          'flex flex-col border-r-2 border-[#141827] bg-white transition-all duration-200 ease-in-out shrink-0',
          isSidebarOpen ? 'w-60' : 'w-16',
        )}
      >
        {/* Logo & Brand */}
        <div
          className={cn(
            'flex h-14 items-center border-b-2 border-[#141827] bg-[#F8F5EF] transition-all duration-200',
            isSidebarOpen ? 'justify-between px-4' : 'justify-center px-2',
          )}
        >
          <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F6D86B] text-[#141827] border-2 border-[#141827] shadow-hard-sm">
              <ShieldCheck className="h-5 w-5 stroke-[2.5]" />
            </div>
            {isSidebarOpen && (
              <div className="min-w-0">
                <h1 className="text-sm font-black text-[#141827] leading-tight tracking-tight truncate">
                  Question Bank
                </h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Admin Portal
                </p>
              </div>
            )}
          </div>
          {isSidebarOpen && (
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="rounded-md border border-[#141827] bg-white p-1 text-[#141827] hover:bg-[#F6D86B] shadow-hard-sm transition-colors"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* When collapsed, quick expand button bar */}
        {!isSidebarOpen && (
          <div className="flex justify-center py-2 border-b border-[#141827]/10 bg-[#F8F5EF]">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-md border border-[#141827] bg-white p-1 text-[#141827] hover:bg-[#F6D86B] shadow-hard-sm transition-colors"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                title={!isSidebarOpen ? item.name : undefined}
                className={cn(
                  'flex items-center rounded-lg text-xs font-bold transition-all',
                  isSidebarOpen ? 'gap-3 px-3 py-2' : 'justify-center p-2.5',
                  item.active
                    ? 'bg-[#F6D86B] text-[#141827] border-2 border-[#141827] shadow-hard-sm'
                    : 'text-[#141827] hover:bg-[#F0EBE0] hover:text-[#141827]',
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0',
                    item.active ? 'text-[#141827] stroke-[2.5]' : 'text-slate-500',
                  )}
                />
                {isSidebarOpen && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer User Info & Sign Out */}
        <div className="border-t-2 border-[#141827] p-2 bg-[#F8F5EF]">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F6D86B] text-[#141827] text-xs font-black border-2 border-[#141827] shadow-hard-sm">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : user?.email?.slice(0, 2).toUpperCase() || 'AD'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-[#141827]">
                  {user?.name || user?.email?.split('@')[0] || 'Admin'}
                </p>
                <p className="truncate text-[10px] text-slate-500 font-medium">
                  {user?.email || 'admin@wassce.org'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-md border border-[#141827] bg-white p-1 text-[#141827] hover:bg-rose-50 hover:text-rose-600 transition-colors shadow-hard-sm"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                title={`${user?.name || 'Admin'} (${user?.email || ''})`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F6D86B] text-[#141827] text-xs font-black border-2 border-[#141827] shadow-hard-sm cursor-default"
              >
                {user?.name ? user.name.slice(0, 2).toUpperCase() : user?.email?.slice(0, 2).toUpperCase() || 'AD'}
              </div>
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-md border border-[#141827] bg-white p-1.5 text-[#141827] hover:bg-rose-50 hover:text-rose-600 transition-colors shadow-hard-sm"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5 text-rose-600" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Right Section: Top Bar + Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top Bar */}
        <header className="flex h-14 items-center justify-between border-b-2 border-[#141827] bg-white px-4 gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Sidebar toggle button */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-[#141827] bg-[#F8F5EF] text-[#141827] shadow-hard-sm hover:bg-[#F6D86B] transition-colors shrink-0"
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )}
            </button>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative w-64 md:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search questions by text or ID…"
                className="h-9 w-full rounded-lg border-2 border-[#141827] bg-[#F8F5EF] pl-9 pr-3 text-xs font-semibold text-[#141827] placeholder:text-slate-400 shadow-hard-sm focus:bg-white focus:outline-none transition-all"
              />
            </form>
          </div>

          {/* Right Top Bar Items */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Role display chip (read-only, from real auth) */}
            <div
              className="select-none rounded-lg border-2 border-[#141827] bg-[#C8D4CF] px-3 py-1 text-xs font-bold text-[#141827] shadow-hard-sm"
              title="Your account role"
            >
              Role: <span className="font-black">{role}</span>
            </div>

            {/* New Question Button — staff only */}
            {isStaff && (
              <Link href="/questions/new">
                <Button size="sm" className="gap-1.5 text-xs font-bold">
                  <Plus className="h-3.5 w-3.5 stroke-[3]" />
                  <span className="hidden sm:inline">New Question</span>
                </Button>
              </Link>
            )}
          </div>
        </header>

        {/* Main App Content Area */}
        <main className="flex-1 overflow-hidden bg-[#F5F1E8]">{children}</main>
      </div>
    </div>
  );
}
