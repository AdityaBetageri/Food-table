import React, { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [tableNumber, setTableNumber] = useState(null);

  const addItem = useCallback((menuItem, qty = 1, notes = '') => {
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === menuItem._id && i.notes === notes);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === menuItem._id && i.notes === notes
            ? { ...i, qty: i.qty + qty }
            : i
        );
      }
      return [
        ...prev,
        {
          menuItemId: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          image: menuItem.image,
          qty,
          notes,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((menuItemId, notes = '') => {
    setItems((prev) => prev.filter((i) => !(i.menuItemId === menuItemId && i.notes === notes)));
  }, []);

  const updateQty = useCallback((menuItemId, qty, notes = '') => {
    if (qty <= 0) {
      removeItem(menuItemId, notes);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.menuItemId === menuItemId && i.notes === notes ? { ...i, qty } : i
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        tableNumber,
        setTableNumber,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

export { CartContext };