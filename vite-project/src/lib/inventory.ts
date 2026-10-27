export interface RawVehicle {
  VEHICULE_ID: number;
  VEHICULE_MARQUE: string;
  VEHICULE_MODELE: string | number;
  VEHICULE_TYPE: string;
  REC_BOITE: string;
  REC_ENERGIE: string;
  VEHICULE_POLE: string;
  VEHICULE_KM: number;
  PRIX_VENTE: number;
  STATUT_VEHICULE_ROBUSTO: string;
}
export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  type: string;
  energy: string;
  gearbox: string;
  pole: string;
  km: number;
  price: number | null;
  stage: string;
}
export interface ModelSummary {
  key: string;
  brand: string;
  model: string;
  count: number;
  ready: number;
  vehicles: Vehicle[];
}
export const STAGES = [
  'Confirmé fournisseur',
  'Reprise effective',
  'Arrivé fournisseur',
  'En cours de préparation',
  'Préparation effectuée. VH prêt',
  'Transport Programmé',
  'En cours de transport',
  'Arrivé en transit',
  'Arrivée intermédiaire',
  'Arrivé Aramis',
];
export const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('fr')
    .trim();
export const modelKey = (brand: string, model: string) => JSON.stringify([brand, model]);
export const modelPath = (brand: string, model: string) =>
  `/modeles/${encodeURIComponent(brand)}/${encodeURIComponent(model)}`;
export const isReady = (vehicle: Vehicle) => vehicle.stage === 'Préparation effectuée. VH prêt';

export function prepareInventory(rows: RawVehicle[]) {
  const groups = new Map<number, RawVehicle[]>();
  for (const row of rows) {
    const group = groups.get(row.VEHICULE_ID) ?? [];
    group.push(row);
    groups.set(row.VEHICULE_ID, group);
  }
  const vehicles: Vehicle[] = [];
  let excluded = 0;
  let conflicts = 0;
  for (const group of groups.values()) {
    // No source timestamp: keep the first valid label, never invent a "latest" record.
    const row =
      group.find((item) => item.VEHICULE_MODELE && String(item.VEHICULE_MODELE).trim()) ?? group[0];
    if (row.STATUT_VEHICULE_ROBUSTO === 'A Supprimer') {
      excluded++;
      continue;
    }
    const prices = new Set(group.map((item) => item.PRIX_VENTE));
    if (new Set(group.map((item) => JSON.stringify(item))).size > 1) conflicts++;
    vehicles.push({
      id: row.VEHICULE_ID,
      brand: row.VEHICULE_MARQUE.trim(),
      model: row.VEHICULE_MODELE ? String(row.VEHICULE_MODELE).trim() : 'Modèle non renseigné',
      type: row.VEHICULE_TYPE,
      energy: row.REC_ENERGIE.replace(/^\d+\.\s*/, ''),
      gearbox: row.REC_BOITE,
      pole: row.VEHICULE_POLE,
      km: row.VEHICULE_KM,
      price: prices.size === 1 ? row.PRIX_VENTE : null,
      stage: row.STATUT_VEHICULE_ROBUSTO,
    });
  }
  return {
    vehicles,
    quality: {
      sourceRows: rows.length,
      uniqueIds: groups.size,
      duplicates: rows.length - groups.size,
      excluded,
      conflicts,
    },
  };
}
export function summarizeModels(vehicles: Vehicle[]): ModelSummary[] {
  const models = new Map<string, ModelSummary>();
  for (const vehicle of vehicles) {
    const key = modelKey(vehicle.brand, vehicle.model);
    const model = models.get(key) ?? {
      key,
      brand: vehicle.brand,
      model: vehicle.model,
      count: 0,
      ready: 0,
      vehicles: [],
    };
    model.count++;
    if (isReady(vehicle)) model.ready++;
    model.vehicles.push(vehicle);
    models.set(key, model);
  }
  return [...models.values()].sort(
    (a, b) =>
      a.brand.localeCompare(b.brand, 'fr') ||
      a.model.localeCompare(b.model, 'fr', { numeric: true }),
  );
}
export function countBy(vehicles: Vehicle[], field: 'stage' | 'energy' | 'gearbox') {
  const counts = new Map<string, number>();
  vehicles.forEach((vehicle) => counts.set(vehicle[field], (counts.get(vehicle[field]) ?? 0) + 1));
  return [...counts].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}
export function stageCounts(vehicles: Vehicle[]) {
  const counts = new Map(countBy(vehicles, 'stage').map((item) => [item.name, item.value]));
  const labels = [
    ...STAGES,
    ...[...counts.keys()].filter((stage) => !STAGES.includes(stage)).sort(),
  ];
  return labels.map((name) => ({ name, value: counts.get(name) ?? 0 }));
}
