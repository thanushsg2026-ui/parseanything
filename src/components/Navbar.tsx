import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext.js';
import { useDocuments } from '../context/DocumentContext.js';
import {
  FileText,
  LayoutDashboard,
  UploadCloud,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Sparkles,
  Search,
  BookOpen,
  CheckCircle2,
  FolderOpen,
  HelpCircle,
  User,
  ChevronDown,
  Shield,
  Activity,
} from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate }) => {
  const { mode, setMode } = useTheme();
  const { geminiConnected, searchQuery, setSearchQuery } = useDocuments();
  const [profileOpen, setProfileOpen] = useState(false);

  const navItems = [
    { id: '/', label: 'Overview', icon: BookOpen },
    { id: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: '/documents', label: 'Documents', icon: FolderOpen },
    { id: '/upload', label: 'Upload', icon: UploadCloud },
    { id: '/results', label: 'Results', icon: FileText },
    { id: '/settings', label: 'Settings', icon: SettingsIcon },
    { id: '/help', label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] text-white shadow-sm ring-2 ring-[var(--primary)]/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-[var(--foreground)]">
                ParseAnything
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--primary)]/10 text-[var(--primary)] font-semibold border border-[var(--primary)]/20">
                v1.0
              </span>
            </div>
            <span className="text-[10px] text-[var(--muted)] hidden sm:block">
              Universal Document Parser for AI
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden xl:flex items-center gap-1 bg-[var(--background)] p-1 rounded-xl border border-[var(--border)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[var(--card)] text-[var(--primary)] shadow-xs font-semibold'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)]/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Search bar */}
          <div className="relative hidden md:block w-36 lg:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-hidden focus:border-[var(--primary)]"
            />
          </div>

          {/* Help quick button */}
          <button
            onClick={() => navigate('/help')}
            className={`p-2 rounded-lg border transition-colors ${
              currentRoute === '/help'
                ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                : 'border-[var(--border)] bg-[var(--background)] hover:bg-[var(--card)] text-[var(--foreground)]'
            }`}
            title="Help & Support Center"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Gemini AI Status Badge */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono border border-[var(--border)] bg-[var(--background)]">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span className="text-[var(--foreground)]">Gemini 3.8</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5 inline-block" />
          </div>

          {/* Theme Mode Toggle */}
          <button
            onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--card)] text-[var(--foreground)] transition-colors"
            title={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {mode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* Settings Button */}
          <button
            onClick={() => navigate('/settings')}
            className="p-2 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--card)] text-[var(--foreground)] transition-colors"
            title="Theme & Parser Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-1.5 p-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--card)] text-[var(--foreground)] transition-colors cursor-pointer"
              title="User Profile Menu"
            >
              <div className="w-6 h-6 rounded-md bg-[var(--primary)] text-white flex items-center justify-center font-bold text-xs">
                T
              </div>
              <ChevronDown className="w-3 h-3 text-[var(--muted)]" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-1.5 w-60 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xl p-2 z-50 text-xs space-y-1">
                <div className="px-3 py-2 border-b border-[var(--border)]">
                  <div className="font-bold text-[var(--foreground)] truncate">thanush.sg2026</div>
                  <div className="text-[10px] text-[var(--muted)] truncate">thanush.sg2026@vitstudent.ac.in</div>
                  <div className="mt-1 inline-flex items-center gap-1 text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <Shield className="w-2.5 h-2.5" /> Enterprise Workspace
                  </div>
                </div>

                <button
                  onClick={() => {
                    navigate('/dashboard');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--background)] text-[var(--foreground)] text-left"
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-500" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => {
                    navigate('/settings');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--background)] text-[var(--foreground)] text-left"
                >
                  <SettingsIcon className="w-4 h-4 text-purple-500" />
                  <span>Theme & Settings</span>
                </button>

                <button
                  onClick={() => {
                    navigate('/help');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--background)] text-[var(--foreground)] text-left font-medium text-[var(--primary)]"
                >
                  <HelpCircle className="w-4 h-4 text-[var(--primary)]" />
                  <span>Help & Support Center</span>
                </button>

                <button
                  onClick={() => {
                    navigate('/help');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--background)] text-[var(--foreground)] text-left"
                >
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span>System Diagnostics</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav drawer row */}
      <div className="flex xl:hidden items-center justify-around py-2 border-t border-[var(--border)] bg-[var(--background)] overflow-x-auto text-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md shrink-0 ${
                isActive ? 'text-[var(--primary)] font-bold' : 'text-[var(--muted)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};

