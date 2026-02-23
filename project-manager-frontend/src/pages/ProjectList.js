import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import { Plus, Eye, Pencil, Trash2, AlertTriangle, Clock, FolderKanban, TrendingUp, Wallet, CircleDollarSign, BadgeAlert, Globe, User, Calendar, DollarSign, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { projectApi, clientApi, hostingApi } from '../services/api';
import { formatCurrency, formatDate, statusLabels, statusColors, paymentLabels, paymentColors } from '../utils/format';

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [stats, setStats] = useState(null);
  const [expiringHosting, setExpiringHosting] = useState([]);
  const [showExpiringPanel, setShowExpiringPanel] = useState(false);
  const [searchParams] = useSearchParams();
  const toast = React.useRef(null);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    client_id: searchParams.get('client_id') || '',
    status: searchParams.get('status') || '',
    payment_status: searchParams.get('payment_status') || '',
    page: parseInt(searchParams.get('page')) || 1,
    per_page: 10,
    sort_field: 'created_at',
    sort_order: 'desc',
  });

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null) params[key] = value;
      });

      const [projectsRes, statsRes] = await Promise.all([
        projectApi.getAll(params),
        projectApi.getStatistics({ client_id: filters.client_id }),
      ]);

      setProjects(projectsRes.data.data);
      setTotalRecords(projectsRes.data.total);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    clientApi.getAllList().then(res => setClients(res.data)).catch(console.error);
    hostingApi.getExpiring(30).then(res => setExpiringHosting(res.data)).catch(console.error);
  }, []);

  const handleDelete = (id) => {
    confirmDialog({
      message: 'Bạn có chắc chắn muốn xóa dự án này?',
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Xóa',
      rejectLabel: 'Hủy',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await projectApi.delete(id);
          toast.current.show({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa dự án' });
          loadProjects();
        } catch (err) {
          toast.current.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xóa dự án' });
        }
      },
    });
  };

  const statusOptions = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Chờ xử lý', value: 'pending' },
    { label: 'Đang thực hiện', value: 'in_progress' },
    { label: 'Demo', value: 'demo' },
    { label: 'Production', value: 'production' },
    { label: 'Hoàn thành', value: 'completed' },
    { label: 'Đã hủy', value: 'cancelled' },
  ];

  const paymentOptions = [
    { label: 'Tất cả thanh toán', value: '' },
    { label: 'Chưa thanh toán', value: 'unpaid' },
    { label: 'Đã cọc', value: 'deposit_paid' },
    { label: 'Đã thanh toán', value: 'fully_paid' },
  ];

  const clientOptions = [
    { label: 'Tất cả khách hàng', value: '' },
    ...clients.map(c => ({ label: c.name, value: c.id })),
  ];

  return (
    <div className="space-y-6">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Danh sách Dự án</h2>
          <p className="text-gray-500 mt-1">Quản lý tất cả dự án của bạn</p>
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
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              label: 'Tổng dự án', value: stats.total_projects, isNumber: true,
              icon: FolderKanban, gradient: 'from-cyan-400 to-teal-500',
            },
            {
              label: 'Tổng doanh thu', value: formatCurrency(stats.total_revenue),
              icon: TrendingUp, gradient: 'from-orange-400 to-amber-500',
            },
            {
              label: 'Đã cọc', value: formatCurrency(stats.total_deposit),
              icon: Wallet, gradient: 'from-pink-500 to-rose-500',
            },
            {
              label: 'Đã thanh toán đủ', value: formatCurrency(stats.total_paid),
              icon: CircleDollarSign, gradient: 'from-sky-400 to-blue-500',
            },
            {
              label: 'Còn nợ', value: formatCurrency(stats.total_remaining),
              icon: BadgeAlert, gradient: 'from-amber-400 via-orange-500 to-yellow-500',
            },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-5 text-white shadow-lg`}>
                <div className="absolute -top-4 -right-4 opacity-20">
                  <Icon size={72} strokeWidth={1.2} />
                </div>
                <div className="relative z-10">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3">
                    <Icon size={22} />
                  </div>
                  <p className="text-xs font-medium text-white/80 mb-1">{card.label}</p>
                  <p className="text-xl font-bold">{card.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Hosting Expiring Notification */}
      {expiringHosting.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
          <button
            onClick={() => setShowExpiringPanel(!showExpiringPanel)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">
                {expiringHosting.filter(p => p.is_expired).length > 0
                  ? `${expiringHosting.filter(p => p.is_expired).length} hosting đã hết hạn`
                  : ''
                }
                {expiringHosting.filter(p => p.is_expired).length > 0 && expiringHosting.filter(p => !p.is_expired).length > 0 ? ' & ' : ''}
                {expiringHosting.filter(p => !p.is_expired).length > 0
                  ? `${expiringHosting.filter(p => !p.is_expired).length} hosting sắp hết hạn (trong 30 ngày)`
                  : ''
                }
              </span>
            </div>
            <span className="text-xs text-amber-600">{showExpiringPanel ? 'Thu gọn' : 'Xem chi tiết'}</span>
          </button>
          {showExpiringPanel && (
            <div className="mt-3 space-y-2">
              {expiringHosting.map(p => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg no-underline transition-colors hover:bg-amber-100 ${
                    p.is_expired ? 'bg-red-50 border border-red-200' : 'bg-white border border-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock size={14} className={p.is_expired ? 'text-red-500' : 'text-amber-500'} />
                    <span className="text-sm font-medium text-gray-800">{p.name}</span>
                    <span className="text-xs text-gray-500">({p.client?.name})</span>
                  </div>
                  <span className={`text-xs font-semibold ${p.is_expired ? 'text-red-600' : 'text-amber-600'}`}>
                    {p.is_expired
                      ? `Đã hết hạn ${Math.abs(p.days_until_expiry)} ngày`
                      : p.days_until_expiry === 0
                        ? 'Hết hạn hôm nay'
                        : `Còn ${p.days_until_expiry} ngày`
                    }
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <span className="p-input-icon-left w-full">
            <InputText
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              placeholder="Tìm kiếm dự án..."
              className="w-full"
            />
          </span>
          <Dropdown
            value={filters.client_id}
            options={clientOptions}
            onChange={(e) => setFilters(prev => ({ ...prev, client_id: e.value, page: 1 }))}
            placeholder="Khách hàng"
            className="w-full"
          />
          <Dropdown
            value={filters.status}
            options={statusOptions}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.value, page: 1 }))}
            placeholder="Trạng thái"
            className="w-full"
          />
          <Dropdown
            value={filters.payment_status}
            options={paymentOptions}
            onChange={(e) => setFilters(prev => ({ ...prev, payment_status: e.value, page: 1 }))}
            placeholder="Thanh toán"
            className="w-full"
          />
        </div>
      </div>

      {/* Project Cards */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <FolderKanban size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có dự án mới</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const cardGradients = {
              pending: 'from-slate-400 via-gray-500 to-slate-600',
              in_progress: 'from-blue-500 via-indigo-500 to-purple-500',
              demo: 'from-violet-500 via-purple-500 to-fuchsia-500',
              production: 'from-teal-400 via-cyan-500 to-blue-500',
              completed: 'from-emerald-400 via-green-500 to-teal-500',
              cancelled: 'from-red-400 via-rose-500 to-pink-500',
            };
            const gradient = cardGradients[project.status] || cardGradients.pending;
            const liveUrl = project.production_link || (project.domain_name ? `https://${project.domain_name}` : null);
            const projectTypeLabels = { new: 'Làm mới', upgrade: 'Nâng cấp', upload_source: 'Up source' };

            return (
              <div key={project.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Gradient Header */}
                <div className={`bg-gradient-to-r ${gradient} px-5 py-4 flex items-center justify-between`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                      <FolderKanban size={20} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <Link to={`/projects/${project.id}`} className="text-white font-bold text-lg no-underline hover:underline truncate block">
                        {project.name}
                      </Link>
                      {project.domain_name && (
                        <p className="text-white/70 text-xs truncate">{project.domain_name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${statusColors[project.status] || 'bg-gray-100 text-gray-800'}`}>
                      {statusLabels[project.status] || project.status}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${paymentColors[project.payment_status]}`}>
                      {paymentLabels[project.payment_status]}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="px-5 py-4">
                  {/* Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-3">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Khách hàng</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{project.client?.name || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={14} className="text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Giá dự án</p>
                        <p className="text-sm font-semibold text-gray-800">{formatCurrency(project.project_price)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wallet size={14} className="text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Đã cọc</p>
                        <p className="text-sm font-semibold text-orange-600">{formatCurrency(project.deposit_amount)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Ngày tạo</p>
                        <p className="text-sm font-semibold text-gray-800">{formatDate(project.created_at)}</p>
                      </div>
                    </div>
                    {project.project_type && (
                      <div className="flex items-center gap-2">
                        <FolderKanban size={14} className="text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Loại</p>
                          <p className="text-sm font-semibold text-gray-800">{projectTypeLabels[project.project_type] || project.project_type}</p>
                        </div>
                      </div>
                    )}
                    {liveUrl && (
                      <div className="flex items-center gap-2">
                        <Globe size={14} className="text-gray-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Website</p>
                          <a href={liveUrl.startsWith('http') ? liveUrl : `https://${liveUrl}`} target="_blank" rel="noopener noreferrer"
                            className="text-sm font-semibold text-blue-600 hover:text-blue-700 no-underline truncate block flex items-center gap-1">
                            {project.domain_name || 'Xem'} <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer: Actions */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                      {project.payment_status === 'deposit_paid' && Number(project.deposit_amount) > 0 && (
                        <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded-full">
                          Cọc: {formatCurrency(project.deposit_amount)}
                        </span>
                      )}
                      {Number(project.remaining_amount) > 0 && (
                        <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded-full">
                          Nợ: {formatCurrency(project.remaining_amount)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Link to={`/projects/${project.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors no-underline">
                        <Eye size={14} /> Xem chi tiết
                      </Link>
                      <Link to={`/projects/${project.id}/edit`}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Pencil size={15} />
                      </Link>
                      <button onClick={() => handleDelete(project.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalRecords > filters.per_page && (
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-3">
          <p className="text-sm text-gray-500">
            Hiển thị {((filters.page - 1) * filters.per_page) + 1}–{Math.min(filters.page * filters.per_page, totalRecords)} / {totalRecords} dự án
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={filters.page <= 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: Math.ceil(totalRecords / filters.per_page) }, (_, i) => i + 1)
              .filter(p => p === 1 || p === Math.ceil(totalRecords / filters.per_page) || Math.abs(p - filters.page) <= 2)
              .map((p, idx, arr) => (
                <React.Fragment key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-gray-400">...</span>}
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: p }))}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      p === filters.page ? 'bg-primary-600 text-white' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    {p}
                  </button>
                </React.Fragment>
              ))
            }
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={filters.page >= Math.ceil(totalRecords / filters.per_page)}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
