import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { Sparkles, FileText, X, CheckCircle2, Image as ImageIcon } from 'lucide-react';

interface ProductImageSeoModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductImageSeoModal: React.FC<ProductImageSeoModalProps> = ({ product, onClose }) => {
  const { editProduct, addNotification } = useApp();

  const [altText, setAltText] = useState(product.imageAlt || product.name);
  const [imageTitle, setImageTitle] = useState(product.imageTitle || product.name);
  const [imageCaption, setImageCaption] = useState(product.imageCaption || '');
  const [imageDescription, setImageDescription] = useState(product.imageDescription || product.description);
  const [focusKeyword, setFocusKeyword] = useState(product.seoKeywords || '');

  const handleSave = async () => {
    const updatedProduct: Product = {
      ...product,
      imageAlt: altText,
      imageTitle: imageTitle,
      imageCaption: imageCaption,
      imageDescription: imageDescription,
      seoKeywords: focusKeyword
    };

    await editProduct(updatedProduct);
    addNotification('Product Image SEO Saved', `SEO metadata updated for "${product.name}".`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 text-white shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span>Product Image SEO Editor</span>
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-start space-x-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
          <div className="w-20 h-20 bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 flex-shrink-0">
            <img src={product.image} alt={altText} className="w-full h-full object-cover" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">{product.name}</h4>
            <p className="text-xs text-zinc-400 mt-1">RS. {product.price.toLocaleString()}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Category: {product.category}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Image ALT Text (Critical for Google Search & Accessibility) *</label>
            <input
              type="text"
              value={altText}
              onChange={e => setAltText(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              placeholder="e.g. Handmade Sialkot Willow Cricket Bat"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Image Title Attribute</label>
            <input
              type="text"
              value={imageTitle}
              onChange={e => setImageTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              placeholder="Tooltip text when hovering image"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Focus Keywords for Image SEO</label>
            <input
              type="text"
              value={focusKeyword}
              onChange={e => setFocusKeyword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              placeholder="e.g. cricket bat, sialkot willow, tap ball bat"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Image Caption</label>
            <input
              type="text"
              value={imageCaption}
              onChange={e => setImageCaption(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              placeholder="Short caption snippet"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Detailed Image Description</label>
            <textarea
              rows={2}
              value={imageDescription}
              onChange={e => setImageDescription(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none"
              placeholder="Detailed description used in image structured data schema"
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 border-t border-zinc-800 pt-4">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition-all flex items-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Product Image SEO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
