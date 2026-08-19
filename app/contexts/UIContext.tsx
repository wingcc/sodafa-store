// contexts/UIContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type CartItem = {
  id: string | number;
  name: string;
  price: number;
  qty: number;
  image: string;
};

type UIContextType = {
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;

  isMobileMenuOpen: boolean;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;

  isQuickAddOpen: boolean;
  openQuickAdd: () => void;
  closeQuickAdd: () => void;

  isCheckoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;

  cartItems: CartItem[];
  cartTotal: number;
  addToCart: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, qty: number) => void;
  clearCart: () => void;
};

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
 
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);
  const toggleSearch = () => setIsSearchOpen((prev) => !prev);

  const openMobileMenu = () => setIsMobileMenuOpen(true);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  const openQuickAdd = () => setIsQuickAddOpen(true);
  const closeQuickAdd = () => setIsQuickAddOpen(false);

  const openCheckout = () => setIsCheckoutOpen(true);
  const closeCheckout = () => setIsCheckoutOpen(false);


  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.qty, 0);

  const addToCart = (item: Omit<CartItem, "qty">, qty: number = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { ...item, qty }];
    });
  };

  const removeFromCart = (id: string | number) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string | number, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <UIContext.Provider
      value={{
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        isSearchOpen,
        openSearch,
        closeSearch,
        toggleSearch,
        isMobileMenuOpen,
        openMobileMenu,
        closeMobileMenu,
        toggleMobileMenu,
        isQuickAddOpen,
        openQuickAdd,
        closeQuickAdd,
        isCheckoutOpen,
        openCheckout,
        closeCheckout,
        cartItems,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}