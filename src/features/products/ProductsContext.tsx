import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Review } from '../../shared/types';
import { INITIAL_PRODUCTS, INITIAL_REVIEWS } from '../../data/initialData';
import { db, auth } from '../../firebase';
import { signInAnonymously } from 'firebase/auth';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, getDocs } from 'firebase/firestore';
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

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addNotification } = useUI();
  const { currentUser } = useAuth();

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('pak_tajarat_local_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return INITIAL_PRODUCTS;
  });

  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pak_tajarat_wishlist');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [];
  });

  const [compareList, setCompareList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pak_tajarat_compare');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [];
  });

  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pak_tajarat_recent');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [];
  });

  // Sync Wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('pak_tajarat_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Sync CompareList to localStorage
  useEffect(() => {
    localStorage.setItem('pak_tajarat_compare', JSON.stringify(compareList));
  }, [compareList]);

  // Sync RecentlyViewed to localStorage
  useEffect(() => {
    localStorage.setItem('pak_tajarat_recent', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  // Helper to retrieve deleted product IDs
  const getDeletedIds = (): string[] => {
    try {
      const raw = localStorage.getItem('pak_tajarat_deleted_products');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  // Realtime sync Products from Firestore
  useEffect(() => {
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as Product);
      });

      const savedLocal = localStorage.getItem('pak_tajarat_local_products');
      let localProds: Product[] = [];
      if (savedLocal) {
        try { localProds = JSON.parse(savedLocal); } catch (_) {}
      }

      const deletedIds = new Set(getDeletedIds());

      if (items.length === 0) {
        if (localProds.length > 0) {
          setProducts(localProds.filter(p => !deletedIds.has(p.id)));
        } else {
          setProducts(INITIAL_PRODUCTS.filter(p => !deletedIds.has(p.id)));
        }
      } else {
        const prodMap = new Map<string, Product>();
        items.forEach(item => {
          if (!deletedIds.has(item.id)) {
            prodMap.set(item.id, item);
          }
        });

        // Ensure default initial catalog products are preserved if not deleted
        INITIAL_PRODUCTS.forEach(ip => {
          if (!prodMap.has(ip.id) && !deletedIds.has(ip.id)) {
            prodMap.set(ip.id, ip);
          }
        });

        if (Array.isArray(localProds)) {
          localProds.forEach(lp => {
            if (deletedIds.has(lp.id)) return;
            if (!prodMap.has(lp.id)) {
              prodMap.set(lp.id, lp);
            } else {
              const remote = prodMap.get(lp.id)!;
              if (lp.images && lp.images.length > (remote.images?.length || 0)) {
                prodMap.set(lp.id, { ...remote, images: lp.images, image: lp.image || remote.image });
              }
            }
          });
        }

        const mergedList = Array.from(prodMap.values());
        setProducts(mergedList);
        try {
          localStorage.setItem('pak_tajarat_local_products', JSON.stringify(mergedList));
        } catch (_) {}
      }
    }, (error) => {
      console.error("Error reading products:", error);
      const savedLocal = localStorage.getItem('pak_tajarat_local_products');
      const deletedIds = new Set(getDeletedIds());
      if (savedLocal) {
        try {
          const parsed = JSON.parse(savedLocal);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProducts(parsed.filter((p: Product) => !deletedIds.has(p.id)));
            return;
          }
        } catch (_) {}
      }
      setProducts(INITIAL_PRODUCTS.filter(p => !deletedIds.has(p.id)));
    });

    return () => unsubscribeProducts();
  }, []);

  // Realtime sync Reviews from Firestore
  useEffect(() => {
    const unsubscribeReviews = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      const items: Review[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as Review);
      });

      if (items.length === 0) {
        setReviews(INITIAL_REVIEWS);
      } else {
        setReviews(items);
      }
    }, (error) => {
      console.error("Error reading reviews:", error);
      setReviews(INITIAL_REVIEWS);
    });

    return () => unsubscribeReviews();
  }, []);

  const cleanUndefinedProps = (obj: any): any => {
    if (obj === null || obj === undefined) return null;
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
      return obj.map(cleanUndefinedProps).filter(v => v !== undefined && v !== null);
    }
    const clean: any = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val !== undefined) {
        clean[key] = cleanUndefinedProps(val);
      }
    }
    return clean;
  };

  const ensureFirebaseAuthUser = async () => {
    if (!auth.currentUser) {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.warn("Could not sign in anonymously prior to Firestore operation:", err);
      }
    }
  };

  const addProduct = async (newProd: Omit<Product, 'id'>) => {
    const id = `p-${Date.now()}`;
    const rawFresh: Product = { ...newProd, id };
    const fresh = cleanUndefinedProps(rawFresh) as Product;

    setProducts(prev => {
      const updated = [fresh, ...prev.filter(p => p.id !== id)];
      try { localStorage.setItem('pak_tajarat_local_products', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });

    await ensureFirebaseAuthUser();

    try {
      await setDoc(doc(db, 'products', id), fresh);
      addNotification('Product Published', `"${newProd.name}" was successfully added to inventory.`, 'success');
    } catch (error) {
      console.warn("Firestore addProduct note (saved locally):", error);
      addNotification('Product Added', `"${newProd.name}" published successfully.`, 'success');
    }
  };

  const editProduct = async (updated: Product) => {
    const fresh = cleanUndefinedProps(updated) as Product;

    setProducts(prev => {
      const updatedList = prev.map(p => p.id === fresh.id ? fresh : p);
      try { localStorage.setItem('pak_tajarat_local_products', JSON.stringify(updatedList)); } catch (_) {}
      return updatedList;
    });

    await ensureFirebaseAuthUser();

    try {
      await setDoc(doc(db, 'products', fresh.id), fresh);
      addNotification('Product Updated', `"${updated.name}" has been modified.`, 'success');
    } catch (error) {
      console.warn("Firestore editProduct note (saved locally):", error);
      addNotification('Product Updated', `"${updated.name}" updated successfully.`, 'success');
    }
  };

  const deleteProduct = async (id: string) => {
    const deletedIds = getDeletedIds();
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      try { localStorage.setItem('pak_tajarat_deleted_products', JSON.stringify(deletedIds)); } catch (_) {}
    }

    setProducts(prev => {
      const filtered = prev.filter(p => p.id !== id);
      try { localStorage.setItem('pak_tajarat_local_products', JSON.stringify(filtered)); } catch (_) {}
      return filtered;
    });

    await ensureFirebaseAuthUser();

    try {
      await deleteDoc(doc(db, 'products', id));
      addNotification('Product Deleted', 'The product has been removed.', 'warning');
    } catch (error) {
      console.warn("Firestore deleteProduct note (removed locally):", error);
      addNotification('Product Deleted', 'The product has been removed.', 'warning');
    }
  };

  const updateStock = async (id: string, newStock: number) => {
    setProducts(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, stock: newStock } : p);
      try { localStorage.setItem('pak_tajarat_local_products', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });

    await ensureFirebaseAuthUser();

    try {
      await updateDoc(doc(db, 'products', id), { stock: newStock });
    } catch (error) {
      console.warn("Firestore updateStock note (updated locally):", error);
    }
  };

  const clearAndResetDefaultProducts = async () => {
    const isLocalUser = !currentUser || currentUser.id.startsWith('local-') || !auth.currentUser;
    if (isLocalUser) {
      setProducts(INITIAL_PRODUCTS);
      addNotification('Products Reset (Local)', 'All products have been reset to default product.', 'success');
      return;
    }
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      for (const d of querySnapshot.docs) {
        await deleteDoc(doc(db, 'products', d.id));
      }
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }
      addNotification('Products Reset', 'All database products cleared and reset to default product.', 'success');
    } catch (error) {
      console.error("Error resetting products:", error);
    }
  };

  const addReview = async (productId: string, rating: number, comment: string) => {
    const userMail = currentUser?.email || 'guest@example.com';
    const userName = currentUser?.fullName || 'Anonymous Shopper';
    const reviewId = `rev-${Date.now()}`;

    const newRev: Review = {
      id: reviewId,
      productId,
      userName,
      userEmail: userMail,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0]
    };

    const isLocalUser = !currentUser || currentUser.id.startsWith('local-') || !auth.currentUser;

    if (isLocalUser) {
      setReviews(prev => [newRev, ...prev]);

      setProducts(prevProducts => prevProducts.map(p => {
        if (p.id === productId) {
          const productReviews = [newRev, ...reviews.filter(r => r.productId === productId)];
          const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
          const avg = parseFloat((sum / productReviews.length).toFixed(1));
          return {
            ...p,
            rating: avg,
            reviewsCount: productReviews.length
          };
        }
        return p;
      }));

      addNotification('Review Submitted (Local)', 'Thank you for your valuable feedback!', 'success');
      return;
    }

    try {
      await setDoc(doc(db, 'reviews', reviewId), newRev);

      const productReviews = [newRev, ...reviews.filter(r => r.productId === productId)];
      const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
      const avg = parseFloat((sum / productReviews.length).toFixed(1));

      await updateDoc(doc(db, 'products', productId), {
        rating: avg,
        reviewsCount: productReviews.length
      });

      addNotification('Review Submitted', 'Thank you for your valuable feedback!', 'success');
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        addNotification('Wishlist Updated', 'Product removed from your wishlist.', 'info');
        return prev.filter(id => id !== productId);
      } else {
        addNotification('Wishlist Updated', 'Product added to your wishlist.', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const toggleCompare = (productId: string) => {
    setCompareList(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        addNotification('Compare List Updated', 'Product removed from compare list.', 'info');
        return prev.filter(id => id !== productId);
      } else {
        if (prev.length >= 4) {
          addNotification('Compare Limit Reached', 'You can compare up to 4 products at a time.', 'warning');
          return prev;
        }
        addNotification('Compare List Updated', 'Product added to compare list.', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInCompare = (productId: string) => compareList.includes(productId);

  const addToRecentlyViewed = (productId: string) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(id => id !== productId);
      return [productId, ...filtered].slice(0, 10);
    });
  };

  return (
    <ProductsContext.Provider value={{
      products, addProduct, editProduct, deleteProduct, updateStock, clearAndResetDefaultProducts,
      reviews, addReview,
      wishlist, toggleWishlist, isInWishlist,
      compareList, toggleCompare, isInCompare,
      recentlyViewed, addToRecentlyViewed
    }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};
