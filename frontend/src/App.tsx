import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import Navbar from "./components/Navbar"; // ✅ Import the Navbar
import { Route, Routes } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import UserVerification from "./pages/UserVerification";
import InternshipManager from "./pages/InternshipManager";
import ActivityMonitor from "./pages/ActivityMonitor";
import CertificateManager from "./pages/CertificateManager";
import Settings from "./pages/Settings";

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
