import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  qty: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => set((state) => {
        const existing = state.items.find(c => c.id === item.id);
        if (existing) {
          return {
            items: state.items.map(c =>
              c.id === item.id ? { ...c, qty: Math.min(c.qty + 1, 10) } : c
            ),
          };
        }
        return { items: [...state.items, { ...item, qty: 1 }] };
      }),

      removeItem: (id) => set((state) => ({
        items: state.items.filter(c => c.id !== id),
      })),

      updateQty: (id, qty) => set((state) => ({
        items: qty <= 0
          ? state.items.filter(c => c.id !== id)
          : state.items.map(c => c.id === id ? { ...c, qty: Math.min(qty, 10) } : c),
      })),

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((s, c) => s + c.qty, 0),

      totalPrice: () => get().items.reduce((s, c) => s + c.price * c.qty, 0),
    }),
    { name: 'hirastore_cart', version: 1 }
  )
);
