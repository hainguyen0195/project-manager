import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FolderKanban, Plus, Copy } from 'lucide-react';
import { clientApi, projectApi } from '../services/api';
import { formatCurrency, formatDate, statusLabels, statusColors, paymentLabels, paymentColors } from '../utils/format';

export default function ClientProjects() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadData = async () => {
    try {
      const [clientRes, statsRes] = await Promise.all([
        clientApi.getById(id),
        projectApi.getStatistics({ client_id: id }),
      ]);
      setClient(clientRes.data.client);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/project-created/${client.code}`;
    navigator.clipboard.writeText(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!client) {
    return <div className="text-center py-12 text-gray-500">Không tìm thấy khách hàng</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link to="/clients" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">{client.code}</code>
              <button onClick={copyLink} className="text-gray-400 hover:text-gray-600" title="Copy link">
                <Copy size={14} />
              </button>
              {client.email && <span className="text-gray-500 text-sm">• {client.email}</span>}
              {client.phone && <span className="text-gray-500 text-sm">• {client.phone}</span>}
            </div>
          </div>
        </div>
        <Link
          to="/projects/new"
          className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-colors no-underline text-sm font-medium"
        >
          <Plus size={18} />
          Thêm dự án
        </Link>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Tổng dự án</p>
            <p className="text-xl font-bold text-gray-900">{stats.total_projects}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Tổng doanh thu</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(stats.total_revenue)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Đã cọc</p>
            <p className="text-lg font-bold text-orange-600">{formatCurrency(stats.total_deposit)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Đã thanh toán đủ</p>
            <p className="text-lg font-bold text-emerald-600">{formatCurrency(stats.total_paid)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Còn nợ</p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(stats.total_remaining)}</p>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="space-y-3">
        {client.projects?.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <FolderKanban size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Khách hàng chưa có dự án nào</p>
          </div>
        ) : (
          client.projects?.map(project => (
            <div key={project.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-primary-300 transition-colors">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex-1">
                  <Link to={`/projects/${project.id}`} className="text-lg font-semibold text-primary-600 hover:text-primary-700 no-underline">
                    {project.name}
                  </Link>
                  {project.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                      {statusLabels[project.status]}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${paymentColors[project.payment_status]}`}>
                      {paymentLabels[project.payment_status]}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(project.project_price)}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(project.created_at)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
