import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Review } from '../../shared/types';
import { useUI } from '../ui/UIContext';
import { useAuth } from '../auth/AuthContext';

export interface ProductsContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  editProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateStock: (id: string, newStock: number) => Promise<void>;
  clearAndResetDefaultProducts: () => Promise<void>;
  reviews: Review[];
  addReview: (productId: string, rating: number, comment: string) => Promise<void>;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  compareList: string[];
  toggleCompare: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  recentlyViewed: string[];
  addToRecentlyViewed: (productId: string) => void;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);
const readList = (key: string): string[] => {
  try { const value = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; }
};
const apiError = async (response: Response) => {
  try { const body = await response.json(); return body.error || body.message || 'Request failed.'; } catch { return 'Request failed.'; }
};

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addNotification } = useUI();
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [wishlist, setWishlist] = useState<string[]>(() => readList('pak_tajarat_wishlist'));
  const [compareList, setCompareList] = useState<string[]>(() => readList('pak_tajarat_compare'));
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => readList('pak_tajarat_recent'));

  useEffect(() => {
    let active = true;
    fetch('/api/products', { headers: { Accept: 'application/json' }, cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error(await apiError(response));
        return response.json();
      })
      .then(data => { if (active && Array.isArray(data.products)) setProducts(data.products); })
      .catch(error => {
        console.error('MongoDB product list unavailable:', error);
        if (active) setProducts([]);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => { try { localStorage.setItem('pak_tajarat_wishlist', JSON.stringify(wishlist)); } catch {} }, [wishlist]);
  useEffect(() => { try { localStorage.setItem('pak_tajarat_compare', JSON.stringify(compareList)); } catch {} }, [compareList]);
  useEffect(() => { try { localStorage.setItem('pak_tajarat_recent', JSON.stringify(recentlyViewed)); } catch {} }, [recentlyViewed]);

  const addProduct = async (input: Omit<Product, 'id'>) => {
    const response = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(input) });
    if (!response.ok) throw new Error(await apiError(response));
    const data = await response.json();
    const product = data.product as Product;
    setProducts(prev => [product, ...prev.filter(item => item.id !== product.id)]);
    addNotification('Product Published', `"${product.name}" was saved to MongoDB.`, 'success');
  };

  const editProduct = async (product: Product) => {
    const response = await fetch('/api/products/' + encodeURIComponent(product.id), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(product) });
    if (!response.ok) throw new Error(await apiError(response));
    const data = await response.json();
    setProducts(prev => prev.map(item => item.id === product.id ? (data.product as Product) : item));
    addNotification('Product Updated', `"${product.name}" was saved to MongoDB.`, 'success');
  };

  const deleteProduct = async (id: string) => {
    const response = await fetch('/api/products/' + encodeURIComponent(id), { method: 'DELETE', credentials: 'same-origin' });
    if (!response.ok) throw new Error(await apiError(response));
    setProducts(prev => prev.filter(item => item.id !== id));
    addNotification('Product Deleted', 'The product has been removed from MongoDB.', 'warning');
  };

  const updateStock = async (id: string, newStock: number) => {
    const product = products.find(item => item.id === id);
    if (!product) return;
    await editProduct({ ...product, stock: newStock });
  };

  const clearAndResetDefaultProducts = async () => {
    const response = await fetch('/api/products/clear', { method: 'POST', credentials: 'same-origin' });
    if (!response.ok) throw new Error(await apiError(response));
    setProducts([]);
    addNotification('Product Catalog Cleared', 'MongoDB catalog is empty and ready for your new uploads.', 'success');
  };

  const addReview = async (productId: string, rating: number, comment: string) => {
    const product = products.find(item => item.id === productId);
    if (!product) return;
    const review: Review = {
      id: `rev-${Date.now()}`, productId,
      userName: currentUser?.fullName || 'Shopper',
      userEmail: currentUser?.email || '',
      rating: Math.max(1, Math.min(5, Math.round(rating))),
      comment: comment.trim().slice(0, 2000),
      date: new Date().toISOString().slice(0, 10)
    };
    setReviews(prev => [review, ...prev]);
    const matching = [review, ...reviews.filter(item => item.productId === productId)];
    const avg = Number((matching.reduce((sum, item) => sum + item.rating, 0) / matching.length).toFixed(1));
    try { await editProduct({ ...product, rating: avg, reviewsCount: matching.length }); }
    catch (error) { console.warn('Review rating could not be saved to MongoDB:', error); }
    addNotification('Review Submitted', 'Thank you for your feedback.', 'success');
  };

  const toggleWishlist = (id: string) => setWishlist(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  const toggleCompare = (id: string) => setCompareList(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  const addToRecentlyViewed = (id: string) => setRecentlyViewed(prev => [id, ...prev.filter(item => item !== id)].slice(0, 12));

  return (
    <ProductsContext.Provider value={{
      products, addProduct, editProduct, deleteProduct, updateStock, clearAndResetDefaultProducts,
      reviews, addReview, wishlist, toggleWishlist, isInWishlist: (id) => wishlist.includes(id),
      compareList, toggleCompare, isInCompare: (id) => compareList.includes(id),
      recentlyViewed, addToRecentlyViewed
    }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) throw new Error('useProducts must be used within a ProductsProvider');
  return context;
};
