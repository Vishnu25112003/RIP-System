import { FiUser, FiLogOut } from "react-icons/fi";
import { Link } from "react-router-dom"; // ✅ Import Link

const Navbar = () => {
  const adminName = "Admin";

  return (
    <>
    <nav className="bg-dashboardbg text-white px-6 py-4 flex justify-between items-center shadow-md border-gray-700">
      {/* Panel Logo/Title */}
      <div className="font-bold tracking-wide text-neonPink ml-10 text-3xl">
        Welcome Back, Admin
      </div>

      {/* Right Side: Profile + Logout */}
      <div className="flex items-center gap-4">
        {/* ✅ Profile section wrapped in Link */}
        <Link
          to="/settings"
          className="flex items-center gap-3 bg-gray-800 px-3 py-2 rounded-lg hover:bg-gray-700 transition cursor-pointer"
        >
          <FiUser className="text-xl text-neonBlue" />
          <span className="text-sm font-medium hidden sm:inline">{adminName}</span>
        </Link>

        {/* Logout Button */}
        <button
          onClick={() => alert("Logged out!")}
          title="Logout"
          className="text-red-400 hover:text-red-500 transition text-xl"
        >
          <FiLogOut />
        </button>
      </div>
    </nav>
    <hr className="border-gray-700" />
    </>
  );
};

export default Navbar;
