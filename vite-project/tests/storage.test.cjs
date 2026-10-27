const test = require('node:test');
const assert = require('node:assert/strict');
const loadTs = require('./load-ts.cjs');
const {
  emptyProfile,
  isProfile,
  validateProfile,
  isOrderList,
  isDate,
  readStored,
  writeStored,
  readProfile,
  PROFILE_KEY,
} = loadTs('src/lib/storage.ts');
const profile = { name: 'Alice Martin', email: 'alice@example.fr', type: 'VO', pole: 'PSA' };
const order = {
  id: 'order-1',
  brand: 'Peugeot',
  model: '108',
  quantity: 2,
  supplier: 'Partner',
  expectedDate: '2030-02-28',
  createdAt: '2026-10-26T12:00:00Z',
  status: 'pending',
};
function storage(entries = {}) {
  const values = new Map(Object.entries(entries));
  global.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}
test('profile validation rejects missing or invalid fields before saving', () => {
  assert.deepEqual(validateProfile(profile), {});
  assert.equal(Object.keys(validateProfile(emptyProfile)).length, 4);
  assert.ok(
    validateProfile({ ...profile, email: 'wrong', type: 'INVALID', pole: 'unknown' }).email,
  );
  assert.equal(isProfile(null), false);
  assert.equal(isProfile({ ...profile, email: 42 }), false);
});
test('corrupt JSON, null and invalid shapes cannot crash the profile', () => {
  for (const value of ['{broken', 'null', '[]', '{"email":42}']) {
    storage({ [PROFILE_KEY]: value });
    const result = readStored(PROFILE_KEY, emptyProfile, isProfile);
    assert.equal(result.value, emptyProfile);
    assert.ok(result.error);
  }
});
test('storage denial reports a recoverable error', () => {
  global.localStorage = {
    getItem() {
      throw new Error('blocked');
    },
    setItem() {
      throw new Error('quota');
    },
  };
  assert.ok(readStored(PROFILE_KEY, emptyProfile, isProfile).error);
  assert.ok(writeStored(PROFILE_KEY, profile));
});
test('valid profile persists and legacy fields migrate without accepting invalid values', () => {
  storage();
  assert.equal(writeStored(PROFILE_KEY, profile), '');
  assert.deepEqual(readProfile().value, profile);
  storage({ content: JSON.stringify({ email: profile.email, type: 'VO', pole: 'PSA' }) });
  assert.equal(readProfile().value.email, profile.email);
  storage({ content: 'null' });
  assert.deepEqual(readProfile().value, emptyProfile);
});
test('orders reject invalid quantities, dates, duplicate identifiers and statuses', () => {
  assert.equal(isOrderList([order]), true);
  for (const change of [
    { quantity: 0 },
    { quantity: 1.5 },
    { quantity: 1000 },
    { supplier: ' ' },
    { expectedDate: '2030-02-30' },
    { status: 'unknown' },
  ]) {
    assert.equal(isOrderList([{ ...order, ...change }]), false);
  }
  assert.equal(isOrderList([order, order]), false);
  assert.equal(isOrderList(null), false);
  assert.equal(isDate('2028-02-29'), true);
  assert.equal(isDate('2027-02-29'), false);
});
