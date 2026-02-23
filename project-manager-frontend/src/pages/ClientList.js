import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { Plus, Eye, Pencil, Trash2, Copy, ExternalLink } from 'lucide-react';
import { clientApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ClientList() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showDialog, setShowDialog] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', address: '', notes: '' });
  const toast = useRef(null);
  const { isAdmin, isEditor } = useAuth();

  useEffect(() => {
    loadClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const res = await clientApi.getAll({ search, page, per_page: 20 });
      setClients(res.data.data);
      setTotalRecords(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name) return;
    try {
      if (editClient) {
        await clientApi.update(editClient.id, form);
        toast.current.show({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật khách hàng' });
      } else {
        await clientApi.create(form);
        toast.current.show({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm khách hàng' });
      }
      setShowDialog(false);
      setEditClient(null);
      setForm({ name: '', email: '', phone: '', company: '', address: '', notes: '' });
      loadClients();
    } catch (err) {
      toast.current.show({ severity: 'error', summary: 'Lỗi', detail: 'Có lỗi xảy ra' });
    }
  };

  const handleEdit = (client) => {
    setEditClient(client);
    setForm({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      company: client.company || '',
      address: client.address || '',
      notes: client.notes || '',
    });
    setShowDialog(true);
  };

  const handleDelete = (id) => {
    confirmDialog({
      message: 'Bạn có chắc chắn muốn xóa khách hàng này? Tất cả dự án liên quan cũng sẽ bị xóa.',
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Xóa',
      rejectLabel: 'Hủy',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await clientApi.delete(id);
          toast.current.show({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa khách hàng' });
          loadClients();
        } catch (err) {
          toast.current.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xóa' });
        }
      },
    });
  };

  const copyLink = (code) => {
    const link = `${window.location.origin}/project-created/${code}`;
    navigator.clipboard.writeText(link);
    toast.current.show({ severity: 'info', summary: 'Đã copy', detail: link, life: 2000 });
  };

  const nameBody = (rowData) => (
    <Link to={`/clients/${rowData.id}`} className="text-primary-600 hover:text-primary-700 no-underline font-medium">
      {rowData.name}
    </Link>
  );

  const codeBody = (rowData) => (
    <div className="flex items-center gap-2">
      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{rowData.code}</code>
      <button onClick={() => copyLink(rowData.code)} className="p-1 text-gray-400 hover:text-gray-600" title="Copy link khách hàng">
        <Copy size={14} />
      </button>
    </div>
  );

  const actionsBody = (rowData) => (
    <div className="flex items-center gap-1">
      <Link to={`/clients/${rowData.id}`} className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
        <Eye size={16} />
      </Link>
      {isEditor && (
        <button onClick={() => handleEdit(rowData)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          <Pencil size={16} />
        </button>
      )}
      {isAdmin && (
        <button onClick={() => handleDelete(rowData.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <Trash2 size={16} />
        </button>
      )}
      <a
        href={`/project-created/${rowData.code}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
        title="Trang khách hàng"
      >
        <ExternalLink size={16} />
      </a>
    </div>
  );

  return (
    <div className="space-y-6">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Khách hàng</h2>
          <p className="text-gray-500 mt-1">Quản lý thông tin khách hàng</p>
        </div>
        {isEditor && (
          <button
            onClick={() => { setEditClient(null); setForm({ name: '', email: '', phone: '', company: '', address: '', notes: '' }); setShowDialog(true); }}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <Plus size={18} />
            Thêm khách hàng
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <InputText
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Tìm kiếm khách hàng..."
          className="w-full max-w-md"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <DataTable
          value={clients}
          loading={loading}
          paginator
          lazy
          rows={20}
          totalRecords={totalRecords}
          first={(page - 1) * 20}
          onPage={(e) => setPage(e.page + 1)}
          emptyMessage="Không tìm thấy khách hàng nào"
          rowClassName={() => 'hover:bg-gray-50'}
        >
          <Column field="name" header="Tên" body={nameBody} />
          <Column field="code" header="Mã" body={codeBody} />
          <Column field="email" header="Email" />
          <Column field="phone" header="SĐT" />
          <Column field="projects_count" header="Số dự án" />
          <Column header="" body={actionsBody} style={{ width: '160px' }} />
        </DataTable>
      </div>

      {/* Client Dialog */}
      <Dialog
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        header={editClient ? 'Cập nhật khách hàng' : 'Thêm khách hàng'}
        style={{ width: '500px' }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng <span className="text-red-500">*</span></label>
            <InputText value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} className="w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <InputText value={form.email} onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} className="w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SĐT</label>
              <InputText value={form.phone} onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))} className="w-full" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Công ty</label>
            <InputText value={form.company} onChange={(e) => setForm(prev => ({ ...prev, company: e.target.value }))} className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
            <InputText value={form.address} onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))} className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
            <InputText value={form.notes} onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))} className="w-full" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowDialog(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Hủy</button>
            <button type="button" onClick={handleSave} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">{editClient ? 'Cập nhật' : 'Tạo'}</button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
