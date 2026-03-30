import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.tsx';
import Layout from './components/Layout/Layout.tsx';
import Login from './pages/Login.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Institutions from './pages/Institutions.tsx';
import Students from './pages/Students.tsx';
import Attendance from './pages/Attendance.tsx';
import AttendanceReport from './pages/AttendanceReport.tsx';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center text-slate-500">Loading…</div>;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="institutions" element={<Institutions />} />
        <Route path="institutions/:institutionId/students" element={<Students />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="attendance/report" element={<AttendanceReport />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
