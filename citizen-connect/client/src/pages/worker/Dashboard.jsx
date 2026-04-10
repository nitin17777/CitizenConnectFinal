import { Routes, Route } from 'react-router-dom';
import WorkerSidebar from './Sidebar';
import AvailableJobs from './AvailableJobs';
import MyJobs from './MyJobs';

export default function WorkerDashboard() {
  return (
    <div className="dashboard-layout">
      <WorkerSidebar />
      <main className="main-content">
        <Routes>
          <Route index element={<AvailableJobs />} />
          <Route path="my-jobs" element={<MyJobs />} />
        </Routes>
      </main>
    </div>
  );
}
