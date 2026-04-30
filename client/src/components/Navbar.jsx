import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-6">
        <Link to="/" className="text-xl font-bold text-gray-900">
          TaskManager
        </Link>
        <Link to="/" className="text-sm text-gray-700 hover:text-gray-900">
          Dashboard
        </Link>
        <Link to="/projects" className="text-sm text-gray-700 hover:text-gray-900">
          Projects
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {user.email}{' '}
          <span className="ml-1 px-2 py-0.5 text-xs rounded bg-indigo-100 text-indigo-700 capitalize">
            {user.role}
          </span>
        </span>
        <button
          onClick={handleLogout}
          className="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
