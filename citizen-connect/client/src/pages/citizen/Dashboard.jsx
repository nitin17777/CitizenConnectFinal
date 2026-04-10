import { Routes, Route } from 'react-router-dom';
import CitizenSidebar from './Sidebar';
import CitizenHome from './Home';
import ReportIssue from './ReportIssue';
import MyComplaints from './MyComplaints';

export default function CitizenDashboard() {
  return (
    <div className="dashboard-layout">
      <CitizenSidebar />
      <main className="main-content">
        <Routes>
          <Route index element={<CitizenHome />} />
          <Route path="report" element={<ReportIssue />} />
          <Route path="my-complaints" element={<MyComplaints />} />
        </Routes>
      </main>
    </div>
  );
}
