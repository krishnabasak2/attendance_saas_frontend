import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.tsx';
import Header from './Header.tsx';

const titleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/institutions': 'Institution Management',
  '/attendance': 'Mark Attendance',
  '/attendance/report': 'Attendance Report',
};

function getTitle(pathname: string) {
  if (pathname.includes('/students')) return 'Student Management';
  return titleMap[pathname] || 'Attendance SaaS';
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={getTitle(pathname)} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
