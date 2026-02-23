import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, Users,
  Menu, X, ChevronRight, Phone, Mail, Settings,
  Package, Briefcase
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Tổng quan', icon: LayoutDashboard },
  { path: '/projects', label: 'Dự án', icon: FolderKanban },
  { path: '/clients', label: 'Khách hàng', icon: Users },
  { path: '/service-packages', label: 'Bảng giá & Dịch vụ', icon: Package },
  { path: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { path: '/settings', label: 'Cài đặt', icon: Settings },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <span className="text-2xl font-black bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Cris</span>
            <span className="text-sm font-semibold text-gray-700">HaiNguyen Dev</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded hover:bg-gray-100">
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
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors no-underline mt-4 border-t border-gray-100 pt-4"
          >
            <Briefcase size={20} />
            <span>Xem Portfolio (Public)</span>
          </a>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Liên hệ</p>
          <a href="tel:0123456789" className="flex items-center gap-2 text-xs text-gray-500 hover:text-primary-600 no-underline py-1 transition-colors">
            <Phone size={13} /> 0123 456 789
          </a>
          <a href="mailto:hainguyen.dev@gmail.com" className="flex items-center gap-2 text-xs text-gray-500 hover:text-primary-600 no-underline py-1 transition-colors">
            <Mail size={13} /> hainguyen.dev@gmail.com
          </a>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 mr-4"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Cris</span>
            <span className="text-sm font-semibold text-gray-600">| Quản lý Dự án</span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
