import { Routes, Route } from 'react-router-dom';
import AdminSidebar from './Sidebar';
import AdminHome from './Home';
import AdminComplaints from './Complaints';
import AdminWorkers from './Workers';

export default function AdminDashboard() {
  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="main-content">
        <Routes>
          <Route index element={<AdminHome />} />
          <Route path="complaints" element={<AdminComplaints />} />
          <Route path="workers" element={<AdminWorkers />} />
        </Routes>
      </main>
    </div>
  );
}
