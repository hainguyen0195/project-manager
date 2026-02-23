import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban, DollarSign, TrendingUp,
  AlertCircle, Clock, CheckCircle2, Plus
} from 'lucide-react';
import { projectApi } from '../services/api';
import { formatCurrency } from '../utils/format';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, projectsRes] = await Promise.all([
        projectApi.getStatistics(),
        projectApi.getAll({ per_page: 5, sort_field: 'created_at', sort_order: 'desc' }),
      ]);
      setStats(statsRes.data);
      setRecentProjects(projectsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Tổng dự án',
      value: stats?.total_projects || 0,
      icon: FolderKanban,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
    },
    {
      label: 'Tổng doanh thu',
      value: formatCurrency(stats?.total_revenue || 0),
      icon: TrendingUp,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
    },
    {
      label: 'Đã thanh toán',
      value: formatCurrency((stats?.total_deposit || 0) + (stats?.total_paid || 0)),
      icon: DollarSign,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50',
    },
    {
      label: 'Còn nợ',
      value: formatCurrency(stats?.total_remaining || 0),
      icon: AlertCircle,
      color: 'bg-red-500',
      lightColor: 'bg-red-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tổng quan</h2>
          <p className="text-gray-500 mt-1">Thống kê tổng hợp dự án của bạn</p>
        </div>
        <Link
          to="/projects/new"
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-colors no-underline text-sm font-medium"
        >
          <Plus size={18} />
          Thêm dự án
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                  <p className="text-xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`${card.lightColor} p-3 rounded-lg`}>
                  <Icon size={24} className={`text-${card.color.replace('bg-', '')}`} style={{ color: card.color === 'bg-blue-500' ? '#3b82f6' : card.color === 'bg-green-500' ? '#22c55e' : card.color === 'bg-emerald-500' ? '#10b981' : '#ef4444' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status and Payment Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái dự án</h3>
          <div className="space-y-3">
            {[
              { label: 'Chờ xử lý', value: stats?.by_status?.pending || 0, color: 'bg-yellow-400', icon: Clock },
              { label: 'Đang thực hiện', value: stats?.by_status?.in_progress || 0, color: 'bg-blue-400', icon: FolderKanban },
              { label: 'Demo', value: stats?.by_status?.demo || 0, color: 'bg-purple-400', icon: FolderKanban },
              { label: 'Production', value: stats?.by_status?.production || 0, color: 'bg-teal-400', icon: CheckCircle2 },
              { label: 'Hoàn thành', value: stats?.by_status?.completed || 0, color: 'bg-green-400', icon: CheckCircle2 },
            ].map((item, i) => {
              const Icon = item.icon;
              const total = stats?.total_projects || 1;
              const pct = Math.round((item.value / total) * 100);
              return (
                <div key={i} className="flex items-center gap-3">
                  <Icon size={18} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-600 w-32">{item.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-8 text-right">{item.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái thanh toán</h3>
          <div className="space-y-4">
            {[
              { label: 'Chưa thanh toán', value: stats?.by_payment?.unpaid || 0, color: 'text-red-600', bg: 'bg-red-50' },
              { label: 'Đã cọc', value: stats?.by_payment?.deposit_paid || 0, color: 'text-orange-600', bg: 'bg-orange-50' },
              { label: 'Đã thanh toán đủ', value: stats?.by_payment?.fully_paid || 0, color: 'text-green-600', bg: 'bg-green-50' },
            ].map((item, i) => (
              <div key={i} className={`flex items-center justify-between p-3 ${item.bg} rounded-lg`}>
                <span className={`text-sm font-medium ${item.color}`}>{item.label}</span>
                <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Dự án gần đây</h3>
          <Link to="/projects" className="text-sm text-primary-600 hover:text-primary-700 no-underline font-medium">
            Xem tất cả →
          </Link>
        </div>
        {recentProjects.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Chưa có dự án nào. Hãy thêm dự án đầu tiên!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Dự án</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Khách hàng</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Giá</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map(project => (
                  <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <Link to={`/projects/${project.id}`} className="text-primary-600 hover:text-primary-700 no-underline font-medium">
                        {project.name}
                      </Link>
                    </td>
                    <td className="py-3 px-2 text-gray-600">{project.client?.name}</td>
                    <td className="py-3 px-2 text-gray-900 font-medium">{formatCurrency(project.project_price)}</td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project.status === 'completed' ? 'bg-green-100 text-green-800' :
                        project.status === 'production' ? 'bg-teal-100 text-teal-800' :
                        project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'demo' ? 'bg-purple-100 text-purple-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {project.status === 'completed' ? 'Hoàn thành' :
                         project.status === 'production' ? 'Production' :
                         project.status === 'in_progress' ? 'Đang thực hiện' :
                         project.status === 'demo' ? 'Demo' : 'Chờ xử lý'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
