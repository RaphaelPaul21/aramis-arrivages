export const PROFILE_KEY = 'aramis.profile.v1';
export const ORDERS_KEY = 'aramis.orders.v1';
export const POLES = [
  'PSA',
  'Renault Dacia',
  'Achats Internationaux VO',
  'Market Place',
  'Reprise',
  'Rest of the World',
] as const;
export const ORDER_STATUSES = ['pending', 'received', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export interface Profile {
  name: string;
  email: string;
  type: '' | 'VN' | 'VO';
  pole: string;
}
export interface Order {
  id: string;
  brand: string;
  model: string;
  quantity: number;
  supplier: string;
  expectedDate: string;
  createdAt: string;
  status: OrderStatus;
}
export const emptyProfile: Profile = { name: '', email: '', type: '', pole: '' };
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
export function isProfile(value: unknown): value is Profile {
  if (!isRecord(value)) return false;
  return (
    typeof value.name === 'string' &&
    typeof value.email === 'string' &&
    (value.type === '' || value.type === 'VN' || value.type === 'VO') &&
    typeof value.pole === 'string' &&
    (value.pole === '' || POLES.some((pole) => pole === value.pole))
  );
}
export function validateProfile(profile: Profile) {
  const errors: Partial<Record<keyof Profile, string>> = {};
  if (!profile.name.trim() || profile.name.trim().length > 80)
    errors.name = 'Saisissez un nom de 1 à 80 caractères.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim()))
    errors.email = 'Saisissez une adresse e-mail valide.';
  if (!['VN', 'VO'].includes(profile.type)) errors.type = 'Choisissez votre activité.';
  if (!POLES.some((pole) => pole === profile.pole)) errors.pole = 'Choisissez votre pôle.';
  return errors;
}
export function isDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function isOrder(value: unknown): value is Order {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string' &&
    !!value.id &&
    typeof value.brand === 'string' &&
    !!value.brand.trim() &&
    typeof value.model === 'string' &&
    !!value.model.trim() &&
    typeof value.quantity === 'number' &&
    Number.isInteger(value.quantity) &&
    value.quantity >= 1 &&
    value.quantity <= 999 &&
    typeof value.supplier === 'string' &&
    !!value.supplier.trim() &&
    value.supplier.length <= 120 &&
    typeof value.expectedDate === 'string' &&
    isDate(value.expectedDate) &&
    typeof value.createdAt === 'string' &&
    !Number.isNaN(Date.parse(value.createdAt)) &&
    ORDER_STATUSES.some((status) => status === value.status)
  );
}
export function isOrderList(value: unknown): value is Order[] {
  return (
    Array.isArray(value) &&
    value.every(isOrder) &&
    new Set(value.map((order) => order.id)).size === value.length
  );
}
export function readStored<T>(
  key: string,
  fallback: T,
  validate: (value: unknown) => value is T,
): { value: T; error: string } {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return { value: fallback, error: '' };
    const value: unknown = JSON.parse(stored);
    if (!validate(value)) throw new Error('invalid');
    return { value, error: '' };
  } catch {
    return {
      value: fallback,
      error:
        'Les données enregistrées sur cet appareil sont illisibles ou le stockage est indisponible.',
    };
  }
}
export function writeStored(key: string, value: unknown): string {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return '';
  } catch {
    return 'Enregistrement impossible. Vérifiez que le stockage du navigateur est autorisé et dispose d’espace.';
  }
}
export function readProfile() {
  const current = readStored(PROFILE_KEY, emptyProfile, isProfile);
  if (current.value !== emptyProfile || current.error) return current;
  try {
    const legacy = localStorage.getItem('content');
    if (legacy === null) return current;
    const value: unknown = JSON.parse(legacy);
    if (!isRecord(value)) return current;
    const candidate = { name: '', email: value.email, type: value.type, pole: value.pole };
    return isProfile(candidate) ? { value: candidate, error: '' } : current;
  } catch {
    return current;
  }
}
export const localToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};
