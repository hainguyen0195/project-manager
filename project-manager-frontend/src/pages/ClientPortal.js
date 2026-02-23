import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FolderKanban, ExternalLink, Globe, Calendar } from 'lucide-react';
import { clientApi, STORAGE_URL } from '../services/api';
import { formatCurrency, formatDate, statusLabels, statusColors } from '../utils/format';

export default function ClientPortal() {
  const { clientCode } = useParams();
  const [client, setClient] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientCode]);

  const loadData = async () => {
    try {
      const res = await clientApi.getByCode(clientCode);
      setClient(res.data.client);
      setStats(res.data.stats);
    } catch (err) {
      setError('Không tìm thấy thông tin khách hàng');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FolderKanban size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">{error}</h2>
          <p className="text-gray-500">Vui lòng kiểm tra lại đường link</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <FolderKanban size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">PM Tool</h1>
              <p className="text-xs text-gray-500">Quản lý Dự án</p>
            </div>
          </div>
          <Link to="/pricing" className="text-sm text-primary-600 hover:text-primary-700 no-underline font-medium">
            Bảng giá dịch vụ →
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Client Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {client.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
              <p className="text-gray-500">Danh sách dự án của bạn</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-xl text-center">
              <p className="text-xs text-blue-600 mb-1 font-medium">Tổng dự án</p>
              <p className="text-2xl font-bold text-blue-700">{stats?.total_projects || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl text-center">
              <p className="text-xs text-green-600 mb-1 font-medium">Tổng giá trị</p>
              <p className="text-lg font-bold text-green-700">{formatCurrency(stats?.total_revenue || 0)}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-xl text-center">
              <p className="text-xs text-orange-600 mb-1 font-medium">Đã cọc</p>
              <p className="text-lg font-bold text-orange-700">{formatCurrency(stats?.total_deposit || 0)}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-xl text-center">
              <p className="text-xs text-red-600 mb-1 font-medium">Còn lại</p>
              <p className="text-lg font-bold text-red-700">{formatCurrency(stats?.total_debt || 0)}</p>
            </div>
          </div>
        </div>

        {/* Projects */}
        <h3 className="text-xl font-bold text-gray-900 mb-4">Các dự án</h3>

        {client.projects?.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <FolderKanban size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Chưa có dự án nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {client.projects?.map(project => (
              <div key={project.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">{project.name}</h4>
                    {project.description && (
                      <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                    )}

                    <div className="flex items-center gap-2 mt-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                        {statusLabels[project.status]}
                      </span>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap gap-3 mt-3">
                      {project.demo_link && (
                        <a href={project.demo_link} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 no-underline bg-purple-50 px-3 py-1 rounded-lg">
                          <Globe size={14} /> Demo
                        </a>
                      )}
                      {project.production_link && (
                        <a href={project.production_link} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700 no-underline bg-green-50 px-3 py-1 rounded-lg">
                          <ExternalLink size={14} /> Website
                        </a>
                      )}
                      {project.design_link && (
                        <a href={project.design_link} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 no-underline bg-blue-50 px-3 py-1 rounded-lg">
                          <ExternalLink size={14} /> Design
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(project.project_price)}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-500">Đã cọc: <span className="font-medium text-orange-600">{formatCurrency(project.deposit_amount)}</span></p>
                      <p className="text-xs text-gray-500">Còn lại: <span className="font-medium text-red-600">{formatCurrency((project.project_price || 0) - (project.deposit_amount || 0))}</span></p>
                      {project.payment_due_date && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                          <Calendar size={12} /> Hẹn TT: {formatDate(project.payment_due_date)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Images */}
                {project.images?.length > 0 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                    {project.images.slice(0, 4).map(img => (
                      <img
                        key={img.id}
                        src={`${STORAGE_URL}/${img.image_path}`}
                        alt={img.original_name}
                        className="h-20 w-28 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                      />
                    ))}
                    {project.images.length > 4 && (
                      <div className="h-20 w-28 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-sm flex-shrink-0">
                        +{project.images.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} PM Tool — Quản lý Dự án
        </div>
      </footer>
    </div>
  );
}
