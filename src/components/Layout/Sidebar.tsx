import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/institutions', label: 'Institutions', icon: '🏫' },
  { to: '/attendance', label: 'Mark Attendance', icon: '✅' },
  { to: '/attendance/report', label: 'Report', icon: '📊' },
];

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { admin, logout } = useAuth();

  return (
    <>
      {/* Overlay (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-slate-900 text-white
          transform transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-slate-700 px-5">
          <span className="text-2xl">🎓</span>
          <div>
            <p className="text-sm font-bold leading-tight">Attendance SaaS</p>
            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4">
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              <span>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-slate-700 p-4">
          <p className="truncate text-sm font-medium">{admin?.name}</p>
          <p className="truncate text-xs text-slate-400">{admin?.email}</p>
          <button
            onClick={logout}
            className="mt-3 w-full rounded-md bg-slate-700 py-1.5 text-sm text-slate-200
              hover:bg-red-600 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
