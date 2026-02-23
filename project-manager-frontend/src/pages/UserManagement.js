import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { UserCog, Plus, Pencil, Trash2, Shield, Save } from 'lucide-react';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'Editor', value: 'editor' },
  { label: 'Viewer', value: 'viewer' },
];

const roleBadge = {
  admin: 'bg-red-100 text-red-700',
  editor: 'bg-blue-100 text-blue-700',
  viewer: 'bg-gray-100 text-gray-600',
};

const emptyForm = { name: '', email: '', password: '', role: 'viewer' };

export default function UserManagement() {
  const { isAdmin, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const toast = useRef(null);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const res = await authApi.getUsers();
      setUsers(res.data);
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách users' });
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setShowDialog(true);
  };

  const openEdit = (u) => {
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    setEditId(u.id);
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      toast.current?.show({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng nhập đầy đủ thông tin' });
      return;
    }
    if (!editId && !form.password) {
      toast.current?.show({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng nhập mật khẩu' });
      return;
    }

    setSaving(true);
    try {
      const data = { ...form };
      if (editId && !data.password) delete data.password;

      if (editId) {
        await authApi.updateUser(editId, data);
        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật user' });
      } else {
        await authApi.createUser(data);
        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Đã tạo user mới' });
      }
      await loadUsers();
      setShowDialog(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể lưu user';
      toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (u) => {
    if (u.id === currentUser?.id) {
      toast.current?.show({ severity: 'warn', summary: 'Cảnh báo', detail: 'Không thể xóa chính mình' });
      return;
    }
    confirmDialog({
      message: `Bạn có chắc muốn xóa user "${u.name}"?`,
      header: 'Xác nhận xóa',
      acceptLabel: 'Xóa',
      rejectLabel: 'Hủy',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await authApi.deleteUser(u.id);
          toast.current?.show({ severity: 'success', summary: 'Đã xóa' });
          await loadUsers();
        } catch {
          toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xóa user' });
        }
      },
    });
  };

  if (!isAdmin) return <Navigate to="/" replace />;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <UserCog className="text-gray-400" size={28} />
            Quản lý Users
          </h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý tài khoản và phân quyền</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
        >
          <Plus size={18} />
          Thêm user
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {u.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{u.name}</p>
                      {u.id === currentUser?.id && (
                        <span className="text-xs text-gray-400">(bạn)</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">{u.email}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${roleBadge[u.role]}`}>
                    <Shield size={11} />
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEdit(u)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    {u.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDelete(u)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="p-12 text-center">
            <UserCog size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Chưa có user nào</p>
          </div>
        )}
      </div>

      <Dialog
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        header={editId ? 'Chỉnh sửa User' : 'Thêm User mới'}
        className="w-full max-w-md"
        modal
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên *</label>
            <InputText
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full"
              placeholder="Nguyễn Văn A"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <InputText
              value={form.email}
              onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu {editId ? '(bỏ trống nếu không đổi)' : '*'}
            </label>
            <InputText
              type="password"
              value={form.password}
              onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
              className="w-full"
              placeholder="Tối thiểu 6 ký tự"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quyền</label>
            <Dropdown
              value={form.role}
              options={roleOptions}
              onChange={(e) => setForm(prev => ({ ...prev, role: e.value }))}
              className="w-full"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              onClick={() => setShowDialog(false)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Đang lưu...' : (editId ? 'Cập nhật' : 'Tạo mới')}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
