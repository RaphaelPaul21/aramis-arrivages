import { createContext, useContext } from 'react';
import type { Order, OrderStatus, Profile } from '../lib/storage';
export interface AppStore {
  profile: Profile;
  orders: Order[];
  storageError: string;
  saveProfile: (profile: Profile) => string;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => string;
  updateOrder: (id: string, status: OrderStatus) => string;
}
export const StoreContext = createContext<AppStore | null>(null);
export function useAppStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error('Le contexte de l’application est absent.');
  return store;
}
