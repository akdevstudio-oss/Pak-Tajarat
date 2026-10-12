import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HeroBanner } from '../../types';
import { optimizeAndUploadImage } from '../../utils/imageOptimizer';
import { Sparkles, Plus, Edit2, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, Calendar, Link, Image as ImageIcon, CheckCircle2, RefreshCw, X, Layers } from 'lucide-react';

export const HeroBannerManager: React.FC = () => {
  const { heroBanners, updateHeroBanners, addNotification } = useApp();
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);

  // Form State
  const [form, setForm] = useState<Partial<HeroBanner>>({
    title: '',
    subtitle: '',
    description: '',
    badge: 'Limited Offer',
    gradient: 'from-emerald-800 to-teal-950',
    image: '',
    mobileImage: '',
    ctaText: 'Shop Now',
    ctaLink: '/products',
    secondaryCtaText: '',
    secondaryCtaLink: '',
    textColor: '#ffffff',
    buttonColor: '#10b981',
    isEnabled: true,
    startDate: '',
    endDate: '',
    imageAlt: '',
    imageTitle: '',
    imageCaption: '',
    seoKeywords: ''
  });

  const handleOpenEdit = (banner: HeroBanner) => {
    setEditingBanner(banner);
    setIsCreatingNew(false);
    setForm({ ...banner });
  };

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setIsCreatingNew(true);
    setForm({
      id: 'b-' + Date.now(),
      title: 'New Promotional Banner',
      subtitle: 'Exclusive Deals Across Pakistan',
      description: 'Discover special discounts on top Pakistani fashion, electronics, and kitchenware.',
      badge: 'Flash Sale',
      gradient: 'from-emerald-900 to-zinc-950',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80',
      mobileImage: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=400&q=80',
      ctaText: 'Shop Deals',
      ctaLink: '/products',
      secondaryCtaText: 'Learn More',
      secondaryCtaLink: '/about',
      textColor: '#ffffff',
      buttonColor: '#10b981',
      isEnabled: true,
      order: heroBanners.length + 1,
      imageAlt: 'Promotional Banner Image',
      imageTitle: 'Pak-Tajarat Mega Sale',
      imageCaption: 'Discounts on electronics and fashion',
      seoKeywords: 'pakistan sale, online shopping, ecommerce discount'
    });
  };

  const handleSaveBanner = async () => {
    if (!form.title) {
      addNotification('Validation Error', 'Banner Title is required.', 'warning');
      return;
    }

    let updatedList: HeroBanner[] = [];
    if (editingBanner) {
      updatedList = heroBanners.map(b => b.id === editingBanner.id ? { ...(form as HeroBanner) } : b);
    } else {
      updatedList = [...heroBanners, form as HeroBanner];
    }

    // Sort by order if set
    updatedList.forEach((b, idx) => {
      b.order = idx + 1;
    });

    await updateHeroBanners(updatedList);
    setEditingBanner(null);
    setIsCreatingNew(false);
  };

  const handleDeleteBanner = async (id: string) => {
    if (confirm('Are you sure you want to delete this hero banner?')) {
      const updatedList = heroBanners.filter(b => b.id !== id);
      await updateHeroBanners(updatedList);
    }
  };

  const handleToggleEnable = async (id: string) => {
    const updatedList = heroBanners.map(b => b.id === id ? { ...b, isEnabled: !(b.isEnabled ?? true) } : b);
    await updateHeroBanners(updatedList);
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === heroBanners.length - 1)) {
      return;
    }
    const newBanners = [...heroBanners];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = newBanners[index];
    newBanners[index] = newBanners[targetIdx];
    newBanners[targetIdx] = temp;

    newBanners.forEach((b, idx) => b.order = idx + 1);
    await updateHeroBanners(newBanners);
  };

  const handleDesktopImageUpload = async (file: File) => {
    try {
      setUploadingDesktop(true);
      const res = await optimizeAndUploadImage(file, 'banners/desktop', 1600, 0.85);
      setForm(prev => ({ ...prev, image: res.url }));
      addNotification('Desktop Image Uploaded', 'Desktop banner image optimized and attached.', 'success');
    } catch (err) {
      console.error(err);
      addNotification('Upload Failed', 'Failed to upload desktop image.', 'warning');
    } finally {
      setUploadingDesktop(false);
    }
  };

  const handleMobileImageUpload = async (file: File) => {
    try {
      setUploadingMobile(true);
      const res = await optimizeAndUploadImage(file, 'banners/mobile', 800, 0.85);
      setForm(prev => ({ ...prev, mobileImage: res.url }));
      addNotification('Mobile Image Uploaded', 'Mobile banner image optimized and attached.', 'success');
    } catch (err) {
      console.error(err);
      addNotification('Upload Failed', 'Failed to upload mobile image.', 'warning');
    } finally {
      setUploadingMobile(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-zinc-900 to-zinc-950 border border-emerald-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Homepage CMS Engine</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Hero Banner Manager</h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Manage unlimited homepage hero banners with desktop & mobile responsiveness, CTA button links, custom colors, drag/reorder, scheduling, and image SEO fields.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center space-x-2 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Hero Banner</span>
        </button>
      </div>

      {/* Banner List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-zinc-400 flex items-center justify-between">
          <span>Active Banners ({heroBanners.length})</span>
          <span className="text-[10px] text-zinc-500 normal-case font-normal">Use arrows to reorder slider sequence</span>
        </h3>

        <div className="space-y-3">
          {heroBanners.map((banner, index) => {
            const isEnabled = banner.isEnabled ?? true;
            return (
              <div
                key={banner.id ? `${banner.id}-${index}` : `banner-${index}`}
                className={`border rounded-2xl p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isEnabled ? 'bg-zinc-950/80 border-zinc-800' : 'bg-zinc-950/30 border-zinc-900 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-4">
                  {/* Order Controls */}
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
                      disabled={index === heroBanners.length - 1}
                      className="p-1 hover:bg-zinc-800 rounded text-zinc-400 disabled:opacity-20"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div className="w-20 h-14 rounded-xl bg-zinc-900 overflow-hidden border border-zinc-800 flex-shrink-0 relative">
                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/40 px-2 py-0.5 rounded-md">
                        {banner.badge || 'Banner'}
                      </span>
                      <h4 className="font-bold text-white text-sm line-clamp-1">{banner.title}</h4>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{banner.subtitle}</p>
                    <div className="flex items-center space-x-3 text-[10px] text-zinc-500 mt-1">
                      <span>CTA: {banner.ctaText || 'None'}</span>
                      <span>Link: {banner.ctaLink || '/'}</span>
                      {banner.startDate && <span>Starts: {banner.startDate}</span>}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 self-end md:self-auto">
                  <button
                    onClick={() => handleToggleEnable(banner.id)}
                    className={`p-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                      isEnabled
                        ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400 hover:bg-emerald-900/40'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'
                    }`}
                  >
                    {isEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{isEnabled ? 'Enabled' : 'Disabled'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(banner)}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center space-x-1 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDeleteBanner(banner.id)}
                    className="p-2 rounded-xl bg-red-950/30 border border-red-900/50 hover:bg-red-900/40 text-red-400 text-xs font-semibold flex items-center space-x-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal / Drawer for Banner Add/Edit */}
      {(isCreatingNew || editingBanner) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-6 text-white shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                <span>{editingBanner ? 'Edit Hero Banner' : 'Add New Hero Banner'}</span>
              </h3>
              <button
                onClick={() => { setEditingBanner(null); setIsCreatingNew(false); }}
                className="p-1.5 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Content */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">1. Text Content & Styling</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Badge Tag</label>
                    <input
                      type="text"
                      value={form.badge || ''}
                      onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. Summer Mega Launch"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Banner Heading Title *</label>
                    <input
                      type="text"
                      value={form.title || ''}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. Welcome to Pak-Tajarat"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={form.subtitle || ''}
                      onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. Pakistan's Trusted Online Shopping Platform"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Gradient Theme Class</label>
                    <input
                      type="text"
                      value={form.gradient || ''}
                      onChange={e => setForm(f => ({ ...f, gradient: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. from-emerald-800 to-teal-950"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Description Paragraph</label>
                  <textarea
                    rows={2}
                    value={form.description || ''}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Short description snippet..."
                  />
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">2. Call to Action Buttons</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Primary CTA Button Text</label>
                    <input
                      type="text"
                      value={form.ctaText || ''}
                      onChange={e => setForm(f => ({ ...f, ctaText: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. Shop Collection"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Primary CTA Button Link</label>
                    <input
                      type="text"
                      value={form.ctaLink || ''}
                      onChange={e => setForm(f => ({ ...f, ctaLink: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. /products or https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Secondary CTA Button Text (Optional)</label>
                    <input
                      type="text"
                      value={form.secondaryCtaText || ''}
                      onChange={e => setForm(f => ({ ...f, secondaryCtaText: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. Explore Deals"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Secondary CTA Button Link (Optional)</label>
                    <input
                      type="text"
                      value={form.secondaryCtaLink || ''}
                      onChange={e => setForm(f => ({ ...f, secondaryCtaLink: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. /products?category=Electronics"
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">3. Desktop & Mobile Banner Images</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Desktop Image */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-zinc-300">Desktop Image (URL or File Upload)</label>
                    <input
                      type="text"
                      value={form.image || ''}
                      onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      placeholder="Desktop Image URL"
                    />
                    <label className="block w-full text-center bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold py-2 rounded-xl cursor-pointer">
                      {uploadingDesktop ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'Upload Desktop Banner File'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => e.target.files?.[0] && handleDesktopImageUpload(e.target.files[0])}
                      />
                    </label>
                  </div>

                  {/* Mobile Image */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-zinc-300">Mobile Image (URL or File Upload)</label>
                    <input
                      type="text"
                      value={form.mobileImage || ''}
                      onChange={e => setForm(f => ({ ...f, mobileImage: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      placeholder="Mobile Image URL"
                    />
                    <label className="block w-full text-center bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold py-2 rounded-xl cursor-pointer">
                      {uploadingMobile ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'Upload Mobile Banner File'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => e.target.files?.[0] && handleMobileImageUpload(e.target.files[0])}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Schedule & SEO Metadata */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">4. Schedule & Image SEO Fields</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Start Date (Optional)</label>
                    <input
                      type="date"
                      value={form.startDate || ''}
                      onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">End Date (Optional)</label>
                    <input
                      type="date"
                      value={form.endDate || ''}
                      onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Image ALT Text (Accessibility & SEO)</label>
                    <input
                      type="text"
                      value={form.imageAlt || ''}
                      onChange={e => setForm(f => ({ ...f, imageAlt: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                      placeholder="Describe banner image"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">Image SEO Title</label>
                    <input
                      type="text"
                      value={form.imageTitle || ''}
                      onChange={e => setForm(f => ({ ...f, imageTitle: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                      placeholder="Image SEO title tag"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 border-t border-zinc-800 pt-4">
              <button
                onClick={() => { setEditingBanner(null); setIsCreatingNew(false); }}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBanner}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition-all flex items-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Banner</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
