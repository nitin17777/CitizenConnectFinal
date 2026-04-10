import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import CitizenDashboard from './pages/citizen/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import WorkerDashboard from './pages/worker/Dashboard';

function RequireAuth({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'#94a3b8' }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
}

function DashboardRouter() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'#94a3b8' }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'worker') return <Navigate to="/worker" replace />;
  return <Navigate to="/citizen" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#16162a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.1)' } }} />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardRouter />} />

            <Route path="/citizen/*" element={
              <RequireAuth allowedRoles={['citizen']}>
                <CitizenDashboard />
              </RequireAuth>
            } />

            <Route path="/admin/*" element={
              <RequireAuth allowedRoles={['admin']}>
                <AdminDashboard />
              </RequireAuth>
            } />

            <Route path="/worker/*" element={
              <RequireAuth allowedRoles={['worker']}>
                <WorkerDashboard />
              </RequireAuth>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
