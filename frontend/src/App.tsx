import { useState } from "react";
import { Sidebar } from "./components/admin/Components/Sidebar";
import Navbar from "./components/admin/Components/Navbar"; // ✅ Import the Navbar
import { Route, Routes } from "react-router-dom";

import Dashboard from "./components/admin/pages/Dashboard";
import UserVerification from "./components/admin/pages/UserVerification";
import InternshipManager from "./components/admin/pages/InternshipManager";
import ActivityMonitor from "./components/admin/pages/ActivityMonitor";
import CertificateManager from "./components/admin/pages/CertificateManager";
import Settings from "./components/admin/pages/Settings";

function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`flex flex-col w-full  transition-all duration-300 ${collapsed ? "ml-16" : "ml-64"}`}>
        {/* ✅ Navbar always at the top */}
        <Navbar />

        {/* ✅ Main content below the Navbar */}
        <main className="p-6 bg-dashboardbg text-white min-h-screen">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<UserVerification />} />
            <Route path="/internships" element={<InternshipManager />} />
            <Route path="/activities" element={<ActivityMonitor />} />
            <Route path="/certificates" element={<CertificateManager />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
