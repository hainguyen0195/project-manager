import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputSwitch } from 'primereact/inputswitch';
import { AutoComplete } from 'primereact/autocomplete';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Save, ArrowLeft, Plus, X, RefreshCw, ArrowUpCircle, History } from 'lucide-react';
import { projectApi, clientApi, hostingApi, STORAGE_URL } from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';

const SectionTitle = ({ children }) => (
  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4 mt-6">{children}</h3>
);

const Field = ({ label, children, required }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useRef(null);
  const isEdit = !!id;

  const [clients, setClients] = useState([]);
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '' });
  const [clientSearch, setClientSearch] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [featureSuggestions, setFeatureSuggestions] = useState([]);
  const [filteredFeatures, setFilteredFeatures] = useState([]);
  const [showRenewDialog, setShowRenewDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [hostingHistory, setHostingHistory] = useState([]);
  const [renewData, setRenewData] = useState({ duration_months: 12, notes: '' });
  const [upgradeData, setUpgradeData] = useState({ new_package: '', new_price: 0, notes: '' });

  const defaultFeatures = [
    'Đa ngôn ngữ', 'Google Dịch', 'Giỏ hàng', 'Đăng ký / Đăng nhập',
    'Thanh toán online', 'Chat trực tuyến', 'SEO', 'Blog / Tin tức',
    'Form liên hệ', 'Bản đồ Google Maps', 'Responsive', 'Tìm kiếm',
    'Bộ lọc sản phẩm', 'Đánh giá / Bình luận', 'Newsletter', 'Slider / Banner',
    'Quản lý đơn hàng', 'Tích hợp MXH', 'Dashboard Admin', 'Upload file',
  ];

  const [form, setForm] = useState({
    client_id: null,
    name: '',
    project_type: 'new',
    features: [],
    description: '',
    design_link: '',
    demo_link: '',
    production_link: '',
    domain_name: '',
    domain_provider: '',
    domain_expiry_date: null,
    hosting_provider: '',
    hosting_package: '',
    hosting_details: '',
    ftp_host: '',
    ftp_username: '',
    ftp_password: '',
    ftp_port: '21',
    web_config: '',
    ssl_provider: '',
    ssl_expiry_date: null,
    ssl_details: '',
    demo_upload_date: null,
    hosting_upload_date: null,
    using_own_hosting: false,
    own_hosting_package: '',
    own_hosting_price: 0,
    own_hosting_start_date: null,
    own_hosting_duration_months: null,
    own_hosting_expiry_date: null,
    project_price: 0,
    deposit_amount: 0,
    deposit_date: null,
    payment_completion_date: null,
    payment_due_date: null,
    status: 'pending',
    payment_status: 'unpaid',
  });

  useEffect(() => {
    clientApi.getAllList().then(res => setClients(res.data)).catch(console.error);
    projectApi.getAllFeatures().then(res => {
      const apiFeatures = res.data || [];
      const merged = [...new Set([...defaultFeatures, ...apiFeatures])];
      setFeatureSuggestions(merged);
    }).catch(() => setFeatureSuggestions(defaultFeatures));
    if (isEdit) {
      loadProject();
      hostingApi.getHistory(id).then(res => setHostingHistory(res.data)).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadProject = async () => {
    try {
      const res = await projectApi.getById(id);
      const p = res.data;

      const dateFields = ['domain_expiry_date', 'ssl_expiry_date', 'demo_upload_date',
        'hosting_upload_date', 'own_hosting_start_date', 'own_hosting_expiry_date',
        'deposit_date', 'payment_completion_date', 'payment_due_date'];

      const textFields = ['name', 'description', 'design_link', 'demo_link', 'production_link',
        'domain_name', 'domain_provider', 'hosting_provider', 'hosting_package', 'hosting_details',
        'ftp_host', 'ftp_username', 'ftp_password', 'ftp_port', 'web_config',
        'ssl_provider', 'ssl_details'];

      const formData = {
        client_id: p.client_id || null,
        project_type: p.project_type || 'new',
        features: p.features || [],
        status: p.status || 'pending',
        payment_status: p.payment_status || 'unpaid',
        using_own_hosting: !!p.using_own_hosting,
        own_hosting_package: p.own_hosting_package || '',
        own_hosting_price: Number(p.own_hosting_price) || 0,
        project_price: Number(p.project_price) || 0,
        deposit_amount: Number(p.deposit_amount) || 0,
        remaining_amount: Number(p.remaining_amount) || 0,
        own_hosting_duration_months: p.own_hosting_duration_months || null,
      };

      textFields.forEach(field => {
        formData[field] = p[field] || '';
      });

      dateFields.forEach(field => {
        formData[field] = p[field] ? new Date(p[field]) : null;
      });

      setForm(formData);
      setClientSearch(p.client?.name || '');
      setExistingImages(p.images || []);
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải dự án' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.client_id || !form.name) {
      toast.current?.show({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng điền khách hàng và tên dự án' });
      return;
    }

    setSaving(true);
    try {
      const data = { ...form };
      const dateFields = ['domain_expiry_date', 'ssl_expiry_date', 'demo_upload_date',
        'hosting_upload_date', 'own_hosting_start_date', 'own_hosting_expiry_date',
        'deposit_date', 'payment_completion_date', 'payment_due_date'];
      dateFields.forEach(field => {
        if (data[field] instanceof Date) {
          data[field] = data[field].toISOString().split('T')[0];
        }
      });

      data.using_own_hosting = data.using_own_hosting ? 1 : 0;
      if (images.length > 0) data.images = images;

      if (isEdit) {
        await projectApi.update(id, data);
        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật dự án' });
      } else {
        const res = await projectApi.create(data);
        toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Đã tạo dự án mới' });
        navigate(`/projects/${res.data.id}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra';
      toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateClient = async () => {
    if (!newClient.name) return;
    try {
      const res = await clientApi.create(newClient);
      setClients(prev => [...prev, res.data]);
      setForm(prev => ({ ...prev, client_id: res.data.id }));
      setShowClientDialog(false);
      setNewClient({ name: '', email: '', phone: '' });
      toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Đã tạo khách hàng mới' });
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tạo khách hàng' });
    }
  };

  const searchClients = (event) => {
    const query = event.query.trim().toLowerCase();
    const results = clients.filter(c => c.name.toLowerCase().includes(query));
    setFilteredClients(results);
  };

  const handleClientSelect = (e) => {
    if (e.value && typeof e.value === 'object' && e.value.id) {
      updateField('client_id', e.value.id);
      setClientSearch(e.value.name);
    }
  };

  const handleQuickAddClient = async () => {
    const name = clientSearch.trim();
    if (!name) return;
    try {
      const res = await clientApi.create({ name });
      setClients(prev => [...prev, res.data]);
      setForm(prev => ({ ...prev, client_id: res.data.id }));
      setClientSearch(res.data.name);
      toast.current?.show({ severity: 'success', summary: 'Thành công', detail: `Đã thêm khách hàng "${name}"` });
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tạo khách hàng' });
    }
  };

  const clientNotFound = clientSearch.trim() && !clients.some(c => c.name.toLowerCase() === clientSearch.trim().toLowerCase());

  const handleDeleteImage = async (imageId) => {
    try {
      await projectApi.deleteImage(imageId);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa hình ảnh' });
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xóa hình ảnh' });
    }
  };

  const updateField = (field, value) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'project_price' || field === 'deposit_amount') {
        updated.remaining_amount = (updated.project_price || 0) - (updated.deposit_amount || 0);
      }
      return updated;
    });
  };

  const hostingPackageOptions = [
    { label: 'Cơ bản — 1GB SSD, 10GB BW', value: 'basic', price: 500000 },
    { label: 'Tiêu chuẩn — 5GB SSD, 50GB BW', value: 'standard', price: 1000000 },
    { label: 'Nâng cao — 20GB SSD, Unlimited BW', value: 'advanced', price: 2000000 },
    { label: 'VPS — 4GB RAM, 80GB SSD', value: 'vps', price: 3000000 },
  ];

  const handleHostingPackageChange = (packageValue) => {
    const pkg = hostingPackageOptions.find(p => p.value === packageValue);
    setForm(prev => ({
      ...prev,
      own_hosting_package: packageValue,
      own_hosting_price: pkg ? pkg.price : 0,
    }));
  };

  const durationOptions = [
    ...Array.from({ length: 11 }, (_, i) => ({ label: `${i + 1} tháng`, value: i + 1 })),
    { label: '1 năm', value: 12 },
    { label: '2 năm', value: 24 },
    { label: '3 năm', value: 36 },
  ];

  const calcExpiryDate = (startDate, months) => {
    if (!startDate || !months) return null;
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + months);
    return d;
  };

  const handleStartDateChange = (date) => {
    setForm(prev => {
      const expiry = calcExpiryDate(date, prev.own_hosting_duration_months);
      return { ...prev, own_hosting_start_date: date, own_hosting_expiry_date: expiry };
    });
  };

  const handleDurationChange = (months) => {
    setForm(prev => {
      const expiry = calcExpiryDate(prev.own_hosting_start_date, months);
      return { ...prev, own_hosting_duration_months: months, own_hosting_expiry_date: expiry };
    });
  };

  const handleRenew = async () => {
    if (!renewData.duration_months) return;
    try {
      const res = await hostingApi.renew(id, renewData);
      const p = res.data.project;
      setForm(prev => ({
        ...prev,
        own_hosting_expiry_date: p.own_hosting_expiry_date ? new Date(p.own_hosting_expiry_date) : null,
        own_hosting_duration_months: p.own_hosting_duration_months,
      }));
      setHostingHistory(p.hosting_histories || []);
      setShowRenewDialog(false);
      setRenewData({ duration_months: 12, notes: '' });
      toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Đã gia hạn hosting' });
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể gia hạn' });
    }
  };

  const handleUpgrade = async () => {
    if (!upgradeData.new_package) return;
    try {
      const res = await hostingApi.upgrade(id, upgradeData);
      const p = res.data.project;
      setForm(prev => ({
        ...prev,
        own_hosting_package: p.own_hosting_package,
        own_hosting_price: Number(p.own_hosting_price) || 0,
      }));
      setHostingHistory(p.hosting_histories || []);
      setShowUpgradeDialog(false);
      setUpgradeData({ new_package: '', new_price: 0, notes: '' });
      toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Đã nâng cấp gói hosting' });
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể nâng cấp' });
    }
  };

  const actionLabels = { initial: 'Đăng ký ban đầu', renew: 'Gia hạn', upgrade: 'Nâng cấp gói' };
  const packageLabels = { basic: 'Cơ bản', standard: 'Tiêu chuẩn', advanced: 'Nâng cao', vps: 'VPS' };

  const projectTypeOptions = [
    { label: 'Làm mới', value: 'new' },
    { label: 'Nâng cấp', value: 'upgrade' },
    { label: 'Up source', value: 'upload_source' },
  ];

  const searchFeatures = (event) => {
    const query = event.query.trim().toLowerCase();
    const selectedSet = new Set(form.features);
    let results = featureSuggestions.filter(
      f => f.toLowerCase().includes(query) && !selectedSet.has(f)
    );
    if (query && !results.some(f => f.toLowerCase() === query)) {
      results = [...results, event.query.trim()];
    }
    setFilteredFeatures(results);
  };

  const statusOptions = [
    { label: 'Chờ xử lý', value: 'pending' },
    { label: 'Đang thực hiện', value: 'in_progress' },
    { label: 'Demo', value: 'demo' },
    { label: 'Production', value: 'production' },
    { label: 'Hoàn thành', value: 'completed' },
    { label: 'Đã hủy', value: 'cancelled' },
  ];

  const paymentOptions = [
    { label: 'Chưa thanh toán', value: 'unpaid' },
    { label: 'Đã cọc', value: 'deposit_paid' },
    { label: 'Đã thanh toán', value: 'fully_paid' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <Toast ref={toast} />

      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Chỉnh sửa Dự án' : 'Thêm Dự án Mới'}
          </h2>
          <p className="text-gray-500 mt-1">Điền thông tin chi tiết dự án</p>
        </div>
      </div>

      <form id="projectForm" onSubmit={handleSubmit} className="space-y-4 pb-20">
        {/* Basic Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <SectionTitle>Thông tin cơ bản</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Khách hàng" required>
              <div className="flex gap-2">
                <AutoComplete
                  value={clientSearch}
                  suggestions={filteredClients}
                  completeMethod={searchClients}
                  field="name"
                  onChange={(e) => {
                    if (typeof e.value === 'string') {
                      setClientSearch(e.value);
                    } else if (e.value && e.value.name) {
                      setClientSearch(e.value.name);
                    }
                  }}
                  onSelect={handleClientSelect}
                  placeholder="Gõ tên khách hàng..."
                  className="flex-1"
                  inputClassName="w-full"
                />
                {clientNotFound ? (
                  <button
                    type="button"
                    onClick={handleQuickAddClient}
                    className="px-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-xs font-medium whitespace-nowrap"
                  >
                    <Plus size={16} className="inline mr-1" />Thêm
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowClientDialog(true)}
                    className="px-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Thêm khách hàng mới"
                  >
                    <Plus size={18} />
                  </button>
                )}
              </div>
              {form.client_id && (
                <p className="text-xs text-green-600 mt-1">
                  Đã chọn: {clients.find(c => c.id === form.client_id)?.name}
                </p>
              )}
            </Field>
            <Field label="Tên dự án" required>
              <InputText value={form.name} onChange={(e) => updateField('name', e.target.value)} className="w-full" />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Loại dự án">
              <Dropdown value={form.project_type} options={projectTypeOptions} onChange={(e) => updateField('project_type', e.value)} className="w-full" />
            </Field>
            <Field label="Tính năng website">
              <AutoComplete
                value={form.features}
                suggestions={filteredFeatures}
                completeMethod={searchFeatures}
                onChange={(e) => updateField('features', e.value)}
                multiple
                className="w-full"
                placeholder="Nhập và chọn tính năng..."
              />
            </Field>
          </div>
          <Field label="Mô tả">
            <InputTextarea value={form.description} onChange={(e) => updateField('description', e.target.value)} className="w-full" rows={3} autoResize />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Link design">
              <InputText value={form.design_link} onChange={(e) => updateField('design_link', e.target.value)} className="w-full" placeholder="https://..." />
            </Field>
            <Field label="Link demo">
              <InputText value={form.demo_link} onChange={(e) => updateField('demo_link', e.target.value)} className="w-full" placeholder="https://..." />
            </Field>
            <Field label="Link production">
              <InputText value={form.production_link} onChange={(e) => updateField('production_link', e.target.value)} className="w-full" placeholder="https://..." />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Trạng thái">
              <Dropdown value={form.status} options={statusOptions} onChange={(e) => updateField('status', e.value)} className="w-full" />
            </Field>
            <Field label="Trạng thái thanh toán">
              <Dropdown value={form.payment_status} options={paymentOptions} onChange={(e) => updateField('payment_status', e.value)} className="w-full" />
            </Field>
          </div>
        </div>

        {/* Domain & Hosting */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <SectionTitle>Tên miền & Hosting</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Tên miền">
              <InputText value={form.domain_name} onChange={(e) => updateField('domain_name', e.target.value)} className="w-full" />
            </Field>
            <Field label="Nhà cung cấp tên miền">
              <InputText value={form.domain_provider} onChange={(e) => updateField('domain_provider', e.target.value)} className="w-full" />
            </Field>
            <Field label="Ngày hết hạn tên miền">
              <Calendar value={form.domain_expiry_date} onChange={(e) => updateField('domain_expiry_date', e.value)} className="w-full" dateFormat="dd/mm/yy" showIcon />
            </Field>
          </div>

          {!form.using_own_hosting && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Nhà cung cấp hosting">
                <InputText value={form.hosting_provider} onChange={(e) => updateField('hosting_provider', e.target.value)} className="w-full" />
              </Field>
              <Field label="Gói hosting">
                <InputText value={form.hosting_package} onChange={(e) => updateField('hosting_package', e.target.value)} className="w-full" />
              </Field>
              <Field label="Chi tiết hosting">
                <InputText value={form.hosting_details} onChange={(e) => updateField('hosting_details', e.target.value)} className="w-full" />
              </Field>
            </div>
          )}

          <div className="flex items-center gap-3 mt-4 mb-4 p-3 bg-blue-50 rounded-lg">
            <InputSwitch checked={form.using_own_hosting} onChange={(e) => updateField('using_own_hosting', e.value)} />
            <span className="text-sm font-medium text-blue-800">Sử dụng hosting/tên miền của tôi</span>
          </div>

          {form.using_own_hosting && (
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50/50 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Gói dung lượng hosting">
                  <Dropdown
                    value={form.own_hosting_package}
                    options={hostingPackageOptions}
                    onChange={(e) => handleHostingPackageChange(e.value)}
                    placeholder="Chọn gói hosting..."
                    className="w-full"
                  />
                </Field>
                <Field label="Giá hosting/năm">
                  <InputNumber
                    value={form.own_hosting_price}
                    onValueChange={(e) => updateField('own_hosting_price', e.value)}
                    className="w-full"
                    mode="currency" currency="VND" locale="vi-VN" minFractionDigits={0}
                  />
                </Field>
              </div>
              {form.own_hosting_package && (
                <div className="flex items-center justify-between px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-sm text-green-700">
                    Gói <strong>{packageLabels[form.own_hosting_package] || form.own_hosting_package}</strong>
                    {' — '}
                    <strong className="text-green-800">{formatCurrency(form.own_hosting_price)}</strong>/năm
                  </span>
                  {isEdit && (
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setShowRenewDialog(true)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <RefreshCw size={14} /> Gia hạn
                      </button>
                      <button type="button" onClick={() => { setUpgradeData({ new_package: '', new_price: 0, notes: '' }); setShowUpgradeDialog(true); }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        <ArrowUpCircle size={14} /> Nâng cấp
                      </button>
                    </div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Ngày bắt đầu sử dụng">
                  <Calendar value={form.own_hosting_start_date} onChange={(e) => handleStartDateChange(e.value)} className="w-full" dateFormat="dd/mm/yy" showIcon />
                </Field>
                <Field label="Thời hạn sử dụng">
                  <Dropdown
                    value={form.own_hosting_duration_months}
                    options={durationOptions}
                    onChange={(e) => handleDurationChange(e.value)}
                    placeholder="Chọn thời hạn..."
                    className="w-full"
                  />
                </Field>
                <Field label="Ngày hết hạn (tự động)">
                  <Calendar value={form.own_hosting_expiry_date} onChange={(e) => updateField('own_hosting_expiry_date', e.value)} className="w-full" dateFormat="dd/mm/yy" showIcon disabled />
                </Field>
              </div>

              {isEdit && hostingHistory.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <History size={16} className="text-gray-500" />
                    <span className="text-sm font-semibold text-gray-700">Lịch sử hosting</span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {hostingHistory.map((h) => (
                      <div key={h.id} className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${
                        h.action === 'initial' ? 'bg-gray-50 border border-gray-200' :
                        h.action === 'renew' ? 'bg-blue-50 border border-blue-200' :
                        'bg-purple-50 border border-purple-200'
                      }`}>
                        <div>
                          <span className={`font-semibold ${
                            h.action === 'initial' ? 'text-gray-700' : h.action === 'renew' ? 'text-blue-700' : 'text-purple-700'
                          }`}>
                            {actionLabels[h.action] || h.action}
                          </span>
                          {h.action === 'upgrade' && (
                            <span className="text-gray-500 ml-1">
                              {packageLabels[h.package_from] || h.package_from} → {packageLabels[h.package_to] || h.package_to}
                            </span>
                          )}
                          {h.action === 'renew' && <span className="text-gray-500 ml-1">+{h.duration_months} tháng</span>}
                          {h.notes && <span className="text-gray-400 ml-2">({h.notes})</span>}
                        </div>
                        <div className="text-right text-gray-500">
                          <span>{formatCurrency(h.price)}</span>
                          <span className="ml-2">{formatDate(h.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FTP & Config */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <SectionTitle>FTP & Cấu hình</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Field label="FTP Host">
              <InputText value={form.ftp_host} onChange={(e) => updateField('ftp_host', e.target.value)} className="w-full" />
            </Field>
            <Field label="FTP Username">
              <InputText value={form.ftp_username} onChange={(e) => updateField('ftp_username', e.target.value)} className="w-full" />
            </Field>
            <Field label="FTP Password">
              <InputText value={form.ftp_password} onChange={(e) => updateField('ftp_password', e.target.value)} className="w-full" type="password" />
            </Field>
            <Field label="FTP Port">
              <InputText value={form.ftp_port} onChange={(e) => updateField('ftp_port', e.target.value)} className="w-full" />
            </Field>
          </div>
          <Field label="Cấu hình web">
            <InputTextarea value={form.web_config} onChange={(e) => updateField('web_config', e.target.value)} className="w-full" rows={3} autoResize />
          </Field>
        </div>

        {/* SSL */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <SectionTitle>SSL</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Nhà cung cấp SSL">
              <InputText value={form.ssl_provider} onChange={(e) => updateField('ssl_provider', e.target.value)} className="w-full" />
            </Field>
            <Field label="Ngày hết hạn SSL">
              <Calendar value={form.ssl_expiry_date} onChange={(e) => updateField('ssl_expiry_date', e.value)} className="w-full" dateFormat="dd/mm/yy" showIcon />
            </Field>
            <Field label="Chi tiết SSL">
              <InputText value={form.ssl_details} onChange={(e) => updateField('ssl_details', e.target.value)} className="w-full" />
            </Field>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <SectionTitle>Ngày quan trọng</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Ngày up demo">
              <Calendar value={form.demo_upload_date} onChange={(e) => updateField('demo_upload_date', e.value)} className="w-full" dateFormat="dd/mm/yy" showIcon />
            </Field>
            <Field label="Ngày up hosting">
              <Calendar value={form.hosting_upload_date} onChange={(e) => updateField('hosting_upload_date', e.value)} className="w-full" dateFormat="dd/mm/yy" showIcon />
            </Field>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <SectionTitle>Thanh toán</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Giá dự án">
              <InputNumber value={form.project_price} onValueChange={(e) => updateField('project_price', e.value)}
                className="w-full" mode="currency" currency="VND" locale="vi-VN" minFractionDigits={0} />
            </Field>
            <Field label="Số tiền cọc">
              <InputNumber value={form.deposit_amount} onValueChange={(e) => updateField('deposit_amount', e.value)}
                className="w-full" mode="currency" currency="VND" locale="vi-VN" minFractionDigits={0} />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Ngày cọc">
              <Calendar value={form.deposit_date} onChange={(e) => updateField('deposit_date', e.value)} className="w-full" dateFormat="dd/mm/yy" showIcon />
            </Field>
            <Field label="Còn lại">
              <InputNumber value={(form.project_price || 0) - (form.deposit_amount || 0)}
                className="w-full" mode="currency" currency="VND" locale="vi-VN" minFractionDigits={0} disabled />
            </Field>
            <Field label="Ngày hẹn thanh toán">
              <Calendar value={form.payment_due_date} onChange={(e) => updateField('payment_due_date', e.value)} className="w-full" dateFormat="dd/mm/yy" showIcon />
            </Field>
          </div>
          <Field label="Ngày hoàn tất thanh toán">
            <Calendar value={form.payment_completion_date} onChange={(e) => updateField('payment_completion_date', e.value)} className="w-full" dateFormat="dd/mm/yy" showIcon />
          </Field>
        </div>

        {/* Images */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <SectionTitle>Hình ảnh</SectionTitle>

          {existingImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {existingImages.map(img => (
                <div key={img.id} className="relative group">
                  <img
                    src={`${STORAGE_URL}/${img.image_path}`}
                    alt={img.original_name}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img.id)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImages(Array.from(e.target.files))}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
        </div>

      </form>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <div className="max-w-5xl mx-auto flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="projectForm"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo dự án')}
          </button>
        </div>
      </div>

      {/* New Client Dialog */}
      <Dialog
        visible={showClientDialog}
        onHide={() => setShowClientDialog(false)}
        header="Thêm khách hàng mới"
        style={{ width: '400px' }}
      >
        <div className="space-y-4">
          <Field label="Tên khách hàng" required>
            <InputText value={newClient.name} onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))} className="w-full" />
          </Field>
          <Field label="Email">
            <InputText value={newClient.email} onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))} className="w-full" />
          </Field>
          <Field label="Số điện thoại">
            <InputText value={newClient.phone} onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))} className="w-full" />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowClientDialog(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Hủy</button>
            <button type="button" onClick={handleCreateClient} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">Tạo</button>
          </div>
        </div>
      </Dialog>

      {/* Renew Hosting Dialog */}
      <Dialog
        visible={showRenewDialog}
        onHide={() => setShowRenewDialog(false)}
        header="Gia hạn Hosting"
        style={{ width: '450px' }}
      >
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg text-sm">
            <p className="text-blue-700">Gói hiện tại: <strong>{packageLabels[form.own_hosting_package] || form.own_hosting_package}</strong></p>
            <p className="text-blue-700">Hết hạn: <strong>{form.own_hosting_expiry_date ? formatDate(form.own_hosting_expiry_date) : '—'}</strong></p>
          </div>
          <Field label="Thời gian gia hạn">
            <Dropdown
              value={renewData.duration_months}
              options={durationOptions}
              onChange={(e) => setRenewData(prev => ({ ...prev, duration_months: e.value }))}
              className="w-full"
            />
          </Field>
          <Field label="Ghi chú">
            <InputText value={renewData.notes} onChange={(e) => setRenewData(prev => ({ ...prev, notes: e.target.value }))} className="w-full" placeholder="VD: Gia hạn lần 2..." />
          </Field>
          {renewData.duration_months && form.own_hosting_expiry_date && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              Ngày hết hạn mới: <strong>{formatDate(calcExpiryDate(form.own_hosting_expiry_date, renewData.duration_months))}</strong>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowRenewDialog(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Hủy</button>
            <button type="button" onClick={handleRenew} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Xác nhận gia hạn</button>
          </div>
        </div>
      </Dialog>

      {/* Upgrade Hosting Dialog */}
      <Dialog
        visible={showUpgradeDialog}
        onHide={() => setShowUpgradeDialog(false)}
        header="Nâng cấp gói Hosting"
        style={{ width: '450px' }}
      >
        <div className="space-y-4">
          <div className="p-3 bg-purple-50 rounded-lg text-sm">
            <p className="text-purple-700">Gói hiện tại: <strong>{packageLabels[form.own_hosting_package] || form.own_hosting_package}</strong> — {formatCurrency(form.own_hosting_price)}/năm</p>
          </div>
          <Field label="Nâng cấp lên gói">
            <Dropdown
              value={upgradeData.new_package}
              options={hostingPackageOptions.filter(p => p.value !== form.own_hosting_package)}
              onChange={(e) => {
                const pkg = hostingPackageOptions.find(p => p.value === e.value);
                setUpgradeData(prev => ({ ...prev, new_package: e.value, new_price: pkg ? pkg.price : 0 }));
              }}
              placeholder="Chọn gói mới..."
              className="w-full"
            />
          </Field>
          <Field label="Giá gói mới">
            <InputNumber value={upgradeData.new_price} onValueChange={(e) => setUpgradeData(prev => ({ ...prev, new_price: e.value }))}
              className="w-full" mode="currency" currency="VND" locale="vi-VN" minFractionDigits={0} />
          </Field>
          <Field label="Ghi chú">
            <InputText value={upgradeData.notes} onChange={(e) => setUpgradeData(prev => ({ ...prev, notes: e.target.value }))} className="w-full" placeholder="VD: Khách yêu cầu thêm dung lượng..." />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowUpgradeDialog(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Hủy</button>
            <button type="button" onClick={handleUpgrade} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm">Xác nhận nâng cấp</button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
