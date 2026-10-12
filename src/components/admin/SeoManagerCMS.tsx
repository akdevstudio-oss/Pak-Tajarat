import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { optimizeAndUploadImage } from '../../utils/imageOptimizer';
import { Sparkles, Globe, Search, Share2, CheckCircle2, ShieldCheck, FileText, Upload, RefreshCw } from 'lucide-react';

export const SeoManagerCMS: React.FC = () => {
  const { seoConfig, updateSeoConfig, brandingConfig, addNotification } = useApp();
  const [uploadingOg, setUploadingOg] = useState(false);
  const [uploadingTwitter, setUploadingTwitter] = useState(false);

  const [form, setForm] = useState({ ...seoConfig });

  const handleSave = async () => {
    await updateSeoConfig(form);
  };

  const handleOgImageUpload = async (file: File) => {
    try {
      setUploadingOg(true);
      const res = await optimizeAndUploadImage(file, 'seo/og', 1200, 0.85);
      setForm(f => ({ ...f, ogImage: res.url }));
      addNotification('OG Image Uploaded', 'Open Graph social share image updated.', 'success');
    } catch (err) {
      console.error(err);
      addNotification('Upload Failed', 'Could not upload OG image.', 'warning');
    } finally {
      setUploadingOg(false);
    }
  };

  const handleTwitterImageUpload = async (file: File) => {
    try {
      setUploadingTwitter(true);
      const res = await optimizeAndUploadImage(file, 'seo/twitter', 1200, 0.85);
      setForm(f => ({ ...f, twitterImage: res.url }));
      addNotification('Twitter Image Uploaded', 'Twitter card image updated.', 'success');
    } catch (err) {
      console.error(err);
      addNotification('Upload Failed', 'Could not upload Twitter image.', 'warning');
    } finally {
      setUploadingTwitter(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-zinc-900 to-zinc-950 border border-emerald-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Search Engine Optimization</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Global SEO & Meta Manager</h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Manage global Meta Titles, Meta Descriptions, Canonical URLs, Robots directives, Sitemap, Open Graph, and Twitter Cards across the store.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center space-x-2 transition-all self-start md:self-auto"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Save Global SEO Settings</span>
        </button>
      </div>

      {/* 1. Global Meta Tags */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2 border-b border-zinc-800 pb-3">
          <Search className="w-5 h-5 text-emerald-400" />
          <span>Google Search Engine Metadata</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Store Site Title</label>
            <input
              type="text"
              value={form.siteTitle || ''}
              onChange={e => setForm(f => ({ ...f, siteTitle: e.target.value }))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Meta Title (Search Result Title) *</label>
            <input
              type="text"
              value={form.metaTitle || ''}
              onChange={e => setForm(f => ({ ...f, metaTitle: e.target.value }))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">Meta Description (Search Snippet) *</label>
          <textarea
            rows={3}
            value={form.metaDescription || ''}
            onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
          <p className="text-[10px] text-zinc-500 mt-1">Recommended length: 150 - 160 characters.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Meta Keywords (Comma separated)</label>
            <input
              type="text"
              value={form.keywords || ''}
              onChange={e => setForm(f => ({ ...f, keywords: e.target.value }))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Canonical URL Base *</label>
            <input
              type="text"
              value={form.canonicalUrl || ''}
              onChange={e => setForm(f => ({ ...f, canonicalUrl: e.target.value }))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              placeholder="https://paktajarat.pk"
            />
          </div>
        </div>
      </div>

      {/* 2. Robots & Indexing */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2 border-b border-zinc-800 pb-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>Indexing & Crawling Directives</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Robots.txt Meta Tag Settings</label>
            <select
              value={form.robotsSettings || 'index, follow'}
              onChange={e => setForm(f => ({ ...f, robotsSettings: e.target.value }))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
            >
              <option value="index, follow">index, follow (Allow Indexing & Link Crawling)</option>
              <option value="noindex, follow">noindex, follow (Hide Page, Follow Links)</option>
              <option value="noindex, nofollow">noindex, nofollow (Strictly Block Page & Links)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Sitemap XML Auto Generation</label>
            <div className="flex items-center space-x-4 pt-1">
              <label className="flex items-center space-x-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.sitemapEnabled ?? true}
                  onChange={e => setForm(f => ({ ...f, sitemapEnabled: e.target.checked }))}
                  className="accent-emerald-500 w-4 h-4"
                />
                <span>Enable Live /sitemap.xml Feed</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Open Graph & Social Cards */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2 border-b border-zinc-800 pb-3">
          <Share2 className="w-5 h-5 text-emerald-400" />
          <span>Open Graph & Social Share Preview</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Open Graph */}
          <div className="space-y-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <h4 className="text-xs font-bold text-emerald-400 uppercase">Facebook / WhatsApp / LinkedIn</h4>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">OG Title</label>
              <input
                type="text"
                value={form.ogTitle || ''}
                onChange={e => setForm(f => ({ ...f, ogTitle: e.target.value }))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">OG Description</label>
              <textarea
                rows={2}
                value={form.ogDescription || ''}
                onChange={e => setForm(f => ({ ...f, ogDescription: e.target.value }))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">OG Share Image URL</label>
              <input
                type="text"
                value={form.ogImage || ''}
                onChange={e => setForm(f => ({ ...f, ogImage: e.target.value }))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white mb-2"
              />
              <label className="block w-full text-center bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold py-2 rounded-xl cursor-pointer">
                {uploadingOg ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'Upload Custom OG Banner'}
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleOgImageUpload(e.target.files[0])} />
              </label>
            </div>
          </div>

          {/* Twitter Card */}
          <div className="space-y-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
            <h4 className="text-xs font-bold text-emerald-400 uppercase">Twitter / X Card Tags</h4>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Twitter Handle (@username)</label>
              <input
                type="text"
                value={form.twitterSite || ''}
                onChange={e => setForm(f => ({ ...f, twitterSite: e.target.value, twitterCreator: e.target.value }))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Twitter Card Style</label>
              <select
                value={form.twitterCard || 'summary_large_image'}
                onChange={e => setForm(f => ({ ...f, twitterCard: e.target.value }))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="summary_large_image">Summary Large Image Card</option>
                <option value="summary">Summary Small Card</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Twitter Card Image URL</label>
              <input
                type="text"
                value={form.twitterImage || ''}
                onChange={e => setForm(f => ({ ...f, twitterImage: e.target.value }))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white mb-2"
              />
              <label className="block w-full text-center bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold py-2 rounded-xl cursor-pointer">
                {uploadingTwitter ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'Upload Custom Twitter Banner'}
                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleTwitterImageUpload(e.target.files[0])} />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
