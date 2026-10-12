import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MediaItem } from '../../types';
import { optimizeAndUploadImage } from '../../utils/imageOptimizer';
import { Sparkles, Upload, Search, Filter, Copy, Trash2, Edit3, Image as ImageIcon, Check, RefreshCw, X, Tag, FileText, Globe } from 'lucide-react';

export const MediaLibraryView: React.FC = () => {
  const { mediaLibrary, addMediaItem, updateMediaItem, deleteMediaItem, addNotification } = useApp();
  
  const [selectedFolder, setSelectedFolder] = useState<'All' | 'Branding' | 'Banners' | 'Categories' | 'Products' | 'Blog' | 'General'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);

  // Form state for image metadata editing
  const [editForm, setEditForm] = useState<Partial<MediaItem>>({});

  const folders: Array<'All' | 'Branding' | 'Banners' | 'Categories' | 'Products' | 'Blog' | 'General'> = [
    'All', 'Branding', 'Banners', 'Categories', 'Products', 'Blog', 'General'
  ];

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await optimizeAndUploadImage(
          file, 
          selectedFolder === 'All' ? 'general' : selectedFolder.toLowerCase(), 
          1600, 
          0.85
        );

        const newItem: MediaItem = {
          id: 'media-' + Date.now() + '-' + i,
          name: file.name.replace(/\.[^/.]+$/, ""),
          url: result.url,
          size: result.size,
          type: result.type,
          folder: selectedFolder === 'All' ? 'General' : selectedFolder,
          uploadedAt: new Date().toISOString().split('T')[0],
          altText: file.name.replace(/\.[^/.]+$/, ""),
          title: file.name.replace(/\.[^/.]+$/, ""),
          caption: '',
          description: '',
          focusKeyword: '',
          tags: [selectedFolder === 'All' ? 'general' : selectedFolder.toLowerCase()]
        };

        await addMediaItem(newItem);
      }
      addNotification('Upload Complete', `${files.length} image(s) processed and stored in Media Library.`, 'success');
    } catch (err) {
      console.error(err);
      addNotification('Upload Error', 'Failed to upload image to Media Library.', 'warning');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    addNotification('URL Copied', 'Image direct URL copied to clipboard!', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenEdit = (item: MediaItem) => {
    setEditingItem(item);
    setEditForm({ ...item });
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    const updated = { ...editingItem, ...editForm } as MediaItem;
    await updateMediaItem(updated);
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Permanently remove this image from Media Library?')) {
      await deleteMediaItem(id);
    }
  };

  // Filter items
  const filteredItems = mediaLibrary.filter(item => {
    const matchesFolder = selectedFolder === 'All' || item.folder === selectedFolder;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      item.name.toLowerCase().includes(q) || 
      (item.altText && item.altText.toLowerCase().includes(q)) ||
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(q)));
    return matchesFolder && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-zinc-900 to-zinc-950 border border-emerald-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Digital Asset Management</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Centralized Media Library</h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Upload, compress, search, and edit image SEO metadata (ALT tags, titles, focus keywords) for all store assets.
          </p>
        </div>

        {/* Upload Button */}
        <label className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center space-x-2 transition-all cursor-pointer self-start md:self-auto">
          {isUploading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          <span>{isUploading ? 'Compressing & Saving...' : 'Upload New Media'}</span>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={isUploading}
            className="hidden"
            onChange={e => handleFileUpload(e.target.files)}
          />
        </label>
      </div>

      {/* Navigation Tabs & Search Toolbar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Folder Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-2 md:pb-0">
          {folders.map((f, idx) => (
            <button
              key={`${f}-${idx}`}
              onClick={() => setSelectedFolder(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedFolder === f
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by ALT, title, tag..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Grid of Images */}
      {filteredItems.length === 0 ? (
        <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-2xl p-12 text-center text-zinc-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-semibold text-zinc-400">No media assets found</p>
          <p className="text-xs text-zinc-600 mt-1">Upload images or change folder filter to see items.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id ? `${item.id}-${idx}` : `media-${idx}`}
              className="group bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 rounded-2xl overflow-hidden transition-all shadow-md flex flex-col justify-between"
            >
              <div className="relative aspect-square bg-zinc-950 overflow-hidden">
                <img
                  src={item.url}
                  alt={item.altText || item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 bg-zinc-950/80 text-[10px] text-zinc-300 px-2 py-0.5 rounded-md font-mono">
                  {item.folder}
                </span>
                <span className="absolute bottom-2 right-2 bg-zinc-950/80 text-[10px] text-emerald-400 px-1.5 py-0.5 rounded-md font-mono">
                  {item.sizeKb ? `${item.sizeKb} KB` : 'WebP'}
                </span>
              </div>

              <div className="p-3 space-y-2">
                <h4 className="text-xs font-bold text-white truncate" title={item.name}>{item.name}</h4>
                <p className="text-[10px] text-zinc-500 truncate">ALT: {item.altText || 'None'}</p>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
                  <button
                    onClick={() => handleCopyUrl(item.url, item.id)}
                    className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 hover:text-white transition-colors"
                    title="Copy Image URL"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 hover:text-white transition-colors"
                    title="Edit Metadata & Image SEO"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 bg-red-950/30 hover:bg-red-900/40 rounded-lg text-red-400 transition-colors"
                    title="Delete Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image SEO & Metadata Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-6 text-white shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span>Image SEO & Metadata Editor</span>
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Preview */}
              <div className="space-y-3">
                <div className="aspect-square bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden">
                  <img src={editingItem.url} alt={editingItem.altText} className="w-full h-full object-cover" />
                </div>
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-[11px] space-y-1 font-mono text-zinc-400">
                  <p>Dimensions: {editingItem.width || '?'} x {editingItem.height || '?'} px</p>
                  <p>File Size: {editingItem.sizeKb || '?'} KB</p>
                  <p>Uploaded: {editingItem.uploadedAt}</p>
                </div>
              </div>

              {/* Form */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Image Name / Title</label>
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={e => setEditForm(f => ({ ...f, name: e.target.value, title: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Image ALT Text (Critical for Google & Screen Readers) *</label>
                  <input
                    type="text"
                    value={editForm.altText || ''}
                    onChange={e => setEditForm(f => ({ ...f, altText: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Sialkot Grade-A Willow Cricket Bat Front View"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Focus Keyword</label>
                  <input
                    type="text"
                    value={editForm.focusKeyword || ''}
                    onChange={e => setEditForm(f => ({ ...f, focusKeyword: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                    placeholder="e.g. sialkot cricket bat"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Image Caption</label>
                  <input
                    type="text"
                    value={editForm.caption || ''}
                    onChange={e => setEditForm(f => ({ ...f, caption: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                    placeholder="Short caption text"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editForm.description || ''}
                    onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none"
                    placeholder="Full detailed image description for SEO schema"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 border-t border-zinc-800 pt-4">
              <button
                onClick={() => setEditingItem(null)}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition-all"
              >
                Save Metadata
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
