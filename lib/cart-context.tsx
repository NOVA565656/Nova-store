'use client';
import { createContext, useContext, useSyncExternalStore } from 'react';

export type CartItem = { listingId: string; sellerId: string; title: string; price: number | null; };

// --- External Store Logic ---
let cart: CartItem[] = [];
const listeners = new Set<() => void>();

// Hydrate from localStorage on the client only
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('cart');
  if (saved) {
    try {
      cart = JSON.parse(saved);
    } catch {
      // Ignore invalid JSON
    }
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() { return cart; }
function getServerSnapshot() { return []; }

function updateCart(newCart: CartItem[]) {
  cart = newCart;
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  listeners.forEach(l => l());
}
// ----------------------------

type CartContextType = {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  // useSyncExternalStore reads the client value on hydration, avoiding mismatch
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addToCart = (item: CartItem) => {
    if (!cart.find(i => i.listingId === item.listingId)) {
      updateCart([...cart, item]);
    }
  };
  
  const removeFromCart = (id: string) => updateCart(cart.filter(i => i.listingId !== id));
  const clearCart = () => updateCart([]);

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