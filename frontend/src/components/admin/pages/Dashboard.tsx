import {
  FiUsers,
  FiUserCheck,
  FiBookOpen,
  FiActivity,
  FiAward,
  FiFile,
  FiCheckCircle,
  FiFileText,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const stats = [
  {
    title: "Registered Users",
    value: 1200,
    icon: <FiUsers className="text-3xl text-neonpink" />,
  },
  {
    title: "Pending Verifications",
    value: 45,
    icon: <FiUserCheck className="text-3xl text-neonpink" />,
  },
  {
    title: "Active Internships",
    value: 37,
    icon: <FiBookOpen className="text-3xl text-neonpink" />,
  },
  {
    title: "Reports Today",
    value: 85,
    icon: <FiActivity className="text-3xl text-neonpink" />,
  },
  {
    title: "Certificates Issued",
    value: 214,
    icon: <FiAward className="text-3xl text-neonpink" />,
  },
];

const users = [
  { name: "Vishnu M", email: "vishnu@example.com", status: "Verified" },
  { name: "Krithi R", email: "krithi@example.com", status: "Pending" },
  { name: "Deepak K", email: "deepak@example.com", status: "Verified" },
  { name: "Sara V", email: "sara@example.com", status: "Pending" },
];

const quickActions = [
  {
    label: "Create Internship",
    icon: <FiFile className="text-3xl text-neonpink" />,
    path: "/internships",
  },
  {
    label: "Verify Users",
    icon: <FiCheckCircle className="text-3xl text-neonpink" />,
    path: "/users",
  },
  {
    label: "View Reports",
    icon: <FiFileText className="text-3xl text-neonpink" />,
    path: "/activities",
  },
];

const activityData = [
  { date: "Mon", activity: 20 },
  { date: "Tue", activity: 35 },
  { date: "Wed", activity: 30 },
  { date: "Thu", activity: 50 },
  { date: "Fri", activity: 40 },
  { date: "Sat", activity: 60 },
  { date: "Sun", activity: 45 },
];

const Dashboard = () => {
  return (
    <div className="p-10 text-white">
      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-cardbg p-6 rounded-lg shadow hover:shadow-lg transition"
          >
            <div className="flex items-center gap-4">
              <div>{stat.icon}</div>
              <div>
                <p className="text-xl font-semibold">{stat.value}</p>
                <p className="text-md text-textMuted">{stat.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Graph Section */}
      <div className="bg-cardbg p-6 rounded-xl mb-8">
        <h2 className="text-xl font-semibold mb-4">Weekly Activity Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="date" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip contentStyle={{ backgroundColor: "#1f2937", color: "#fff" }} />
            <Line type="monotone" dataKey="activity" stroke="#a66cff" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Latest Users Table */}
      <div className="bg-cardbg p-6 rounded-xl mb-8">
        <FiUsers className="text-3xl text-neonpink" />
        <h2 className="text-xl font-semibold mb-4">Latest Users</h2>
        <table className="w-full text-sm text-left">
          <thead className="text-textMuted border-b border-gray-700">
            <tr>
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-800 hover:bg-gray-800 transition"
              >
                <td className="py-2">{user.name}</td>
                <td className="py-2">{user.email}</td>
                <td
                  className={`py-2 font-medium ${
                    user.status === "Verified" ? "text-green-400" : "text-yellow-400"
                  }`}
                >
                  {user.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Actions */}
      <div className="bg-cardbg p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action, idx) => (
            <a
              key={idx}
              href={action.path}
              className="flex items-center gap-3 p-3 bg-gray-800 rounded hover:bg-gray-700 transition"
            >
              <span className="text-xl">{action.icon}</span>
              <span>{action.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
