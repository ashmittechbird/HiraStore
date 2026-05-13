import { create } from 'zustand';

export interface WishItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
}

interface WishlistStore {
  items: WishItem[];
  userKey: string;
  setUser: (email: string | null) => void;
  toggle: (item: WishItem) => void;
  has: (id: string) => boolean;
}

function storageKey(email: string | null) {
  return email ? `hs_wishlist_${email}` : 'hs_wishlist_guest';
}

function load(k: string): WishItem[] {
  try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch { return []; }
}

function save(k: string, items: WishItem[]) {
  localStorage.setItem(k, JSON.stringify(items));
}

export const useWishlist = create<WishlistStore>((set, get) => ({
  items: load('hs_wishlist_guest'),
  userKey: 'hs_wishlist_guest',

  setUser: (email) => {
    const k = storageKey(email);
    set({ items: load(k), userKey: k });
  },

  toggle: (item) => {
    const { items, userKey } = get();
    const next = items.some(x => x.id === item.id)
      ? items.filter(x => x.id !== item.id)
      : [...items, item];
    save(userKey, next);
    set({ items: next });
  },

  has: (id) => get().items.some(x => x.id === id),
}));
