import { useState, type ReactNode } from 'react';
import { StoreContext } from './store';
import {
  isOrder,
  isOrderList,
  ORDERS_KEY,
  PROFILE_KEY,
  readProfile,
  readStored,
  validateProfile,
  writeStored,
  type Order,
  type OrderStatus,
  type Profile,
} from '../lib/storage';
export default function AppProvider({ children }: { children: ReactNode }) {
  const [initialProfile] = useState(readProfile);
  const [initialOrders] = useState(() => readStored<Order[]>(ORDERS_KEY, [], isOrderList));
  const [profile, setProfile] = useState(initialProfile.value);
  const [orders, setOrders] = useState(initialOrders.value);
  const [storageError, setStorageError] = useState(initialProfile.error || initialOrders.error);
  function saveProfile(value: Profile) {
    const clean = { ...value, name: value.name.trim(), email: value.email.trim() };
    if (Object.keys(validateProfile(clean)).length)
      return 'Corrigez les champs indiqués avant d’enregistrer.';
    const error = writeStored(PROFILE_KEY, clean);
    if (!error) {
      setProfile(clean);
      setStorageError('');
    }
    return error;
  }
  function addOrder(value: Omit<Order, 'id' | 'createdAt' | 'status'>) {
    const order: Order = {
      ...value,
      supplier: value.supplier.trim(),
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    if (!isOrder(order)) return 'Vérifiez les informations de la commande.';
    const next = [order, ...orders];
    const error = writeStored(ORDERS_KEY, next);
    if (!error) {
      setOrders(next);
      setStorageError('');
    }
    return error;
  }
  function updateOrder(id: string, status: OrderStatus) {
    const order = orders.find((item) => item.id === id);
    if (!order || order.status !== 'pending' || status === 'pending')
      return 'Cette commande ne peut plus être modifiée.';
    const next = orders.map((item) => (item.id === id ? { ...item, status } : item));
    const error = writeStored(ORDERS_KEY, next);
    if (!error) {
      setOrders(next);
      setStorageError('');
    }
    return error;
  }
  return (
    <StoreContext.Provider
      value={{ profile, orders, storageError, saveProfile, addOrder, updateOrder }}
    >
      {children}
    </StoreContext.Provider>
  );
}
