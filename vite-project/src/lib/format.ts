export const number = (value: number) => new Intl.NumberFormat('fr-FR').format(value);
export const money = (value: number) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
export const date = (value: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(value.length === 10 ? `${value}T12:00:00` : value),
  );
