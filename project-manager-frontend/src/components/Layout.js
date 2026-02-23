import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard, FolderKanban, Users,
  Menu, X, ChevronRight, Phone, Mail, Settings,
  Package, Briefcase, LogOut, UserCog, Shield,
  Sun, Moon
} from 'lucide-react';

const getNavItems = (isAdmin) => {
  const items = [
    { path: '/', label: 'Tổng quan', icon: LayoutDashboard },
    { path: '/projects', label: 'Dự án', icon: FolderKanban },
    { path: '/clients', label: 'Khách hàng', icon: Users },
    { path: '/service-packages', label: 'Bảng giá & Dịch vụ', icon: Package },
    { path: '/portfolio', label: 'Portfolio', icon: Briefcase },
    { path: '/settings', label: 'Cài đặt', icon: Settings },
  ];

  if (isAdmin) {
    items.push({ path: '/users', label: 'Quản lý Users', icon: UserCog });
  }

  return items;
};

const roleBadge = {
  admin: { label: 'Admin', className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' },
  editor: { label: 'Editor', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
  viewer: { label: 'Viewer', className: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const navItems = getNavItems(isAdmin);
  const badge = roleBadge[user?.role] || roleBadge.viewer;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <span className="text-2xl font-black bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Cris</span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">HaiNguyen Dev</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300">
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1 flex-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors no-underline ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-200'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {isActive && <ChevronRight size={16} className="ml-auto" />}
              </Link>
            );
          })}

          <a
            href="/portfolio-showcase"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-600 dark:hover:bg-gray-700/50 dark:hover:text-gray-300 transition-colors no-underline mt-4 border-t border-gray-100 dark:border-gray-700 pt-4"
          >
            <Briefcase size={20} />
            <span>Xem Portfolio (Public)</span>
          </a>
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
              <div className="flex items-center gap-1.5">
                <Shield size={11} className="text-gray-400" />
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${badge.className}`}>
                  {badge.label}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Liên hệ</p>
          <a href="tel:0123456789" className="flex items-center gap-2 text-xs text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 no-underline py-1 transition-colors">
            <Phone size={13} /> 0123 456 789
          </a>
          <a href="mailto:hainguyen.dev@gmail.com" className="flex items-center gap-2 text-xs text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 no-underline py-1 transition-colors">
            <Mail size={13} /> hainguyen.dev@gmail.com
          </a>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-8 transition-colors">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 mr-4"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              {(() => {
                const currentNav = navItems.find(item =>
                  item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
                );
                const Icon = currentNav?.icon || LayoutDashboard;
                return (
                  <>
                    <Icon size={20} className="text-primary-600 dark:text-primary-400" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{currentNav?.label || 'Tổng quan'}</span>
                  </>
                );
              })()}
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            title={isDark ? 'Chuyển sang Light Mode' : 'Chuyển sang Dark Mode'}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
