import React, { useState, useEffect, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { Save, Upload, Settings, Globe, Phone, Mail, MapPin, Facebook, MessageCircle } from 'lucide-react';
import { settingApi, STORAGE_URL } from '../services/api';

const SETTING_KEYS = [
  { key: 'site_name', label: 'Tên website', icon: Globe, group: 'header' },
  { key: 'site_slogan', label: 'Slogan', icon: null, group: 'header' },
  { key: 'header_phone', label: 'Số điện thoại (Header)', icon: Phone, group: 'header' },
  { key: 'header_email', label: 'Email (Header)', icon: Mail, group: 'header' },
  { key: 'contact_phone', label: 'Số điện thoại tư vấn', icon: Phone, group: 'contact' },
  { key: 'contact_phone_2', label: 'Số điện thoại 2', icon: Phone, group: 'contact' },
  { key: 'contact_email', label: 'Email tư vấn', icon: Mail, group: 'contact' },
  { key: 'contact_address', label: 'Địa chỉ', icon: MapPin, group: 'contact' },
  { key: 'contact_facebook', label: 'Facebook', icon: Facebook, group: 'contact' },
  { key: 'contact_zalo', label: 'Zalo', icon: MessageCircle, group: 'contact' },
  { key: 'footer_text', label: 'Nội dung Footer', icon: null, group: 'footer', type: 'textarea' },
  { key: 'footer_copyright', label: 'Copyright', icon: null, group: 'footer' },
  { key: 'sidebar_name', label: 'Tên hiển thị Sidebar', icon: null, group: 'sidebar' },
  { key: 'sidebar_phone', label: 'SĐT Sidebar', icon: Phone, group: 'sidebar' },
  { key: 'sidebar_email', label: 'Email Sidebar', icon: Mail, group: 'sidebar' },
];

const groups = [
  { id: 'header', title: 'Header & Top Bar', icon: Globe, color: 'from-blue-500 to-cyan-500' },
  { id: 'sidebar', title: 'Sidebar', icon: Settings, color: 'from-purple-500 to-pink-500' },
  { id: 'contact', title: 'Thông tin tư vấn & Liên hệ', icon: Phone, color: 'from-green-500 to-emerald-500' },
  { id: 'footer', title: 'Footer', icon: MapPin, color: 'from-orange-500 to-red-500' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useRef(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await settingApi.getAll();
      setSettings(res.data || {});
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải cài đặt' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        key, value: value || '', type: 'text',
      }));
      await settingApi.update(settingsArray);
      toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Đã lưu cài đặt' });
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể lưu cài đặt' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await settingApi.uploadLogo(file);
      setSettings(prev => ({ ...prev, site_logo: res.data.path }));
      toast.current?.show({ severity: 'success', summary: 'Thành công', detail: 'Đã upload logo' });
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể upload logo' });
    }
  };

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

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Settings className="text-gray-400" size={28} />
            Cài đặt chung
          </h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý thông tin Header, Sidebar, Footer và liên hệ</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>

      {/* Logo Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Logo</h2>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
            {settings.site_logo ? (
              <img src={`${STORAGE_URL}/${settings.site_logo}`} alt="Logo" className="w-full h-full object-contain p-2" />
            ) : (
              <span className="text-2xl font-black bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Cris</span>
            )}
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Upload size={16} />
              Tải logo lên
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
            <p className="text-xs text-gray-400 mt-2">PNG, JPG, SVG - Tối đa 2MB</p>
          </div>
        </div>
      </div>

      {/* Setting Groups */}
      {groups.map(group => {
        const GroupIcon = group.icon;
        const groupSettings = SETTING_KEYS.filter(s => s.group === group.id);

        return (
          <div key={group.id} className="bg-white rounded-2xl border border-gray-200 mb-6 shadow-sm overflow-hidden">
            <div className={`bg-gradient-to-r ${group.color} px-6 py-4`}>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <GroupIcon size={20} />
                {group.title}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {groupSettings.map(setting => {
                const Icon = setting.icon;
                return (
                  <div key={setting.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                      {Icon && <Icon size={14} className="text-gray-400" />}
                      {setting.label}
                    </label>
                    {setting.type === 'textarea' ? (
                      <InputTextarea
                        value={settings[setting.key] || ''}
                        onChange={(e) => handleChange(setting.key, e.target.value)}
                        rows={3}
                        className="w-full"
                        placeholder={`Nhập ${setting.label.toLowerCase()}...`}
                      />
                    ) : (
                      <InputText
                        value={settings[setting.key] || ''}
                        onChange={(e) => handleChange(setting.key, e.target.value)}
                        className="w-full"
                        placeholder={`Nhập ${setting.label.toLowerCase()}...`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
