import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * A simple navigation bar displayed at the top of every page.  It provides links
 * to the home page and, when authenticated, to the favourites and agent
 * dashboard.  It also exposes a sign‑in/sign‑out button depending on the
 * current authentication state.
 */
export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-xl font-semibold text-blue-600">
            Property Portal
          </Link>
          <Link
            to="/"
            className="text-gray-700 hover:text-blue-600 hidden sm:inline"
          >
            Browse
          </Link>
          {user && (
            <Link
              to="/favorites"
              className="text-gray-700 hover:text-blue-600 hidden sm:inline"
            >
              Favourites
            </Link>
          )}
          {user && (
            <Link
              to="/lists"
              className="text-gray-700 hover:text-blue-600 hidden sm:inline"
            >
              Lists
            </Link>
          )}
          {user && (
            <Link
              to="/saved-searches"
              className="text-gray-700 hover:text-blue-600 hidden sm:inline"
            >
              Saved Searches
            </Link>
          )}
          {user && (
            <Link
              to="/compare"
              className="text-gray-700 hover:text-blue-600 hidden sm:inline"
            >
              Compare
            </Link>
          )}
          {user?.role === 'agent' && (
            <Link
              to="/agent"
              className="text-gray-700 hover:text-blue-600 hidden sm:inline"
            >
              Agent Dashboard
            </Link>
          )}
        </div>
        <div>
          {user ? (
            <button
              onClick={handleSignOut}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
            >
              Sign out
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
