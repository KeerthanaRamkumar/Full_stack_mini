import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  PenLine,
  Search,
  Bookmark,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  ShieldAlert,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, quickLogin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [testAccountsOpen, setTestAccountsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand Wordmark (Single text element in editorial serif) */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="font-serif text-2xl font-bold tracking-tight text-stone-900 hover:text-stone-700 transition-colors whitespace-nowrap"
            >
              Ink & Quill
            </Link>
          </div>

          {/* Zone 2: Primary Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
            <Link to="/" className="hover:text-stone-900 transition-colors">
              Home
            </Link>
            <Link to="/blogs" className="hover:text-stone-900 transition-colors">
              Articles
            </Link>
            <Link to="/categories" className="hover:text-stone-900 transition-colors">
              Categories
            </Link>
            <Link to="/bookmarks" className="hover:text-stone-900 transition-colors">
              Bookmarks
            </Link>
            <Link to="/mern-architecture" className="hover:text-stone-900 transition-colors">
              MERN Guide
            </Link>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Quick Demo Logins Helper */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setTestAccountsOpen(!testAccountsOpen)}
                className="px-2.5 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 border border-stone-300 rounded-md hover:border-stone-400 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                title="Quickly test with Admin or Author credentials"
              >
                <Sparkles className="w-3.5 h-3.5 text-stone-500" />
                <span>Test Logins</span>
              </button>

              {testAccountsOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-white border border-stone-200 rounded-lg shadow-lg p-2.5 z-50 text-xs"
                  onMouseLeave={() => setTestAccountsOpen(false)}
                >
                  <p className="font-semibold text-stone-900 mb-2 px-1">Switch Test Credentials:</p>
                  <button
                    type="button"
                    onClick={async () => {
                      await quickLogin('admin');
                      setTestAccountsOpen(false);
                      navigate('/admin/dashboard');
                    }}
                    className="w-full text-left p-2 rounded hover:bg-stone-50 text-stone-800 transition-colors flex flex-col"
                  >
                    <span className="font-medium flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-stone-700" /> Eleanor Vance (Admin)
                    </span>
                    <span className="text-[11px] text-stone-500">admin@example.com · admin123</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await quickLogin('author');
                      setTestAccountsOpen(false);
                      navigate('/author/dashboard');
                    }}
                    className="w-full text-left p-2 rounded hover:bg-stone-50 text-stone-800 transition-colors flex flex-col mt-1"
                  >
                    <span className="font-medium flex items-center gap-1">
                      <UserIcon className="w-3.5 h-3.5 text-stone-700" /> Julian Thorne (Author)
                    </span>
                    <span className="text-[11px] text-stone-500">author@example.com · author123</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await quickLogin('user');
                      setTestAccountsOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full text-left p-2 rounded hover:bg-stone-50 text-stone-800 transition-colors flex flex-col mt-1"
                  >
                    <span className="font-medium flex items-center gap-1">
                      <UserIcon className="w-3.5 h-3.5 text-stone-700" /> Keerthana R. (Reader)
                    </span>
                    <span className="text-[11px] text-stone-500">user@example.com · user123</span>
                  </button>
                </div>
              )}
            </div>

            {/* Write Blog Button */}
            <Link
              to="/create-blog"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-stone-900 bg-white border border-stone-300 rounded-md hover:bg-stone-50 hover:border-stone-400 transition-colors whitespace-nowrap shadow-xs"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Write</span>
            </Link>

            {/* User Profile / Auth State */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-stone-300 transition-all focus:outline-none"
                  aria-label="User menu"
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover border border-stone-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-stone-800 text-stone-100 flex items-center justify-center font-serif text-sm font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white border border-stone-200 rounded-lg shadow-lg py-1.5 z-50"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs font-semibold text-stone-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase tracking-wider text-stone-600 font-mono">
                        Role: {user.role}
                      </span>
                    </div>

                    <Link
                      to="/author/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-stone-400" />
                      <span>Author Dashboard</span>
                    </Link>

                    {user.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-stone-900 font-medium hover:bg-stone-50 transition-colors"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-stone-800" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <Link
                      to="/bookmarks"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      <Bookmark className="w-3.5 h-3.5 text-stone-400" />
                      <span>My Bookmarks</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-stone-400" />
                      <span>Profile & Settings</span>
                    </Link>

                    <div className="border-t border-stone-100 my-1"></div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-700 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-stone-900 rounded-md hover:bg-stone-800 transition-colors whitespace-nowrap shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              to="/create-blog"
              className="p-2 text-stone-700 hover:text-stone-900"
              aria-label="Write Article"
            >
              <PenLine className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-stone-700 hover:text-stone-900 focus:outline-none"
              aria-label="Toggle navigation"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden border-b border-stone-200 bg-[#FAF8F5] px-4 pt-2 pb-5 space-y-3">
          <div className="flex flex-col space-y-2 text-sm font-medium text-stone-700">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="px-2 py-1.5 rounded hover:bg-stone-100"
            >
              Home
            </Link>
            <Link
              to="/blogs"
              onClick={() => setMenuOpen(false)}
              className="px-2 py-1.5 rounded hover:bg-stone-100"
            >
              Articles
            </Link>
            <Link
              to="/categories"
              onClick={() => setMenuOpen(false)}
              className="px-2 py-1.5 rounded hover:bg-stone-100"
            >
              Categories
            </Link>
            <Link
              to="/bookmarks"
              onClick={() => setMenuOpen(false)}
              className="px-2 py-1.5 rounded hover:bg-stone-100"
            >
              Bookmarks
            </Link>
            <Link
              to="/mern-architecture"
              onClick={() => setMenuOpen(false)}
              className="px-2 py-1.5 rounded hover:bg-stone-100"
            >
              MERN Stack Guide
            </Link>
          </div>

          <div className="border-t border-stone-200 pt-3">
            {user ? (
              <div className="space-y-2">
                <div className="text-xs text-stone-500 px-2">
                  Signed in as <span className="font-semibold text-stone-800">{user.name}</span> ({user.role})
                </div>
                <Link
                  to="/author/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="block px-2 py-1.5 text-xs text-stone-700 rounded hover:bg-stone-100"
                >
                  Author Dashboard
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block px-2 py-1.5 text-xs font-semibold text-stone-900 rounded hover:bg-stone-100"
                  >
                    Admin Console
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block px-2 py-1.5 text-xs text-stone-700 rounded hover:bg-stone-100"
                >
                  Profile & Settings
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-2 py-1.5 text-xs text-rose-600 rounded hover:bg-rose-50"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-center py-2 text-xs font-medium text-stone-700 border border-stone-300 rounded"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="text-center py-2 text-xs font-medium text-white bg-stone-900 rounded"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
