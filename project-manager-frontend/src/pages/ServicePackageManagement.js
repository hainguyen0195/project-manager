import React, { useState, useEffect, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import {
  Package, Plus, Pencil, Trash2, Star, X, Save,
  Globe, Server, Wrench, Puzzle, GripVertical
} from 'lucide-react';
import { servicePackageApi } from '../services/api';
import { formatCurrency } from '../utils/format';

const categoryOptions = [
  { label: 'Gói Website', value: 'website', icon: Globe, color: 'from-blue-500 to-cyan-500' },
  { label: 'Gói Hosting', value: 'hosting', icon: Server, color: 'from-green-500 to-emerald-500' },
  { label: 'Dịch vụ', value: 'service', icon: Wrench, color: 'from-purple-500 to-pink-500' },
  { label: 'Tiện ích bổ sung', value: 'addon', icon: Puzzle, color: 'from-orange-500 to-red-500' },
];

const unitOptions = [
  { label: 'Dự án', value: 'dự án' },
  { label: 'Tháng', value: 'tháng' },
  { label: 'Năm', value: 'năm' },
  { label: 'Lần', value: 'lần' },
  { label: 'Trang', value: 'trang' },
];

const emptyForm = {
  category: 'website',
  name: '',
  description: '',
  price: 0,
  price_max: null,
  unit: 'dự án',
  features: [],
  is_popular: false,
  is_active: true,
  sort_order: 0,
};

export default function ServicePackageManagement() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [featureInput, setFeatureInput] = useState('');
  const toast = useRef(null);

  useEffect(() => { loadPackages(); }, []);

  const loadPackages = async () => {
    try {
      const res = await servicePackageApi.getAll();
      setPackages(res.data);
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách gói' });
    } finally {
      setLoading(false);
    }
  };

  const openNew = (category = 'website') => {
    setForm({ ...emptyForm, category });
    setEditId(null);
    setFeatureInput('');
    setShowDialog(true);
  };

  const openEdit = (pkg) => {
    setForm({
      category: pkg.category,
      name: pkg.name,
      description: pkg.description || '',
      price: Number(pkg.price) || 0,
      price_max: pkg.price_max ? Number(pkg.price_max) : null,
      unit: pkg.unit || 'dự án',
      features: pkg.features || [],
      is_popular: pkg.is_popular || false,
      is_active: pkg.is_active !== false,
      sort_order: pkg.sort_order || 0,
    });
    setEditId(pkg.id);
    setFeatureInput('');
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.name) {
      toast.current?.show({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng nhập tên gói' });
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await servicePackageApi.update(editId, form);
      } else {
        await servicePackageApi.create(form);
      }
      await loadPackages();
      setShowDialog(false);
      toast.current?.show({ severity: 'success', summary: 'Thành công', detail: editId ? 'Đã cập nhật gói' : 'Đã thêm gói mới' });
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể lưu gói' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (pkg) => {
    confirmDialog({
      message: `Xóa gói "${pkg.name}"?`,
      header: 'Xác nhận xóa',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Xóa',
      rejectLabel: 'Hủy',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await servicePackageApi.delete(pkg.id);
          await loadPackages();
          toast.current?.show({ severity: 'success', summary: 'Đã xóa', detail: 'Đã xóa gói thành công' });
        } catch {
          toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xóa' });
        }
      },
    });
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setForm(prev => ({ ...prev, features: [...(prev.features || []), featureInput.trim()] }));
      setFeatureInput('');
    }
  };

  const removeFeature = (index) => {
    setForm(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  };

  const filteredPackages = activeCategory
    ? packages.filter(p => p.category === activeCategory)
    : packages;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="text-gray-400" size={28} />
            Quản lý Bảng giá & Dịch vụ
          </h1>
          <p className="text-sm text-gray-500 mt-1">Thêm, sửa, xóa các gói dịch vụ và bảng giá</p>
        </div>
        <button
          onClick={() => openNew()}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
        >
          <Plus size={18} />
          Thêm gói mới
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            !activeCategory ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Tất cả ({packages.length})
        </button>
        {categoryOptions.map(cat => {
          const count = packages.filter(p => p.category === cat.value).length;
          const Icon = cat.icon;
          return (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === cat.value ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Icon size={16} />
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Package Cards */}
      {filteredPackages.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <Package size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có gói dịch vụ nào</p>
          <button
            onClick={() => openNew(activeCategory || 'website')}
            className="mt-4 text-blue-600 text-sm font-medium hover:underline"
          >
            + Thêm gói mới
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPackages.map(pkg => {
            const catInfo = categoryOptions.find(c => c.value === pkg.category);
            const CatIcon = catInfo?.icon || Package;
            return (
              <div
                key={pkg.id}
                className={`bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all ${!pkg.is_active ? 'opacity-60' : ''}`}
              >
                <div className={`bg-gradient-to-r ${catInfo?.color || 'from-gray-500 to-gray-600'} px-5 py-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-2 text-white">
                    <CatIcon size={18} />
                    <span className="text-xs font-medium uppercase tracking-wider">{catInfo?.label}</span>
                  </div>
                  {pkg.is_popular && (
                    <span className="flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                      <Star size={12} /> Phổ biến
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{pkg.name}</h3>
                  {pkg.description && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{pkg.description}</p>
                  )}

                  <div className="mb-4">
                    <span className="text-2xl font-black text-gray-900">{formatCurrency(pkg.price)}</span>
                    {pkg.price_max && (
                      <span className="text-lg text-gray-400"> - {formatCurrency(pkg.price_max)}</span>
                    )}
                    <span className="text-sm text-gray-400 ml-1">/{pkg.unit}</span>
                  </div>

                  {pkg.features?.length > 0 && (
                    <ul className="space-y-1.5 mb-4">
                      {pkg.features.slice(0, 5).map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="text-green-500 mt-0.5">✓</span>
                          {f}
                        </li>
                      ))}
                      {pkg.features.length > 5 && (
                        <li className="text-xs text-gray-400">+{pkg.features.length - 5} tính năng khác</li>
                      )}
                    </ul>
                  )}

                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => openEdit(pkg)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Pencil size={14} /> Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(pkg)}
                      className="flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        header={editId ? 'Chỉnh sửa gói' : 'Thêm gói mới'}
        className="w-full max-w-2xl"
        modal
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
              <Dropdown
                value={form.category}
                options={categoryOptions}
                onChange={(e) => setForm(prev => ({ ...prev, category: e.value }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên gói *</label>
              <InputText
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full"
                placeholder="VD: Gói cơ bản"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <InputTextarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full"
              placeholder="Mô tả ngắn gọn..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá</label>
              <InputNumber
                value={form.price}
                onValueChange={(e) => setForm(prev => ({ ...prev, price: e.value || 0 }))}
                mode="currency"
                currency="VND"
                locale="vi-VN"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá tối đa</label>
              <InputNumber
                value={form.price_max}
                onValueChange={(e) => setForm(prev => ({ ...prev, price_max: e.value }))}
                mode="currency"
                currency="VND"
                locale="vi-VN"
                className="w-full"
                placeholder="Bỏ trống nếu giá cố định"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị</label>
              <Dropdown
                value={form.unit}
                options={unitOptions}
                onChange={(e) => setForm(prev => ({ ...prev, unit: e.value }))}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tính năng / Mô tả chi tiết</label>
            <div className="flex gap-2 mb-2">
              <InputText
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                className="flex-1"
                placeholder="Nhập tính năng và nhấn Enter..."
              />
              <button
                type="button"
                onClick={addFeature}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={18} />
              </button>
            </div>
            {form.features?.length > 0 && (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {form.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm">
                    <GripVertical size={14} className="text-gray-300" />
                    <span className="flex-1">{f}</span>
                    <button onClick={() => removeFeature(i)} className="text-red-400 hover:text-red-600">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <InputSwitch
                checked={form.is_popular}
                onChange={(e) => setForm(prev => ({ ...prev, is_popular: e.value }))}
              />
              <span className="text-sm text-gray-700">Gói phổ biến</span>
            </div>
            <div className="flex items-center gap-2">
              <InputSwitch
                checked={form.is_active}
                onChange={(e) => setForm(prev => ({ ...prev, is_active: e.value }))}
              />
              <span className="text-sm text-gray-700">Hiển thị</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Thứ tự:</label>
              <InputNumber
                value={form.sort_order}
                onValueChange={(e) => setForm(prev => ({ ...prev, sort_order: e.value || 0 }))}
                className="w-20"
                min={0}
              />
            </div>
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
              {saving ? 'Đang lưu...' : (editId ? 'Cập nhật' : 'Thêm mới')}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
