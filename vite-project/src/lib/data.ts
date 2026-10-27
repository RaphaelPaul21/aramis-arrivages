import rawData from '@data/aramis-auto/stock-arrivage.json';
import { prepareInventory, summarizeModels } from './inventory';

// stock-vente.json duplicates arrivals; it cannot represent available stock.
export const inventory = prepareInventory(rawData);
export const models = summarizeModels(inventory.vehicles);
export const brands = [...new Set(inventory.vehicles.map((vehicle) => vehicle.brand))].sort(
  (a, b) => a.localeCompare(b, 'fr'),
);
