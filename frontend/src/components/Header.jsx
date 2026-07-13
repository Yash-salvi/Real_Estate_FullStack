import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Home, User, LogOut, LayoutDashboard, Bookmark, Key } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 transition hover:opacity-90">
            <Home className="h-6 w-6 text-brand-600" />
            <span>Plotify <span className="font-extrabold text-brand-600">Estates</span></span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition">
            Browse Properties
          </Link>
        </nav>

        {/* Auth / Profile Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Dashboard based on role */}
              {user.role === 'AGENT' && (
                <Link
                  to="/agent-dashboard"
                  className="flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Agent Hub</span>
                </Link>
              )}

              {user.role === 'BUYER' && (
                <Link
                  to="/buyer-dashboard"
                  className="flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
                >
                  <Bookmark className="h-4 w-4" />
                  <span>My Saves</span>
                </Link>
              )}

              {user.role === 'ADMIN' && (
                <div className="flex gap-2">
                  <Link
                    to="/agent-dashboard"
                    className="flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
                  >
                    <span>Agent Hub</span>
                  </Link>
                  <Link
                    to="/buyer-dashboard"
                    className="flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-100"
                  >
                    <span>Buyer Hub</span>
                  </Link>
                </div>
              )}

              {/* User Profile */}
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs text-slate-500 font-medium capitalize">{user.role}</span>
                <span className="text-sm font-semibold text-slate-800">{user.name}</span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 hover:text-red-600"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-600 hover:text-brand-600 transition px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 hover:shadow"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
