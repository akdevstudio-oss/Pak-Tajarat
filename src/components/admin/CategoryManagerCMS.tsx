import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CategoryItem } from '../../types';
import { optimizeAndUploadImage } from '../../utils/imageOptimizer';
import { Sparkles, Plus, Edit2, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Image as ImageIcon, CheckCircle2, RefreshCw, X, FolderTree } from 'lucide-react';

export const CategoryManagerCMS: React.FC = () => {
  const { siteCategories, updateSiteCategories, addNotification } = useApp();
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Form state
  const [form, setForm] = useState<Partial<CategoryItem>>({
    name: '',
    slug: '',
    iconUrl: '',
    bannerUrl: '',
    iconAlt: '',
    bannerAlt: '',
    seoTitle: '',
    seoDescription: '',
    isVisible: true
  });

  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setIsCreatingNew(false);
    setForm({ ...cat });
  };

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsCreatingNew(true);
    setForm({
      id: 'cat-' + Date.now(),
      name: 'New Category',
      slug: 'new-category',
      iconUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
      iconAlt: 'Category Icon',
      bannerAlt: 'Category Showcase Banner',
      seoTitle: 'Shop Category Online in Pakistan - Pak-Tajarat',
      seoDescription: 'High quality items delivered with Cash on Delivery across Pakistan.',
      order: siteCategories.length + 1,
      isVisible: true
    });
  };

  const handleSaveCategory = async () => {
    if (!form.name || !form.slug) {
      addNotification('Validation Error', 'Category Name and Slug are required.', 'warning');
      return;
    }

    let updatedList: CategoryItem[] = [];
    if (editingCategory) {
      updatedList = siteCategories.map(c => c.id === editingCategory.id ? { ...(form as CategoryItem) } : c);
    } else {
      updatedList = [...siteCategories, form as CategoryItem];
    }

    updatedList.forEach((c, idx) => c.order = idx + 1);

    await updateSiteCategories(updatedList);
    setEditingCategory(null);
    setIsCreatingNew(false);
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      const updatedList = siteCategories.filter(c => c.id !== id);
      await updateSiteCategories(updatedList);
    }
  };

  const handleToggleVisibility = async (id: string) => {
    const updatedList = siteCategories.map(c => c.id === id ? { ...c, isVisible: !c.isVisible } : c);
    await updateSiteCategories(updatedList);
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === siteCategories.length - 1)) {
      return;
    }
    const newList = [...siteCategories];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = newList[index];
    newList[index] = newList[targetIdx];
    newList[targetIdx] = temp;

    newList.forEach((c, idx) => c.order = idx + 1);
    await updateSiteCategories(newList);
  };

  const handleIconUpload = async (file: File) => {
    try {
      setUploadingIcon(true);
      const res = await optimizeAndUploadImage(file, 'categories/icons', 400, 0.9);
      setForm(prev => ({ ...prev, iconUrl: res.url }));
      addNotification('Icon Uploaded', 'Category icon uploaded and optimized.', 'success');
    } catch (err) {
      console.error(err);
      addNotification('Upload Failed', 'Failed to upload icon.', 'warning');
    } finally {
      setUploadingIcon(false);
    }
  };

  const handleBannerUpload = async (file: File) => {
    try {
      setUploadingBanner(true);
      const res = await optimizeAndUploadImage(file, 'categories/banners', 1200, 0.85);
      setForm(prev => ({ ...prev, bannerUrl: res.url }));
      addNotification('Banner Uploaded', 'Category banner image uploaded and optimized.', 'success');
    } catch (err) {
      console.error(err);
      addNotification('Upload Failed', 'Failed to upload banner.', 'warning');
    } finally {
      setUploadingBanner(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-zinc-900 to-zinc-950 border border-emerald-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Taxonomy & Navigation CMS</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Category Manager</h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Manage store categories, icons, banners, visibility, custom slugs, ALT text, and SEO meta fields.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center space-x-2 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Category List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-zinc-400 flex items-center justify-between">
          <span>Categories ({siteCategories.length})</span>
          <span className="text-[10px] text-zinc-500 normal-case font-normal">Reorder list sequence for navigation menu</span>
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {siteCategories.map((cat, index) => (
            <div
              key={cat.id ? `${cat.id}-${index}` : `cat-cms-${index}`}
              className={`border rounded-2xl p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                cat.isVisible ? 'bg-zinc-950/80 border-zinc-800' : 'bg-zinc-950/30 border-zinc-900 opacity-60'
              }`}
            >
              <div className="flex items-center space-x-4">
                {/* Order buttons */}
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => handleMoveOrder(index, 'up')}
                    disabled={index === 0}
                    className="p-1 hover:bg-zinc-800 rounded text-zinc-400 disabled:opacity-20"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] text-center text-zinc-500 font-mono font-bold">#{index + 1}</span>
                  <button
                    onClick={() => handleMoveOrder(index, 'down')}
                    disabled={index === siteCategories.length - 1}
                    className="p-1 hover:bg-zinc-800 rounded text-zinc-400 disabled:opacity-20"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Icon Preview */}
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {cat.iconUrl ? (
                    <img src={cat.iconUrl} alt={cat.iconAlt || cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <FolderTree className="w-5 h-5 text-emerald-400" />
                  )}
                </div>

                {/* Information */}
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                    <span>{cat.name}</span>
                    <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-md">/{cat.slug}</span>
                  </h4>
                  <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{cat.seoTitle || cat.name}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 self-end md:self-auto">
                <button
                  onClick={() => handleToggleVisibility(cat.id)}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                    cat.isVisible
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400 hover:bg-emerald-900/40'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'
                  }`}
                >
                  {cat.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{cat.isVisible ? 'Visible' : 'Hidden'}</span>
                </button>

                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center space-x-1 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="p-2 rounded-xl bg-red-950/30 border border-red-900/50 hover:bg-red-900/40 text-red-400 text-xs font-semibold flex items-center space-x-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit / Add Modal */}
      {(isCreatingNew || editingCategory) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-6 text-white shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <FolderTree className="w-5 h-5 text-emerald-400" />
                <span>{editingCategory ? 'Edit Category CMS' : 'Add New Category'}</span>
              </h3>
              <button
                onClick={() => { setEditingCategory(null); setIsCreatingNew(false); }}
                className="p-1.5 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Category Name *</label>
                  <input
                    type="text"
                    value={form.name || ''}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Electronics"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Category URL Slug *</label>
                  <input
                    type="text"
                    value={form.slug || ''}
                    onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. electronics"
                  />
                </div>
              </div>

              {/* Icon & Banner upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-300">Category Icon Image</label>
                  <input
                    type="text"
                    value={form.iconUrl || ''}
                    onChange={e => setForm(f => ({ ...f, iconUrl: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white"
                    placeholder="Icon URL"
                  />
                  <label className="block w-full text-center bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold py-2 rounded-xl cursor-pointer">
                    {uploadingIcon ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'Upload Icon File'}
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleIconUpload(e.target.files[0])} />
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-300">Category Showcase Banner</label>
                  <input
                    type="text"
                    value={form.bannerUrl || ''}
                    onChange={e => setForm(f => ({ ...f, bannerUrl: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white"
                    placeholder="Banner URL"
                  />
                  <label className="block w-full text-center bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold py-2 rounded-xl cursor-pointer">
                    {uploadingBanner ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'Upload Banner File'}
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleBannerUpload(e.target.files[0])} />
                  </label>
                </div>
              </div>

              {/* ALT Text & SEO Fields */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">SEO & Image ALT Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Icon ALT Text</label>
                    <input
                      type="text"
                      value={form.iconAlt || ''}
                      onChange={e => setForm(f => ({ ...f, iconAlt: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white"
                      placeholder="Icon accessibility ALT tag"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Banner ALT Text</label>
                    <input
                      type="text"
                      value={form.bannerAlt || ''}
                      onChange={e => setForm(f => ({ ...f, bannerAlt: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white"
                      placeholder="Banner accessibility ALT tag"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">SEO Meta Title</label>
                    <input
                      type="text"
                      value={form.seoTitle || ''}
                      onChange={e => setForm(f => ({ ...f, seoTitle: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white"
                      placeholder="Google Search title for category"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">SEO Meta Description</label>
                    <input
                      type="text"
                      value={form.seoDescription || ''}
                      onChange={e => setForm(f => ({ ...f, seoDescription: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white"
                      placeholder="Google snippet text for category"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 border-t border-zinc-800 pt-4">
              <button
                onClick={() => { setEditingCategory(null); setIsCreatingNew(false); }}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition-all flex items-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Category</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
