import type { Vehicle } from './inventory';
function cell(value: string | number) {
  const text = String(value);
  const safe = /^[=+@-]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}
export function downloadVehicles(vehicles: Vehicle[], filename: string) {
  const rows: (string | number)[][] = [
    [
      'Identifiant',
      'Marque',
      'Modèle',
      'Type',
      'Étape',
      'Énergie',
      'Boîte',
      'Kilométrage',
      'Prix EUR',
    ],
  ];
  vehicles.forEach((vehicle) =>
    rows.push([
      vehicle.id,
      vehicle.brand,
      vehicle.model,
      vehicle.type,
      vehicle.stage,
      vehicle.energy,
      vehicle.gearbox,
      vehicle.km,
      vehicle.price ?? 'À confirmer',
    ]),
  );
  const content = '\uFEFF' + rows.map((row) => row.map(cell).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
