'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type CartItem = { listingId: string; sellerId: string; title: string; price: number | null; };
type CartContextType = {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cart');
    if (saved) setItems(JSON.parse(saved));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('cart', JSON.stringify(items));
  }, [items, isLoaded]);

  const addToCart = (item: CartItem) => {
    setItems(prev => prev.find(i => i.listingId === item.listingId) ? prev : [...prev, item]);
  };
  const removeFromCart = (id: string) => setItems(prev => prev.filter(i => i.listingId !== id));
  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};