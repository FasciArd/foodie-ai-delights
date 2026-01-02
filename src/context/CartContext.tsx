import React, { createContext, useContext, useState, useCallback } from 'react';
import { CartItem, MenuItem } from '@/types';
import { toast } from 'sonner';

interface CartContextType {
  items: CartItem[];
  addItem: (menuItem: MenuItem) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  totalCalories: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((menuItem: MenuItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.menuItem.id === menuItem.id);
      if (existingItem) {
        toast.success(`Added another ${menuItem.name} to cart`);
        return prevItems.map((item) =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      toast.success(`${menuItem.name} added to cart`);
      return [...prevItems, { menuItem, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((menuItemId: string) => {
    setItems((prevItems) => {
      const item = prevItems.find((i) => i.menuItem.id === menuItemId);
      if (item) {
        toast.info(`${item.menuItem.name} removed from cart`);
      }
      return prevItems.filter((item) => item.menuItem.id !== menuItemId);
    });
  }, []);

  const updateQuantity = useCallback((menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.menuItem.id === menuItemId ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    toast.info('Cart cleared');
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );
  const totalCalories = items.reduce(
    (sum, item) => sum + (item.menuItem.calories || 0) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        totalCalories,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
