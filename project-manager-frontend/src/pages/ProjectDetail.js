import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { Image } from 'primereact/image';
import { Dialog } from 'primereact/dialog';
import { Editor } from 'primereact/editor';
import {
  ArrowLeft, Pencil, Globe, Server, Key, Shield,
  Calendar, DollarSign, ExternalLink, Copy, Eye, EyeOff, History,
  Mail, Send, Bell, CheckCircle, XCircle, Loader2, MessageCircle, Ticket, Trash2, Plus
} from 'lucide-react';
import { projectApi, notificationApi, ticketApi, STORAGE_URL } from '../services/api';
import { formatCurrency, formatDate, statusLabels, statusColors, paymentLabels, paymentColors } from '../utils/format';
import { useAuth } from '../context/AuthContext';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useRef(null);
  const { isEditor } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFtp, setShowFtp] = useState(false);
  const [sendingMail, setSendingMail] = useState(null);
  const [notifLogs, setNotifLogs] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [ticketActionLoading, setTicketActionLoading] = useState(null);
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    title: '',
    content: '',
    attachments: [],
  });

  useEffect(() => {
    loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadProject = async () => {
    try {
      const res = await projectApi.getById(id);
      setProject(res.data);
      try {
        const logsRes = await notificationApi.getProjectLogs(id);
        setNotifLogs(logsRes.data);
      } catch {}
      try {
        const ticketsRes = await ticketApi.getByProject(id);
        setTickets(ticketsRes.data);
      } catch {}
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải dự án' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (type) => {
    setSendingMail(type);
    try {
      const res = await notificationApi.send({ project_id: parseInt(id), type });
      toast.current?.show({ severity: 'success', summary: 'Thành công', detail: res.data.message });
      const logsRes = await notificationApi.getProjectLogs(id);
      setNotifLogs(logsRes.data);
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Lỗi',
        detail: err.response?.data?.message || 'Không thể gửi thông báo',
      });
    } finally {
      setSendingMail(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.current?.show({ severity: 'info', summary: 'Đã copy', detail: text, life: 2000 });
  };

  const handleCompleteTicket = async (ticketId, channels = []) => {
    setTicketActionLoading(`complete-${ticketId}-${channels.join('-') || 'none'}`);
    try {
      await ticketApi.complete(ticketId, { notify_channels: channels });
      toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Đã hoàn thành ticket' });
      const ticketsRes = await ticketApi.getByProject(id);
      setTickets(ticketsRes.data);
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: err.response?.data?.message || 'Không thể hoàn thành ticket' });
    } finally {
      setTicketActionLoading(null);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Xóa ticket đã hoàn thành này?')) return;
    setTicketActionLoading(`delete-${ticketId}`);
    try {
      await ticketApi.delete(ticketId);
      toast.current?.show({ severity: 'success', summary: 'Đã xóa', detail: 'Ticket đã được xóa' });
      const ticketsRes = await ticketApi.getByProject(id);
      setTickets(ticketsRes.data);
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: err.response?.data?.message || 'Không thể xóa ticket' });
    } finally {
      setTicketActionLoading(null);
    }
  };

  const handleCreateTicketFromProject = async () => {
    if (!project?.client?.code) {
      toast.current?.show({ severity: 'warn', summary: 'Thiếu dữ liệu', detail: 'Khách hàng chưa có mã code public để tạo ticket.' });
      return;
    }
    if (!newTicketForm.title || !newTicketForm.content) {
      toast.current?.show({ severity: 'warn', summary: 'Thiếu thông tin', detail: 'Vui lòng nhập tiêu đề và nội dung ticket.' });
      return;
    }

    setCreatingTicket(true);
    try {
      await ticketApi.createPublic({
        client_code: project.client.code,
        project_id: project.id,
        title: newTicketForm.title,
        content: newTicketForm.content,
        attachments: newTicketForm.attachments,
      });
      toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Đã tạo ticket và gửi thông báo cho admin.' });
      setShowCreateTicketModal(false);
      setNewTicketForm({ title: '', content: '', attachments: [] });
      const ticketsRes = await ticketApi.getByProject(id);
      setTickets(ticketsRes.data);
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: err.response?.data?.message || 'Không thể tạo ticket' });
    } finally {
      setCreatingTicket(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!project) {
    return <div className="text-center py-12 text-gray-500">Không tìm thấy dự án</div>;
  }

  const InfoRow = ({ label, value, copyable, isLink }) => {
    if (!value) return null;
    return (
      <div className="flex items-start py-2.5 border-b border-gray-100 last:border-0">
        <span className="text-sm text-gray-500 w-44 flex-shrink-0">{label}</span>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isLink ? (
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-700 truncate flex items-center gap-1">
              {value} <ExternalLink size={14} />
            </a>
          ) : (
            <span className="text-sm text-gray-900 break-words">{value}</span>
          )}
          {copyable && (
            <button onClick={() => copyToClipboard(value)} className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0">
              <Copy size={14} />
            </button>
          )}
        </div>
      </div>
    );
  };

  const remaining = (project.project_price || 0) - (project.deposit_amount || 0);

  return (
    <div className="max-w-5xl mx-auto">
      <Toast ref={toast} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
            <p className="text-gray-500 mt-1">
              Khách hàng: <Link to={`/clients/${project.client_id}`} className="text-primary-600 no-underline hover:text-primary-700">{project.client?.name}</Link>
            </p>
          </div>
        </div>
        {isEditor && (
          <Link
            to={`/projects/${project.id}/edit`}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-colors no-underline text-sm font-medium"
          >
            <Pencil size={16} />
            Chỉnh sửa
          </Link>
        )}
      </div>

      {/* Status Badges */}
      <div className="flex items-center gap-3 mb-6">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[project.status]}`}>
          {statusLabels[project.status]}
        </span>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${paymentColors[project.payment_status]}`}>
          {paymentLabels[project.payment_status]}
        </span>
      </div>

      <div className="space-y-4">
        {/* Basic Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Globe size={20} className="text-primary-600" />
            Thông tin cơ bản
          </h3>
          <InfoRow label="Tên dự án" value={project.name} />
          <InfoRow label="Loại dự án" value={
            project.project_type === 'new' ? 'Làm mới' :
            project.project_type === 'upgrade' ? 'Nâng cấp' :
            project.project_type === 'upload_source' ? 'Up source' : project.project_type
          } />
          {project.features?.length > 0 && (
            <div className="flex items-start py-2.5 border-b border-gray-100">
              <span className="text-sm text-gray-500 w-44 flex-shrink-0">Tính năng</span>
              <div className="flex flex-wrap gap-1.5">
                {project.features.map((f, i) => (
                  <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
          <InfoRow label="Mô tả" value={project.description} />
          <InfoRow label="Link Design" value={project.design_link} isLink copyable />
          <InfoRow label="Link Demo" value={project.demo_link} isLink copyable />
          <InfoRow label="Link Production" value={project.production_link} isLink copyable />
        </div>

        {/* Domain & Hosting */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Server size={20} className="text-purple-600" />
            Tên miền & Hosting
          </h3>
          <InfoRow label="Tên miền" value={project.domain_name} copyable />
          <InfoRow label="Nhà cung cấp tên miền" value={project.domain_provider} />
          <InfoRow label="Hết hạn tên miền" value={formatDate(project.domain_expiry_date)} />
          <InfoRow label="Nhà cung cấp hosting" value={project.hosting_provider} />
          <InfoRow label="Gói hosting" value={project.hosting_package} />
          <InfoRow label="Chi tiết hosting" value={project.hosting_details} />
          {project.using_own_hosting && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-2">Sử dụng hosting/tên miền của tôi</p>
              <InfoRow label="Gói hosting" value={
                project.own_hosting_package === 'basic' ? 'Cơ bản — 1GB SSD' :
                project.own_hosting_package === 'standard' ? 'Tiêu chuẩn — 5GB SSD' :
                project.own_hosting_package === 'advanced' ? 'Nâng cao — 20GB SSD' :
                project.own_hosting_package === 'vps' ? 'VPS — 4GB RAM, 80GB SSD' :
                project.own_hosting_package
              } />
              <InfoRow label="Giá hosting/năm" value={Number(project.own_hosting_price) > 0 ? formatCurrency(project.own_hosting_price) : null} />
              <InfoRow label="Ngày bắt đầu" value={formatDate(project.own_hosting_start_date)} />
              <InfoRow label="Thời gian" value={project.own_hosting_duration_months ? `${project.own_hosting_duration_months} tháng` : null} />
              <InfoRow label="Ngày hết hạn" value={formatDate(project.own_hosting_expiry_date)} />

              {project.hosting_histories?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <History size={16} className="text-blue-600" />
                    <span className="text-sm font-semibold text-blue-800">Lịch sử hosting</span>
                  </div>
                  <div className="space-y-2">
                    {project.hosting_histories.map((h) => {
                      const pkgLabels = { basic: 'Cơ bản', standard: 'Tiêu chuẩn', advanced: 'Nâng cao', vps: 'VPS' };
                      const actLabels = { initial: 'Đăng ký ban đầu', renew: 'Gia hạn', upgrade: 'Nâng cấp gói' };
                      return (
                        <div key={h.id} className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${
                          h.action === 'initial' ? 'bg-white border border-gray-200' :
                          h.action === 'renew' ? 'bg-blue-100/50 border border-blue-200' :
                          'bg-purple-100/50 border border-purple-200'
                        }`}>
                          <div>
                            <span className={`font-semibold ${
                              h.action === 'initial' ? 'text-gray-700' : h.action === 'renew' ? 'text-blue-700' : 'text-purple-700'
                            }`}>
                              {actLabels[h.action] || h.action}
                            </span>
                            {h.action === 'upgrade' && (
                              <span className="text-gray-500 ml-1">
                                {pkgLabels[h.package_from]} → {pkgLabels[h.package_to]}
                              </span>
                            )}
                            {h.action === 'renew' && <span className="text-gray-500 ml-1">+{h.duration_months} tháng</span>}
                            {h.notes && <span className="text-gray-400 ml-2">({h.notes})</span>}
                          </div>
                          <div className="text-right text-gray-500 flex-shrink-0">
                            <span>{formatCurrency(h.price)}</span>
                            <span className="ml-2">{formatDate(h.created_at)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FTP */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Key size={20} className="text-orange-600" />
            Thông tin FTP
            <button onClick={() => setShowFtp(!showFtp)} className="ml-auto p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
              {showFtp ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </h3>
          <InfoRow label="FTP Host" value={project.ftp_host} copyable />
          <InfoRow label="FTP Username" value={project.ftp_username} copyable />
          <InfoRow label="FTP Password" value={showFtp ? project.ftp_password : (project.ftp_password ? '••••••••' : null)} copyable={showFtp} />
          <InfoRow label="FTP Port" value={project.ftp_port} copyable />
        </div>

        {/* Web Config */}
        {project.web_config && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Cấu hình Web</h3>
            <pre className="bg-gray-50 p-4 rounded-lg text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap">{project.web_config}</pre>
          </div>
        )}

        {/* SSL */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Shield size={20} className="text-green-600" />
            SSL
          </h3>
          <InfoRow label="Nhà cung cấp" value={project.ssl_provider} />
          <InfoRow label="Hết hạn" value={formatDate(project.ssl_expiry_date)} />
          <InfoRow label="Chi tiết" value={project.ssl_details} />
        </div>

        {/* Dates */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Calendar size={20} className="text-blue-600" />
            Ngày quan trọng
          </h3>
          <InfoRow label="Ngày up demo" value={formatDate(project.demo_upload_date)} />
          <InfoRow label="Ngày up hosting" value={formatDate(project.hosting_upload_date)} />
        </div>

        {/* Payment */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <DollarSign size={20} className="text-emerald-600" />
            Thanh toán
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-xs text-green-600 mb-1">Giá dự án</p>
              <p className="text-xl font-bold text-green-700">{formatCurrency(project.project_price)}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <p className="text-xs text-orange-600 mb-1">Đã cọc</p>
              <p className="text-xl font-bold text-orange-700">{formatCurrency(project.deposit_amount)}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <p className="text-xs text-red-600 mb-1">Còn lại</p>
              <p className="text-xl font-bold text-red-700">{formatCurrency(remaining)}</p>
            </div>
          </div>
          <InfoRow label="Ngày cọc" value={formatDate(project.deposit_date)} />
          <InfoRow label="Ngày hẹn thanh toán" value={formatDate(project.payment_due_date)} />
          <InfoRow label="Ngày hoàn tất thanh toán" value={formatDate(project.payment_completion_date)} />
        </div>

        {/* Notifications */}
        {isEditor && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Mail size={20} className="text-violet-600" />
              Gửi thông báo (Email + Zalo)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Hosting expiry notification */}
              <div className={`border rounded-xl p-4 ${
                project.using_own_hosting && project.own_hosting_expiry_date
                  ? 'border-orange-200 bg-orange-50/50'
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <Server size={18} className="text-orange-600" />
                  <span className="text-sm font-semibold text-gray-800">Hosting hết hạn</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  {project.using_own_hosting && project.own_hosting_expiry_date
                    ? `Hết hạn: ${formatDate(project.own_hosting_expiry_date)}`
                    : 'Không sử dụng hosting riêng'}
                </p>
                <button
                  onClick={() => handleSendNotification('hosting_expiry')}
                  disabled={!project.using_own_hosting || !project.own_hosting_expiry_date || sendingMail === 'hosting_expiry'}
                  className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingMail === 'hosting_expiry' ? (
                    <><Loader2 size={16} className="animate-spin" /> Đang gửi...</>
                  ) : (
                    <><Send size={16} /> Gửi thông báo hosting</>
                  )}
                </button>
              </div>

              {/* Payment due notification */}
              <div className={`border rounded-xl p-4 ${
                project.payment_status !== 'fully_paid' && project.remaining_amount > 0
                  ? 'border-red-200 bg-red-50/50'
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={18} className="text-red-600" />
                  <span className="text-sm font-semibold text-gray-800">Nhắc thanh toán</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  {project.payment_status !== 'fully_paid' && project.remaining_amount > 0
                    ? `Còn nợ: ${formatCurrency(project.remaining_amount)}${project.payment_due_date ? ` — Hạn: ${formatDate(project.payment_due_date)}` : ''}`
                    : 'Đã thanh toán đủ'}
                </p>
                <button
                  onClick={() => handleSendNotification('payment_due')}
                  disabled={project.payment_status === 'fully_paid' || sendingMail === 'payment_due'}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingMail === 'payment_due' ? (
                    <><Loader2 size={16} className="animate-spin" /> Đang gửi...</>
                  ) : (
                    <><Send size={16} /> Gửi nhắc thanh toán</>
                  )}
                </button>
              </div>
            </div>

            {/* Notification Logs */}
            {notifLogs.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bell size={16} className="text-gray-500" />
                  <span className="text-sm font-semibold text-gray-700">Lịch sử gửi thông báo ({notifLogs.length})</span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {notifLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg text-xs">
                      <div className="flex items-center gap-2">
                        {log.status === 'sent'
                          ? <CheckCircle size={14} className="text-green-500" />
                          : <XCircle size={14} className="text-red-500" />
                        }
                        <span className={`font-medium ${
                          log.type === 'hosting_expiry' ? 'text-orange-700' : 'text-red-700'
                        }`}>
                          {log.type === 'hosting_expiry' ? 'Hosting hết hạn' : 'Nhắc thanh toán'}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          log.channel === 'zalo' ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {log.channel === 'zalo' ? <MessageCircle size={10} /> : <Mail size={10} />}
                          {log.channel || 'email'}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="text-gray-600">{log.channel === 'zalo' ? (log.recipient_phone || 'không có SĐT') : log.recipient_email}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          log.recipient_type === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {log.recipient_type}
                        </span>
                        {log.is_manual && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-700">thủ công</span>
                        )}
                      </div>
                      <span className="text-gray-400 flex-shrink-0">
                        {new Date(log.created_at).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tickets */}
        {isEditor && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4 gap-3">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Ticket size={20} className="text-indigo-600" />
                Ticket hỗ trợ ({tickets.length})
              </h3>
              <button
                onClick={() => setShowCreateTicketModal(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs border-none cursor-pointer"
              >
                <Plus size={14} />
                Thêm ticket
              </button>
            </div>

            {tickets.length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có ticket nào cho dự án này.</p>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{ticket.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {ticket.client?.name} • {new Date(ticket.created_at).toLocaleString('vi-VN')}
                        </p>
                        <a
                          href={`/ticket/${ticket.public_code}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 no-underline mt-1 inline-block"
                        >
                          Mở link public: /ticket/{ticket.public_code}
                        </a>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ticket.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                        {ticket.status === 'completed' ? 'Đã hoàn thành' : 'Đang mở'}
                      </span>
                    </div>

                    <div className="prose prose-sm max-w-none mt-3" dangerouslySetInnerHTML={{ __html: ticket.content }} />

                    {ticket.status !== 'completed' ? (
                      <div className="flex flex-wrap gap-2 mt-3">
                        <button
                          onClick={() => handleCompleteTicket(ticket.id, [])}
                          disabled={!!ticketActionLoading}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs border-none cursor-pointer disabled:opacity-60"
                        >
                          Hoàn thành
                        </button>
                        <button
                          onClick={() => handleCompleteTicket(ticket.id, ['email'])}
                          disabled={!!ticketActionLoading}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs border-none cursor-pointer disabled:opacity-60"
                        >
                          Hoàn thành + Email
                        </button>
                        <button
                          onClick={() => handleCompleteTicket(ticket.id, ['zalo'])}
                          disabled={!!ticketActionLoading}
                          className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs border-none cursor-pointer disabled:opacity-60"
                        >
                          Hoàn thành + Zalo
                        </button>
                        <button
                          onClick={() => handleCompleteTicket(ticket.id, ['email', 'zalo'])}
                          disabled={!!ticketActionLoading}
                          className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs border-none cursor-pointer disabled:opacity-60"
                        >
                          Hoàn thành + Email + Zalo
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3">
                        <button
                          onClick={() => handleDeleteTicket(ticket.id)}
                          disabled={ticketActionLoading === `delete-${ticket.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200 cursor-pointer disabled:opacity-60"
                        >
                          <Trash2 size={14} />
                          Xóa ticket đã hoàn thành
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Images */}
        {project.images?.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Hình ảnh</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {project.images.map(img => (
                <Image
                  key={img.id}
                  src={`${STORAGE_URL}/${img.image_path}`}
                  alt={img.original_name}
                  width="100%"
                  preview
                  imageClassName="w-full h-40 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog
        header={`Thêm ticket - ${project?.name || ''}`}
        visible={showCreateTicketModal}
        style={{ width: 'min(760px, 96vw)' }}
        onHide={() => setShowCreateTicketModal(false)}
      >
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Tiêu đề ticket</label>
            <input
              value={newTicketForm.title}
              onChange={(e) => setNewTicketForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Nhập tiêu đề"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Nội dung</label>
            <div className="mt-1">
              <Editor
                value={newTicketForm.content}
                onTextChange={(e) => setNewTicketForm(prev => ({ ...prev, content: e.htmlValue || '' }))}
                style={{ height: '220px' }}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Ảnh đính kèm</label>
            <input
              type="file"
              multiple
              accept="image/*"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              onChange={(e) => setNewTicketForm(prev => ({ ...prev, attachments: Array.from(e.target.files || []).slice(0, 5) }))}
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={() => setShowCreateTicketModal(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm"
            >
              Hủy
            </button>
            <button
              onClick={handleCreateTicketFromProject}
              disabled={creatingTicket}
              className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm border-none cursor-pointer disabled:opacity-60 inline-flex items-center gap-2"
            >
              {creatingTicket ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {creatingTicket ? 'Đang tạo...' : 'Tạo ticket'}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
