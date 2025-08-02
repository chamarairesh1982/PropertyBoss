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
    <nav className="bg-background border-b border-surface shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-md sm:px-lg lg:px-xl flex h-16 items-center justify-between">
        <div className="flex items-center space-x-md">
          <Link to="/" className="text-xl font-semibold text-primary font-heading">
            Property Portal
          </Link>
          <Link
            to="/"
            className="text-secondary hover:text-primary hidden sm:inline"
          >
            Browse
          </Link>
          {user && (
            <Link
              to="/favorites"
              className="text-secondary hover:text-primary hidden sm:inline"
            >
              Favourites
            </Link>
          )}
          {user && (
            <Link
              to="/lists"
              className="text-secondary hover:text-primary hidden sm:inline"
            >
              Lists
            </Link>
          )}
          {user && (
            <Link
              to="/saved-searches"
              className="text-secondary hover:text-primary hidden sm:inline"
            >
              Saved Searches
            </Link>
          )}
          {user && (
            <Link
              to="/compare"
              className="text-secondary hover:text-primary hidden sm:inline"
            >
              Compare
            </Link>
          )}
          {user?.role === 'agent' && (
            <Link
              to="/agent"
              className="text-secondary hover:text-primary hidden sm:inline"
            >
              Agent Dashboard
            </Link>
          )}
        </div>
        <div>
          {user ? (
            <button
              onClick={handleSignOut}
              className="bg-primary text-background px-md py-sm rounded-md text-sm hover:bg-primary/80"
            >
              Sign out
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-primary text-background px-md py-sm rounded-md text-sm hover:bg-primary/80"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
