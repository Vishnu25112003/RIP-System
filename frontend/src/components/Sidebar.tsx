import { Link, useLocation } from "react-router-dom";
import {
  FiMenu,
  FiHome,
  FiUserCheck,
  FiBookOpen,
  FiClipboard,
  FiActivity,
  FiAward,
  FiSettings,
} from "react-icons/fi";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

const topNavItems = [
  { name: "Dashboard", path: "/", icon: <FiHome /> },
  { name: "UserVerification", path: "/users", icon: <FiUserCheck /> },
  { name: "Internships", path: "/internships", icon: <FiBookOpen /> },
  { name: "CourseAccepter", path: "/courses", icon: <FiClipboard /> },
  { name: "MonitorActivities", path: "/activities", icon: <FiActivity /> },
  { name: "Certificates", path: "/certificates", icon: <FiAward /> },
];

const settingsItem = { name: "Settings", path: "/settings", icon: <FiSettings /> };

export const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  const location = useLocation();

  return (
    <div
      className={`h-screen bg-sidebarbg text-white fixed flex flex-col justify-between transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Top Section */}
      <div>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!collapsed && <h1 className="text-xl font-bold">Admin</h1>}
          <button onClick={() => setCollapsed(!collapsed)}>
            <FiMenu className="text-white text-2xl" />
          </button>
        </div>

        <nav className="mt-4 flex flex-col gap-2 px-2">
          {topNavItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={idx}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded hover:bg-gray-800 transition ${
                  isActive ? "bg-neonpink" : ""
                } ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? item.name : ""}
              >
                <span className="text-xl">{item.icon}</span>
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="px-2 mb-4">
        <hr className="border-gray-600 pb-1.5"/>
        <Link
          to={settingsItem.path}
          className={`flex items-center gap-3 p-3 rounded hover:bg-gray-800 transition ${
            location.pathname === settingsItem.path ? "bg-neonpink" : ""
          } ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? settingsItem.name : ""}
        >
          <span className="text-xl">{settingsItem.icon}</span>
          {!collapsed && <span>{settingsItem.name}</span>}
        </Link>
      </div>
    </div>
  );
};
