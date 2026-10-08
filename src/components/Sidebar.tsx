import React from 'react';
import { useDocuments } from '../context/DocumentContext.js';
import {
  LayoutDashboard,
  FolderOpen,
  UploadCloud,
  FileText,
  Settings,
  HelpCircle,
  Sparkles,
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface SidebarProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRoute, navigate }) => {
  const { documents } = useDocuments();

  const total = documents.length;
  const completed = documents.filter(d => d.status === 'completed').length;
  const processing = documents.filter(d => d.status === 'processing').length;
  const needsReview = documents.filter(d => d.needsReviewCount > 0).length;

  const links = [
    { id: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: '/documents', label: 'Documents', icon: FolderOpen, badge: total },
    { id: '/upload', label: 'Upload Document', icon: UploadCloud },
    { id: '/results', label: 'Analysis & Viewer', icon: FileText },
    { id: '/settings', label: 'Settings & Theme', icon: Settings },
    { id: '/help', label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col border-r border-[var(--border)] bg-[var(--card)] p-4 min-h-[calc(100vh-4rem)]">
      {/* Navigation links */}
      <div className="space-y-1 mb-6">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] px-3 mb-2">
          Navigation
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = currentRoute === link.id;
          return (
            <button
              key={link.id}
              onClick={() => navigate(link.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[var(--primary)] text-white shadow-sm'
                  : 'text-[var(--foreground)] hover:bg-[var(--background)]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[var(--muted)]'}`} />
                <span>{link.label}</span>
              </div>
              {link.badge !== undefined && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[var(--background)] border border-[var(--border)] text-[var(--muted)]'
                  }`}
                >
                  {link.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Pipeline Status Summary */}
      <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)] mb-6">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-2.5 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[var(--primary)]" />
          <span>Pipeline Status</span>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[var(--muted)]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Parsed</span>
            </span>
            <span className="font-mono font-semibold text-[var(--foreground)]">{completed}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[var(--muted)]">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>Processing</span>
            </span>
            <span className="font-mono font-semibold text-[var(--foreground)]">{processing}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[var(--muted)]">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>Needs Review</span>
            </span>
            <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">{needsReview}</span>
          </div>
        </div>
      </div>

      {/* Gemini AI Card */}
      <div className="mt-auto p-3.5 rounded-xl border border-amber-300/40 dark:border-amber-900/60 bg-gradient-to-br from-amber-500/5 to-purple-500/5">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="font-bold text-xs text-[var(--foreground)]">Gemini Visual OCR</span>
        </div>
        <p className="text-[11px] text-[var(--muted)] leading-relaxed">
          Selective deep understanding for figures, charts, math LaTeX, and low-confidence regions.
        </p>
      </div>
    </aside>
  );
};
