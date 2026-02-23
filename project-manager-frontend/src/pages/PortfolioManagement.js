import React, { useState, useEffect, useRef, useCallback } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Checkbox } from 'primereact/checkbox';
import {
  Briefcase, Plus, Pencil, Trash2, Save, Image as ImageIcon,
  FolderKanban, Search, Check, ExternalLink, Eye, EyeOff, Layers
} from 'lucide-react';
import { portfolioApi, projectApi, STORAGE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PortfolioManagement() {
  const [categories, setCategories] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);

  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', icon: '', sort_order: 0 });
  const [editCategoryId, setEditCategoryId] = useState(null);

  const [showAddProjectDialog, setShowAddProjectDialog] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [projectSearch, setProjectSearch] = useState('');

  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [previewProject, setPreviewProject] = useState(null);

  const [saving, setSaving] = useState(false);
  const toast = useRef(null);
  const { isAdmin, isEditor } = useAuth();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const [catRes, projRes] = await Promise.all([
        portfolioApi.getCategories(),
        projectApi.getAll({ per_page: 999 }),
      ]);
      setCategories(catRes.data);
      setProjects(projRes.data.data || []);
      if (catRes.data.length > 0 && !activeCategory) {
        setActiveCategory(catRes.data[0].id);
      }
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải dữ liệu' });
    } finally {
      setLoading(false);
    }
  };

  const loadPortfolios = useCallback(async () => {
    if (!activeCategory) return;
    try {
      const res = await portfolioApi.getAll({ category_id: activeCategory });
      setPortfolios(res.data);
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải portfolio' });
    }
  }, [activeCategory]);

  useEffect(() => {
    loadPortfolios();
  }, [loadPortfolios]);

  // Category CRUD
  const openNewCategory = () => {
    setCategoryForm({ name: '', description: '', icon: '', sort_order: 0 });
    setEditCategoryId(null);
    setShowCategoryDialog(true);
  };

  const openEditCategory = (cat) => {
    setCategoryForm({
      name: cat.name,
      description: cat.description || '',
      icon: cat.icon || '',
      sort_order: cat.sort_order || 0,
    });
    setEditCategoryId(cat.id);
    setShowCategoryDialog(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name) return;
    setSaving(true);
    try {
      if (editCategoryId) {
        await portfolioApi.updateCategory(editCategoryId, categoryForm);
      } else {
        const res = await portfolioApi.createCategory(categoryForm);
        setActiveCategory(res.data.id);
      }
      await loadData();
      setShowCategoryDialog(false);
      toast.current?.show({ severity: 'success', summary: 'Thành công' });
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Lỗi' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = (cat) => {
    confirmDialog({
      message: `Xóa hạng mục "${cat.name}" và tất cả dự án trong đó?`,
      header: 'Xác nhận xóa',
      acceptLabel: 'Xóa',
      rejectLabel: 'Hủy',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await portfolioApi.deleteCategory(cat.id);
          if (activeCategory === cat.id) setActiveCategory(null);
          await loadData();
          toast.current?.show({ severity: 'success', summary: 'Đã xóa' });
        } catch {
          toast.current?.show({ severity: 'error', summary: 'Lỗi' });
        }
      },
    });
  };

  // Add projects to portfolio
  const openAddProjects = () => {
    setSelectedProjects([]);
    setProjectSearch('');
    setShowAddProjectDialog(true);
  };

  const handleAddProjects = async () => {
    if (selectedProjects.length === 0 || !activeCategory) return;
    setSaving(true);
    try {
      await portfolioApi.batchAdd({
        portfolio_category_id: activeCategory,
        project_ids: selectedProjects,
      });
      await loadPortfolios();
      setShowAddProjectDialog(false);
      toast.current?.show({
        severity: 'success',
        summary: 'Thành công',
        detail: `Đã thêm ${selectedProjects.length} dự án`,
      });
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Lỗi' });
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePortfolio = (portfolio) => {
    confirmDialog({
      message: `Gỡ dự án "${portfolio.project?.name || portfolio.display_name}" khỏi portfolio?`,
      header: 'Xác nhận gỡ',
      acceptLabel: 'Gỡ',
      rejectLabel: 'Hủy',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await portfolioApi.delete(portfolio.id);
          await loadPortfolios();
          toast.current?.show({ severity: 'success', summary: 'Đã gỡ' });
        } catch {
          toast.current?.show({ severity: 'error', summary: 'Lỗi' });
        }
      },
    });
  };

  const handleToggleActive = async (portfolio) => {
    try {
      await portfolioApi.update(portfolio.id, { is_active: !portfolio.is_active });
      await loadPortfolios();
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Lỗi' });
    }
  };

  const openPreview = (portfolio) => {
    const images = portfolio.project?.images || [];
    setPreviewImages(images);
    setPreviewProject(portfolio.project);
    setShowImagePreview(true);
  };

  const getProjectImage = (portfolio) => {
    if (portfolio.thumbnail) return `${STORAGE_URL}/${portfolio.thumbnail}`;
    const images = portfolio.project?.images || [];
    if (images.length > 0) return `${STORAGE_URL}/${images[0].image_path}`;
    return null;
  };

  const currentProjectIds = portfolios.map(p => p.project_id);
  const availableProjects = projects.filter(p =>
    !currentProjectIds.includes(p.id) &&
    (projectSearch === '' ||
      p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.client?.name?.toLowerCase().includes(projectSearch.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Briefcase className="text-gray-400" size={28} />
            Quản lý Portfolio
          </h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý các dự án đẹp theo hạng mục để showcase</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left: Categories */}
        <div className="w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Layers size={18} />
                Hạng mục
              </h3>
              {isEditor && (
                <button
                  onClick={openNewCategory}
                  className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                  title="Thêm hạng mục"
                >
                  <Plus size={18} />
                </button>
              )}
            </div>

            <div className="p-2">
              {categories.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Chưa có hạng mục</p>
              ) : (
                categories.map(cat => (
                  <div
                    key={cat.id}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all mb-1 ${
                      activeCategory === cat.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    <FolderKanban size={18} className={activeCategory === cat.id ? 'text-blue-500' : 'text-gray-400'} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{cat.name}</p>
                      <p className="text-xs text-gray-400">{cat.portfolios_count || 0} dự án</p>
                    </div>
                    {isEditor && (
                      <div className="hidden group-hover:flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEditCategory(cat); }}
                          className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700"
                        >
                          <Pencil size={13} />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat); }}
                            className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Portfolio Items */}
        <div className="flex-1">
          {!activeCategory ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <FolderKanban size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Chọn hoặc tạo hạng mục để quản lý portfolio</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  {categories.find(c => c.id === activeCategory)?.name}
                  <span className="text-sm text-gray-400 font-normal ml-2">({portfolios.length} dự án)</span>
                </h2>
                {isEditor && (
                  <button
                    onClick={openAddProjects}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
                  >
                    <Plus size={16} />
                    Thêm dự án
                  </button>
                )}
              </div>

              {portfolios.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                  <ImageIcon size={48} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Chưa có dự án nào trong hạng mục này</p>
                  <button
                    onClick={openAddProjects}
                    className="mt-3 text-blue-600 text-sm font-medium hover:underline"
                  >
                    + Chọn dự án từ danh sách
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {portfolios.map(portfolio => {
                    const imgUrl = getProjectImage(portfolio);
                    const project = portfolio.project;
                    const hasLink = project?.production_link || project?.domain_name;

                    return (
                      <div
                        key={portfolio.id}
                        className={`bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all group ${
                          !portfolio.is_active ? 'opacity-50' : ''
                        }`}
                      >
                        {/* Image */}
                        <div
                          className="relative aspect-video bg-gray-100 cursor-pointer overflow-hidden"
                          onClick={() => openPreview(portfolio)}
                        >
                          {imgUrl ? (
                            <img src={imgUrl} alt={project?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon size={40} className="text-gray-300" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                              {hasLink && (
                                <a
                                  href={project.production_link || `http://${project.domain_name}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="bg-white/90 text-gray-800 p-2 rounded-full hover:bg-white transition-colors"
                                >
                                  <ExternalLink size={18} />
                                </a>
                              )}
                              <button className="bg-white/90 text-gray-800 p-2 rounded-full hover:bg-white transition-colors">
                                <Search size={18} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 text-sm truncate">
                            {portfolio.display_name || project?.name}
                          </h4>
                          {project?.client?.name && (
                            <p className="text-xs text-gray-400 mt-0.5">{project.client.name}</p>
                          )}
                          {portfolio.short_description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{portfolio.short_description}</p>
                          )}

                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                            {isEditor && (
                              <button
                                onClick={() => handleToggleActive(portfolio)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                                  portfolio.is_active
                                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                              >
                                {portfolio.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                                {portfolio.is_active ? 'Hiển thị' : 'Ẩn'}
                              </button>
                            )}
                            <div className="flex-1" />
                            {isAdmin && (
                              <button
                                onClick={() => handleRemovePortfolio(portfolio)}
                                className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Category Dialog */}
      <Dialog
        visible={showCategoryDialog}
        onHide={() => setShowCategoryDialog(false)}
        header={editCategoryId ? 'Sửa hạng mục' : 'Thêm hạng mục'}
        className="w-full max-w-md"
        modal
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên hạng mục *</label>
            <InputText
              value={categoryForm.name}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full"
              placeholder="VD: Bất động sản"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <InputTextarea
              value={categoryForm.description}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              onClick={() => setShowCategoryDialog(false)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveCategory}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      </Dialog>

      {/* Add Projects Dialog */}
      <Dialog
        visible={showAddProjectDialog}
        onHide={() => setShowAddProjectDialog(false)}
        header="Chọn dự án để thêm vào Portfolio"
        className="w-full max-w-3xl"
        modal
      >
        <div>
          <div className="mb-4">
            <span className="p-input-icon-left w-full">
              <InputText
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                placeholder="Tìm kiếm dự án theo tên hoặc khách hàng..."
                className="w-full"
              />
            </span>
          </div>

          {selectedProjects.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">
                <Check size={14} className="inline mr-1" />
                Đã chọn {selectedProjects.length} dự án
              </p>
            </div>
          )}

          <div className="max-h-96 overflow-y-auto space-y-2">
            {availableProjects.length === 0 ? (
              <p className="text-center text-gray-400 py-8">Không tìm thấy dự án phù hợp</p>
            ) : (
              availableProjects.map(project => {
                const isSelected = selectedProjects.includes(project.id);
                const imgUrl = project.images?.[0]?.image_path ? `${STORAGE_URL}/${project.images[0].image_path}` : null;

                return (
                  <div
                    key={project.id}
                    onClick={() => {
                      setSelectedProjects(prev =>
                        isSelected
                          ? prev.filter(id => id !== project.id)
                          : [...prev, project.id]
                      );
                    }}
                    className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Checkbox checked={isSelected} className="pointer-events-none" />

                    <div className="w-16 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {imgUrl ? (
                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon size={20} className="text-gray-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{project.name}</p>
                      <p className="text-xs text-gray-400">{project.client?.name || 'Chưa có khách hàng'}</p>
                    </div>

                    {(project.production_link || project.domain_name) && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Có domain
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
            <button
              onClick={() => setShowAddProjectDialog(false)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm"
            >
              Hủy
            </button>
            <button
              onClick={handleAddProjects}
              disabled={saving || selectedProjects.length === 0}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
            >
              <Plus size={16} />
              {saving ? 'Đang thêm...' : `Thêm ${selectedProjects.length} dự án`}
            </button>
          </div>
        </div>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog
        visible={showImagePreview}
        onHide={() => setShowImagePreview(false)}
        header={previewProject?.name || 'Xem ảnh dự án'}
        className="w-full max-w-4xl"
        modal
      >
        <div>
          {previewProject && (previewProject.production_link || previewProject.domain_name) && (
            <a
              href={previewProject.production_link || `http://${previewProject.domain_name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mb-4 text-sm text-blue-600 hover:text-blue-700 no-underline bg-blue-50 px-3 py-1.5 rounded-lg"
            >
              <ExternalLink size={14} />
              Xem website
            </a>
          )}

          {previewImages.length === 0 ? (
            <p className="text-center text-gray-400 py-12">Dự án chưa có ảnh</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {previewImages.map((img, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-gray-200">
                  <img
                    src={`${STORAGE_URL}/${img.image_path}`}
                    alt={img.original_name}
                    className="w-full h-auto"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
