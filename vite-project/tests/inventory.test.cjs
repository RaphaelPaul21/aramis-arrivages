const test = require('node:test');
const assert = require('node:assert/strict');
const loadTs = require('./load-ts.cjs');
const { prepareInventory, summarizeModels, stageCounts, modelPath, normalize } =
  loadTs('src/lib/inventory.ts');
const raw = require('../data/aramis-auto/stock-arrivage.json');
const inventory = prepareInventory(raw);

test('the source counts vehicles once and excludes removal records', () => {
  assert.equal(inventory.quality.sourceRows, 4338);
  assert.equal(inventory.quality.uniqueIds, 2288);
  assert.equal(inventory.quality.excluded, 6);
  assert.equal(inventory.vehicles.length, 2282);
  assert.equal(new Set(inventory.vehicles.map((row) => row.id)).size, inventory.vehicles.length);
});
test('the Peugeot 108 inventory contains seven distinct vehicles, not fourteen rows', () => {
  const model = summarizeModels(inventory.vehicles).find(
    (model) => model.brand === 'Peugeot' && model.model === '108',
  );
  assert.equal(model.count, 7);
  assert.equal(
    stageCounts(model.vehicles).reduce((sum, item) => sum + item.value, 0),
    7,
  );
});
test('all transport and transit stages contribute to totals', () => {
  const stages = stageCounts(inventory.vehicles);
  assert.equal(
    stages.reduce((sum, item) => sum + item.value, 0),
    inventory.vehicles.length,
  );
  assert.ok(stages.some((item) => item.name === 'Transport Programmé' && item.value > 0));
  assert.ok(stages.some((item) => item.name === 'Arrivé en transit' && item.value > 0));
});
test('singleton models produce numeric chart values', () => {
  const karoq = summarizeModels(inventory.vehicles).find((model) => model.model === 'Karoq');
  assert.equal(karoq.count, 1);
  const data = stageCounts(karoq.vehicles);
  assert.ok(data.every((item) => typeof item.value === 'number' && Number.isFinite(item.value)));
  assert.equal(
    data.reduce((sum, item) => sum + item.value, 0),
    1,
  );
});
test('conflicting prices are not presented as confirmed prices', () => {
  assert.equal(inventory.vehicles.find((row) => row.id === 773377).price, null);
});
test('one vehicle with alternate model names cannot appear in two model totals', () => {
  const original = raw[0];
  const result = prepareInventory([original, { ...original, VEHICULE_MODELE: 'Alternate' }]);
  assert.equal(result.vehicles.length, 1);
  assert.equal(result.vehicles[0].model, String(original.VEHICULE_MODELE));
  assert.equal(
    summarizeModels(result.vehicles).reduce((sum, row) => sum + row.count, 0),
    1,
  );
});
test('unknown stages are retained and model names are brand-scoped', () => {
  const a = {
    ...raw[0],
    VEHICULE_ID: 1,
    VEHICULE_MODELE: 'Shared',
    VEHICULE_MARQUE: 'One',
    STATUT_VEHICULE_ROBUSTO: 'New stage',
  };
  const b = { ...a, VEHICULE_ID: 2, VEHICULE_MARQUE: 'Two' };
  const result = prepareInventory([a, b]);
  assert.equal(summarizeModels(result.vehicles).length, 2);
  assert.equal(stageCounts(result.vehicles).find((row) => row.name === 'New stage').value, 2);
});
test('accent-insensitive search and encoded route segments handle real model labels', () => {
  assert.equal(normalize('  CITROËN  '), 'citroen');
  assert.equal(modelPath('Citroën', 'C4 / X'), '/modeles/Citro%C3%ABn/C4%20%2F%20X');
});
test('empty inventories have valid zero totals', () => {
  assert.equal(prepareInventory([]).vehicles.length, 0);
  assert.deepEqual(summarizeModels([]), []);
  assert.ok(stageCounts([]).every((row) => row.value === 0));
});
