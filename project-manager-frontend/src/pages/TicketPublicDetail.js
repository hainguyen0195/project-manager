import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ClipboardList, CheckCircle2, Clock3, ExternalLink } from 'lucide-react';
import { ticketApi } from '../services/api';
import { formatDate } from '../utils/format';

export default function TicketPublicDetail() {
  const { ticketCode } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await ticketApi.getPublicByCode(ticketCode);
        setData(res.data);
      } catch {
        setError('Không tìm thấy ticket');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [ticketCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error || !data?.ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ClipboardList size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-600 font-semibold">{error || 'Không có dữ liệu ticket'}</p>
        </div>
      </div>
    );
  }

  const { ticket, history } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Chi tiết Ticket</h1>
            <p className="text-xs text-gray-500">Mã: {ticket.public_code}</p>
          </div>
          <Link to={`/project-created/${ticket.client?.code || ''}`} className="text-sm text-primary-600 no-underline font-medium">
            Quay lại danh sách dự án
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            {ticket.status === 'completed' ? (
              <CheckCircle2 size={18} className="text-emerald-600" />
            ) : (
              <Clock3 size={18} className="text-orange-600" />
            )}
            <span className={`text-sm font-semibold ${ticket.status === 'completed' ? 'text-emerald-700' : 'text-orange-700'}`}>
              {ticket.status === 'completed' ? 'Đã hoàn thành' : 'Đang xử lý'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{ticket.title}</h2>
          <p className="text-sm text-gray-500 mt-1">Tạo lúc: {formatDate(ticket.created_at)}</p>
          <div className="prose max-w-none mt-4" dangerouslySetInnerHTML={{ __html: ticket.content }} />

          {Array.isArray(ticket.attachments) && ticket.attachments.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Ảnh đính kèm</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {ticket.attachments.map((path, idx) => (
                  <a
                    key={idx}
                    href={`/storage/${path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <img src={`/storage/${path}`} alt={`attachment-${idx}`} className="w-full h-28 object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Thông tin dự án</h3>
          <p className="text-sm"><span className="text-gray-500">Tên dự án:</span> <span className="font-semibold">{ticket.project?.name}</span></p>
          <p className="text-sm mt-1"><span className="text-gray-500">Khách hàng:</span> <span className="font-semibold">{ticket.client?.name}</span></p>
          {ticket.project?.production_link && (
            <a href={ticket.project.production_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 no-underline">
              <ExternalLink size={14} /> Xem website
            </a>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Lịch sử ticket của dự án</h3>
          <div className="space-y-2">
            {(history || []).map((t) => (
              <Link key={t.id} to={`/ticket/${t.public_code}`} className="block no-underline border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.title}</p>
                    <p className="text-xs text-gray-500">{formatDate(t.created_at)}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                    {t.status === 'completed' ? 'Đã xong' : 'Đang xử lý'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

