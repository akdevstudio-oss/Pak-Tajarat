import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { optimizeAndUploadImage } from '../../utils/imageOptimizer';
import { forceUpdateFavicon } from '../../utils/seoManager';
import { 
  Image as ImageIcon, Upload, Trash2, Globe, Sparkles, RefreshCw, 
  Smartphone, Share2, Search, Check, Save, AlertCircle, Eye, CheckCircle2,
  Sliders, Link as LinkIcon
} from 'lucide-react';

export const WebsiteBrandingManager: React.FC = () => {
  const { brandingConfig, updateBrandingConfig, addNotification, seoConfig } = useApp();
  
  // Loading & Save states
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Form states initialized from brandingConfig
  const [customText, setCustomText] = useState(brandingConfig?.customText || 'PAK-TAJARAT');
  const [brandTagline, setBrandTagline] = useState(brandingConfig?.brandTagline || "Trusted Digital Marketplace");
  const [logoType, setLogoType] = useState<'vector' | 'image'>(brandingConfig?.logoType || 'vector');
  const [logoImageUrl, setLogoImageUrl] = useState(brandingConfig?.logoImageUrl || '');
  const [faviconUrl, setFaviconUrl] = useState(brandingConfig?.faviconUrl || '');
  const [appIconUrl, setAppIconUrl] = useState(brandingConfig?.appIconUrl || '');
  const [ogImageUrl, setOgImageUrl] = useState(brandingConfig?.ogImageUrl || '');
  const [defaultSeoImageUrl, setDefaultSeoImageUrl] = useState(brandingConfig?.defaultSeoImageUrl || '');

  // Sync state if brandingConfig loads from cloud/context
  useEffect(() => {
    if (brandingConfig) {
      if (brandingConfig.customText !== undefined) setCustomText(brandingConfig.customText);
      if (brandingConfig.brandTagline !== undefined) setBrandTagline(brandingConfig.brandTagline);
      if (brandingConfig.logoType !== undefined) setLogoType(brandingConfig.logoType);
      if (brandingConfig.logoImageUrl !== undefined) setLogoImageUrl(brandingConfig.logoImageUrl);
      if (brandingConfig.faviconUrl !== undefined) setFaviconUrl(brandingConfig.faviconUrl);
      if (brandingConfig.appIconUrl !== undefined) setAppIconUrl(brandingConfig.appIconUrl);
      if (brandingConfig.ogImageUrl !== undefined) setOgImageUrl(brandingConfig.ogImageUrl);
      if (brandingConfig.defaultSeoImageUrl !== undefined) setDefaultSeoImageUrl(brandingConfig.defaultSeoImageUrl);
    }
  }, [
    brandingConfig?.customText, 
    brandingConfig?.brandTagline, 
    brandingConfig?.logoType,
    brandingConfig?.logoImageUrl, 
    brandingConfig?.faviconUrl, 
    brandingConfig?.appIconUrl, 
    brandingConfig?.ogImageUrl, 
    brandingConfig?.defaultSeoImageUrl
  ]);

  // Handle instant file uploads
  const handleFileUpload = async (field: 'logoImageUrl' | 'faviconUrl' | 'appIconUrl' | 'ogImageUrl' | 'defaultSeoImageUrl', file: File) => {
    try {
      setUploadingField(field);
      
      // Favicons are small, compress maxDimension 256 for rapid tab rendering; Logos 800
      const maxDim = field === 'faviconUrl' ? 256 : (field === 'appIconUrl' ? 384 : 800);
      const result = await optimizeAndUploadImage(file, 'branding', maxDim, 0.9);
      
      const newUrl = result.url;

      if (field === 'logoImageUrl') {
        setLogoImageUrl(newUrl);
        setLogoType('image');
      } else if (field === 'faviconUrl') {
        setFaviconUrl(newUrl);
        // Instantly force tab favicon update so admin sees it immediately in their browser tab!
        forceUpdateFavicon(newUrl);
      } else if (field === 'appIconUrl') {
        setAppIconUrl(newUrl);
      } else if (field === 'ogImageUrl') {
        setOgImageUrl(newUrl);
      } else if (field === 'defaultSeoImageUrl') {
        setDefaultSeoImageUrl(newUrl);
      }

      setHasUnsavedChanges(true);

      // Auto-save this uploaded asset immediately to Firestore and localStorage
      const immediateUpdates: any = { [field]: newUrl };
      if (field === 'logoImageUrl') immediateUpdates.logoType = 'image';
      
      await updateBrandingConfig(immediateUpdates);
      setHasUnsavedChanges(false);
      setLastSavedTime(new Date().toLocaleTimeString());

      addNotification(
        'Image Uploaded & Saved ✅', 
        `${field === 'logoImageUrl' ? 'Store Logo' : field === 'faviconUrl' ? 'Browser Tab Favicon' : 'Branding asset'} updated and permanently saved to cloud.`, 
        'success'
      );
    } catch (err) {
      console.error('Failed to upload image:', err);
      addNotification('Upload Error', 'Could not process or upload image file.', 'warning');
    } finally {
      setUploadingField(null);
    }
  };

  // Direct manual URL edit
  const handleUrlChange = (field: 'logoImageUrl' | 'faviconUrl' | 'appIconUrl' | 'ogImageUrl' | 'defaultSeoImageUrl', value: string) => {
    setHasUnsavedChanges(true);
    if (field === 'logoImageUrl') {
      setLogoImageUrl(value);
      if (value.trim()) setLogoType('image');
    } else if (field === 'faviconUrl') {
      setFaviconUrl(value);
      // Immediately reflect in tab
      if (value.trim()) forceUpdateFavicon(value.trim());
      else forceUpdateFavicon('/favicon.svg');
    } else if (field === 'appIconUrl') {
      setAppIconUrl(value);
    } else if (field === 'ogImageUrl') {
      setOgImageUrl(value);
    } else if (field === 'defaultSeoImageUrl') {
      setDefaultSeoImageUrl(value);
    }
  };

  // Remove field asset
  const handleRemoveField = async (field: 'logoImageUrl' | 'faviconUrl' | 'appIconUrl' | 'ogImageUrl' | 'defaultSeoImageUrl') => {
    if (field === 'logoImageUrl') {
      setLogoImageUrl('');
      setLogoType('vector');
    } else if (field === 'faviconUrl') {
      setFaviconUrl('');
      forceUpdateFavicon('/favicon.svg');
    } else if (field === 'appIconUrl') {
      setAppIconUrl('');
    } else if (field === 'ogImageUrl') {
      setOgImageUrl('');
    } else if (field === 'defaultSeoImageUrl') {
      setDefaultSeoImageUrl('');
    }

    setHasUnsavedChanges(true);
    await updateBrandingConfig({ [field]: '', ...(field === 'logoImageUrl' ? { logoType: 'vector' } : {}) });
    setHasUnsavedChanges(false);
    setLastSavedTime(new Date().toLocaleTimeString());
    addNotification('Asset Cleared', `Removed ${field} graphic. Changes saved permanently.`, 'info');
  };

  // MASTER SAVE FUNCTION
  const handleSaveAllBranding = async () => {
    try {
      setIsSaving(true);

      const payload = {
        customText: customText.trim(),
        brandTagline: brandTagline.trim(),
        logoType,
        logoImageUrl: logoImageUrl.trim(),
        faviconUrl: faviconUrl.trim(),
        appIconUrl: appIconUrl.trim(),
        ogImageUrl: ogImageUrl.trim(),
        defaultSeoImageUrl: defaultSeoImageUrl.trim(),
      };

      // 1. Permanently update in Context, LocalStorage, and Firebase Cloud Firestore
      await updateBrandingConfig(payload);

      // 2. Force immediate tab icon update in browser
      if (payload.faviconUrl) {
        forceUpdateFavicon(payload.faviconUrl);
      } else {
        forceUpdateFavicon('/favicon.svg');
      }

      setHasUnsavedChanges(false);
      setLastSavedTime(new Date().toLocaleTimeString());

      addNotification(
        'Branding Permanently Saved! 💾', 
        'Store Logo, Browser Tab Favicon, and Brand Identity saved permanently to Cloud Firestore database.', 
        'success'
      );
    } catch (err: any) {
      console.error('Error saving branding settings:', err);
      addNotification('Save Failed', err?.message || 'Could not save branding settings.', 'warning');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 text-left">
      
      {/* Sticky Quick Action & Save Bar */}
      <div className="sticky top-2 z-30 p-4 rounded-2xl bg-zinc-900/95 backdrop-blur-md border border-zinc-700/60 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-black text-white">Website Branding & Logo CMS</h2>
              {hasUnsavedChanges ? (
                <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                  <AlertCircle className="w-3 h-3" />
                  <span>Unsaved Changes / غیر محفوظ</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>All Saved / لائیو محفوظ</span>
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              {lastSavedTime ? `Last saved permanently at ${lastSavedTime}` : 'All changes update live in your browser and sync across all devices.'}
            </p>
          </div>
        </div>

        {/* Big Save Button */}
        <button
          onClick={handleSaveAllBranding}
          disabled={isSaving}
          className={`flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl transition-all w-full sm:w-auto ${
            hasUnsavedChanges
              ? 'bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white ring-2 ring-emerald-400/50 shadow-emerald-900/40 animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
          id="save-branding-btn-top"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>سیو ہو رہا ہے... Saving to Cloud...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Branding & Logo (سیو کریں)</span>
            </>
          )}
        </button>
      </div>

      {/* LIVE PREVIEW SECTION: Interactive Browser Tab & Store Header */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Live Browser Tab Preview */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center space-x-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Live Browser Tab Preview (ٹیب آئیکن پریویو)</span>
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Updates in Real-Time
            </span>
          </div>

          {/* Browser Window Chrome */}
          <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-3 shadow-inner space-y-2">
            {/* Window controls & Tab */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1.5 px-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
              </div>

              {/* Active Tab */}
              <div className="bg-zinc-900 border-t border-x border-zinc-700/80 rounded-t-lg px-3 py-1.5 flex items-center space-x-2 max-w-[260px] shadow-sm">
                {faviconUrl ? (
                  <img 
                    src={faviconUrl} 
                    alt="Favicon" 
                    className="w-4 h-4 object-contain rounded-sm shrink-0" 
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-4 h-4 rounded-sm bg-emerald-500 flex items-center justify-center text-[9px] text-white font-black shrink-0">
                    P
                  </div>
                )}
                <span className="text-xs font-medium text-zinc-200 truncate">
                  {customText || 'PAK-TAJARAT'} - {brandTagline || 'Trusted Digital Marketplace'}
                </span>
                <span className="text-zinc-500 text-xs hover:text-zinc-300 cursor-pointer">×</span>
              </div>
            </div>

            {/* Fake Address Bar */}
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg px-3 py-1 flex items-center space-x-2 text-xs text-zinc-400 font-mono">
              <span className="text-emerald-500 text-[10px]">🔒</span>
              <span className="text-zinc-300">https://pak-tajarat.store</span>
              <span className="text-zinc-600">/</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            As soon as you upload or change your Favicon, your browser tab icon changes instantly and saves permanently!
          </p>
        </div>

        {/* 2. Live Store Header Logo Preview */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center space-x-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Live Website Header Preview (مین لوگو پریویو)</span>
            </h3>
            <span className="text-[10px] text-zinc-400 font-mono">
              {logoType === 'image' && logoImageUrl ? 'Image Logo' : 'Vector Logo'}
            </span>
          </div>

          {/* Header Mockup */}
          <div className="bg-white dark:bg-[#121212] rounded-xl border border-zinc-800 p-4 flex items-center justify-between shadow-inner">
            <div className="flex items-center space-x-3">
              {logoType === 'image' && logoImageUrl ? (
                <div className="flex items-center space-x-2.5">
                  <img
                    src={logoImageUrl}
                    alt={customText}
                    className="h-10 w-auto max-w-[140px] sm:max-w-[180px] object-contain rounded"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                  <div>
                    <span className="text-sm font-black text-gray-900 dark:text-white block leading-tight">
                      {customText}
                    </span>
                    <span className="text-[9px] text-gray-400 dark:text-gray-500 font-mono uppercase block">
                      {brandTagline}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center text-white font-black text-base shadow-md">
                    PK
                  </div>
                  <div>
                    <span className="text-sm font-black text-gray-900 dark:text-white block leading-tight">
                      {customText}
                    </span>
                    <span className="text-[9px] text-gray-400 dark:text-gray-500 font-mono uppercase block">
                      {brandTagline}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <span>Header Active</span>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            This is how visitors see your store branding on the website header and footer.
          </p>
        </div>

      </div>

      {/* Brand Name & Tagline Settings */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-lg space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Globe className="w-5 h-5 text-emerald-400" />
          <span>Brand Name & Tagline Identity (سٹور کا نام اور ٹیگ لائن)</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Store Brand Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={customText}
              onChange={(e) => { setCustomText(e.target.value); setHasUnsavedChanges(true); }}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              placeholder="e.g. PAK-TAJARAT"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Brand Tagline / Slogan
            </label>
            <input
              type="text"
              value={brandTagline}
              onChange={(e) => { setBrandTagline(e.target.value); setHasUnsavedChanges(true); }}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              placeholder="e.g. Pakistan's Premier Digital Marketplace"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-zinc-800">
          <span className="text-xs font-semibold text-zinc-300">Display Primary Logo As:</span>
          <label className="flex items-center space-x-2 cursor-pointer text-xs text-zinc-300">
            <input
              type="radio"
              name="logoType"
              checked={logoType === 'image'}
              onChange={() => { setLogoType('image'); setHasUnsavedChanges(true); }}
              className="accent-emerald-500"
            />
            <span className="font-bold text-emerald-400">Uploaded Image Graphic (تجویز کردہ)</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer text-xs text-zinc-300">
            <input
              type="radio"
              name="logoType"
              checked={logoType === 'vector'}
              onChange={() => { setLogoType('vector'); setHasUnsavedChanges(true); }}
              className="accent-emerald-500"
            />
            <span>Dynamic Vector & Brand Text</span>
          </label>
        </div>
      </div>

      {/* Grid of Branding Asset Uploaders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ============================================================== */}
        {/* 1. Website Main Logo */}
        {/* ============================================================== */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                <ImageIcon className="w-5 h-5 text-emerald-400" />
                <span>1. Website Main Logo (مین ویب سائٹ لوگو)</span>
              </h4>
              <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2.5 py-0.5 rounded-md font-mono">Header & Footer</span>
            </div>
            <p className="text-xs text-zinc-400">
              Primary brand logo image displayed in the website header and footer. Recommended: Transparent WebP or PNG (400x100px).
            </p>

            {/* Visual Preview Box */}
            <div className="mt-4 border border-dashed border-zinc-800 bg-zinc-950/80 rounded-xl p-4 text-center min-h-[140px] flex items-center justify-center relative group">
              {logoImageUrl ? (
                <div className="space-y-2">
                  <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 inline-block max-w-full">
                    <img 
                      src={logoImageUrl} 
                      alt="Main Logo" 
                      className="max-h-20 max-w-full object-contain mx-auto" 
                    />
                  </div>
                  <p className="text-[11px] text-emerald-400 font-bold flex items-center justify-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Active Store Logo</span>
                  </p>
                </div>
              ) : (
                <div className="text-zinc-500 text-xs space-y-1">
                  <Upload className="w-8 h-8 mx-auto mb-1 opacity-50 text-zinc-400" />
                  <span className="font-semibold block">No Custom Logo Uploaded</span>
                  <span className="text-[10px] text-zinc-500">Currently using Vector Logo</span>
                </div>
              )}
            </div>

            {/* Direct URL input */}
            <div className="mt-4 space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-300 flex items-center space-x-1">
                <LinkIcon className="w-3 h-3 text-emerald-400" />
                <span>Or Enter Image Direct URL:</span>
              </label>
              <input
                type="text"
                value={logoImageUrl}
                onChange={(e) => handleUrlChange('logoImageUrl', e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-3 border-t border-zinc-800">
            <label className="block w-full text-center bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer transition-colors shadow-md">
              {uploadingField === 'logoImageUrl' ? (
                <span className="flex items-center justify-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Compressing & Saving...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Upload Logo File (لوگو فائل منتخب کریں)</span>
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingField === 'logoImageUrl'}
                onChange={(e) => e.target.files?.[0] && handleFileUpload('logoImageUrl', e.target.files[0])}
              />
            </label>
            
            {logoImageUrl && (
              <button
                type="button"
                onClick={() => handleRemoveField('logoImageUrl')}
                className="w-full text-center text-red-400 hover:text-red-300 hover:bg-red-500/10 py-1.5 rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Custom Logo (ریموو کریں)</span>
              </button>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. Browser Tab Favicon */}
        {/* ============================================================== */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-lg ring-1 ring-emerald-500/20">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                <span>2. Browser Tab Favicon (ٹیب آئیکن / فیوآئیکن)</span>
              </h4>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-md font-mono">
                Tab Icon
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              The icon shown inside the browser tab, bookmarks, and mobile search results. Recommended: 64x64 or 128x128px PNG, ICO, or SVG.
            </p>

            {/* Visual Preview Box */}
            <div className="mt-4 border border-dashed border-zinc-800 bg-zinc-950/80 rounded-xl p-4 text-center min-h-[140px] flex items-center justify-center relative">
              {faviconUrl ? (
                <div className="space-y-2">
                  <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 inline-block shadow-md">
                    <img 
                      src={faviconUrl} 
                      alt="Favicon" 
                      className="w-14 h-14 object-contain mx-auto rounded-md shadow" 
                    />
                  </div>
                  <p className="text-[11px] text-emerald-400 font-bold flex items-center justify-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Active Browser Tab Icon</span>
                  </p>
                </div>
              ) : (
                <div className="text-zinc-500 text-xs space-y-1">
                  <Globe className="w-8 h-8 mx-auto mb-1 opacity-50 text-zinc-400" />
                  <span className="font-semibold block">Using Default Favicon (/favicon.svg)</span>
                  <span className="text-[10px] text-zinc-500">Upload your custom icon below</span>
                </div>
              )}
            </div>

            {/* Direct URL input */}
            <div className="mt-4 space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-300 flex items-center space-x-1">
                <LinkIcon className="w-3 h-3 text-emerald-400" />
                <span>Or Enter Favicon Direct URL:</span>
              </label>
              <input
                type="text"
                value={faviconUrl}
                onChange={(e) => handleUrlChange('faviconUrl', e.target.value)}
                placeholder="https://example.com/favicon.png"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-3 border-t border-zinc-800">
            <label className="block w-full text-center bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer transition-colors shadow-md">
              {uploadingField === 'faviconUrl' ? (
                <span className="flex items-center justify-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Updating Tab Icon...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Upload Favicon Icon (آئیکن اپلوڈ کریں)</span>
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingField === 'faviconUrl'}
                onChange={(e) => e.target.files?.[0] && handleFileUpload('faviconUrl', e.target.files[0])}
              />
            </label>
            
            {faviconUrl && (
              <button
                type="button"
                onClick={() => handleRemoveField('faviconUrl')}
                className="w-full text-center text-red-400 hover:text-red-300 hover:bg-red-500/10 py-1.5 rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset to Default Favicon (ڈیفالٹ پر ری سیٹ)</span>
              </button>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. Mobile App & PWA Touch Icon */}
        {/* ============================================================== */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <span>3. Mobile App & Touch Icon (موبائل ایپ آئیکن)</span>
              </h4>
              <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2.5 py-0.5 rounded-md font-mono">PWA / Shortcut</span>
            </div>
            <p className="text-xs text-zinc-400">
              Displayed when a customer adds Pak-Tajarat to their phone home screen. Recommended: 192x192px square PNG.
            </p>

            {/* Visual Preview Box */}
            <div className="mt-4 border border-dashed border-zinc-800 bg-zinc-950/80 rounded-xl p-4 text-center min-h-[140px] flex items-center justify-center relative">
              {appIconUrl ? (
                <div className="space-y-2">
                  <img 
                    src={appIconUrl} 
                    alt="App Icon" 
                    className="w-16 h-16 object-cover mx-auto rounded-2xl shadow-xl border border-zinc-700" 
                  />
                  <p className="text-[11px] text-emerald-400 font-bold flex items-center justify-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Mobile App Icon Active</span>
                  </p>
                </div>
              ) : (
                <div className="text-zinc-500 text-xs space-y-1">
                  <Smartphone className="w-8 h-8 mx-auto mb-1 opacity-50 text-zinc-400" />
                  <span className="font-semibold block">No Custom App Icon</span>
                  <span className="text-[10px] text-zinc-500">Falls back to default branding</span>
                </div>
              )}
            </div>

            {/* Direct URL input */}
            <div className="mt-4 space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-300 flex items-center space-x-1">
                <LinkIcon className="w-3 h-3 text-emerald-400" />
                <span>Or Enter App Icon Direct URL:</span>
              </label>
              <input
                type="text"
                value={appIconUrl}
                onChange={(e) => handleUrlChange('appIconUrl', e.target.value)}
                placeholder="https://example.com/app-icon.png"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-3 border-t border-zinc-800">
            <label className="block w-full text-center bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer transition-colors shadow">
              {uploadingField === 'appIconUrl' ? (
                <span className="flex items-center justify-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Upload App Icon File</span>
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingField === 'appIconUrl'}
                onChange={(e) => e.target.files?.[0] && handleFileUpload('appIconUrl', e.target.files[0])}
              />
            </label>
            
            {appIconUrl && (
              <button
                type="button"
                onClick={() => handleRemoveField('appIconUrl')}
                className="w-full text-center text-red-400 hover:text-red-300 py-1.5 text-xs flex items-center justify-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove App Icon</span>
              </button>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 4. Open Graph Social Share Banner */}
        {/* ============================================================== */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-white text-sm flex items-center space-x-2">
                <Share2 className="w-5 h-5 text-emerald-400" />
                <span>4. Open Graph Social Banner (سوشل میڈیا بینر)</span>
              </h4>
              <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2.5 py-0.5 rounded-md font-mono">WhatsApp / FB</span>
            </div>
            <p className="text-xs text-zinc-400">
              Shown when sharing store link on WhatsApp, Facebook, LinkedIn. Recommended: 1200x630px.
            </p>

            {/* Visual Preview Box */}
            <div className="mt-4 border border-dashed border-zinc-800 bg-zinc-950/80 rounded-xl p-4 text-center min-h-[140px] flex items-center justify-center relative">
              {ogImageUrl ? (
                <div className="space-y-2">
                  <img 
                    src={ogImageUrl} 
                    alt="OG Banner" 
                    className="max-h-24 max-w-full object-cover mx-auto rounded-lg shadow-md border border-zinc-800" 
                  />
                  <p className="text-[11px] text-emerald-400 font-bold flex items-center justify-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Social Banner Active</span>
                  </p>
                </div>
              ) : (
                <div className="text-zinc-500 text-xs space-y-1">
                  <Share2 className="w-8 h-8 mx-auto mb-1 opacity-50 text-zinc-400" />
                  <span className="font-semibold block">No Social Banner</span>
                  <span className="text-[10px] text-zinc-500">Falls back to store default</span>
                </div>
              )}
            </div>

            {/* Direct URL input */}
            <div className="mt-4 space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-300 flex items-center space-x-1">
                <LinkIcon className="w-3 h-3 text-emerald-400" />
                <span>Or Enter Banner Direct URL:</span>
              </label>
              <input
                type="text"
                value={ogImageUrl}
                onChange={(e) => handleUrlChange('ogImageUrl', e.target.value)}
                placeholder="https://example.com/banner.png"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-3 border-t border-zinc-800">
            <label className="block w-full text-center bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer transition-colors shadow">
              {uploadingField === 'ogImageUrl' ? (
                <span className="flex items-center justify-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Upload Social Banner</span>
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingField === 'ogImageUrl'}
                onChange={(e) => e.target.files?.[0] && handleFileUpload('ogImageUrl', e.target.files[0])}
              />
            </label>
            
            {ogImageUrl && (
              <button
                type="button"
                onClick={() => handleRemoveField('ogImageUrl')}
                className="w-full text-center text-red-400 hover:text-red-300 py-1.5 text-xs flex items-center justify-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Social Banner</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Prominent Bottom Save Action Panel */}
      <div className="bg-gradient-to-r from-emerald-950 via-zinc-900 to-zinc-950 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Permanent Cloud Storage Synchronized</span>
          </div>
          <h3 className="text-xl font-black text-white">Save All Branding & Logo Settings</h3>
          <p className="text-xs text-zinc-400 max-w-xl">
            Clicking Save permanently updates your Website Logo, Browser Tab Favicon, and Store Identity in Firebase Cloud Firestore and caches them for instant 0ms load time across all devices.
          </p>
        </div>

        <button
          onClick={handleSaveAllBranding}
          disabled={isSaving}
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-950/60 transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
          id="save-branding-btn-bottom"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>سیو ہو رہا ہے... Saving to Cloud...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Save & Apply Changes Permanently (مستقل محفوظ کریں)</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
