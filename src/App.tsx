import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext.js';
import { DocumentProvider } from './context/DocumentContext.js';
import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';
import { OverviewPage } from './pages/OverviewPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { UploadPage } from './pages/UploadPage.js';
import { DocumentsPage } from './pages/DocumentsPage.js';
import { ResultsPage } from './pages/ResultsPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { HelpdeskPage } from './pages/HelpdeskPage.js';

export function AppContent() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      return path && path.length > 0 ? path : '/';
    }
    return '/';
  });

  const navigate = (route: string) => {
    setCurrentRoute(route);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', route);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const isResultsPage = currentRoute.startsWith('/results');
  const isOverviewPage = currentRoute === '/';

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      <Navbar currentRoute={currentRoute} navigate={navigate} />

      <div className="flex-1 flex overflow-hidden">
        {/* Render Sidebar only on Dashboard, Documents, Upload, Settings */}
        {!isOverviewPage && !isResultsPage && (
          <Sidebar currentRoute={currentRoute} navigate={navigate} />
        )}

        <main className="flex-1 overflow-y-auto">
          {currentRoute === '/' && <OverviewPage navigate={navigate} />}
          {currentRoute === '/dashboard' && <DashboardPage navigate={navigate} />}
          {currentRoute === '/upload' && <UploadPage navigate={navigate} />}
          {currentRoute === '/documents' && <DocumentsPage navigate={navigate} />}
          {currentRoute.startsWith('/results') && <ResultsPage navigate={navigate} />}
          {currentRoute === '/settings' && <SettingsPage />}
          {currentRoute === '/help' && <HelpdeskPage navigate={navigate} />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DocumentProvider>
        <AppContent />
      </DocumentProvider>
    </ThemeProvider>
  );
}
