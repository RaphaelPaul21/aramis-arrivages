import assert from 'node:assert/strict';
import { connect } from './browser-client.mjs';
const browser = await connect();
const { evaluate, navigate, input, click, clickText, waitFor } = browser;
let checks = 0;
function check(value, message) {
  assert.ok(value, message);
  checks++;
  console.log('PASS ' + message);
}
try {
  await browser.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await navigate('/');
  // Only the isolated test browser's application keys are reset.
  await evaluate(
    "localStorage.removeItem('aramis.profile.v1'); localStorage.removeItem('aramis.orders.v1'); localStorage.removeItem('content')",
  );
  await navigate('/');
  check(
    await evaluate(
      "document.querySelector('.stat-card.featured strong').textContent.replace(/\\s/g,'') === '2282'",
    ),
    'unique active vehicle total',
  );
  await browser.screenshot('dashboard-desktop', 1440, 1000);
  await input('#model-search', '108');
  await waitFor("document.querySelectorAll('.model-table tbody tr').length === 1");
  check(
    await evaluate("document.querySelector('.model-table tbody td strong').textContent === '7'"),
    'search and deduplicated Peugeot 108 total',
  );
  await click('.model-link');
  await waitFor("location.pathname.includes('/modeles/Peugeot/108')");
  check(
    await evaluate("document.querySelector('.stat-card.featured strong').textContent === '7'"),
    'model link opens correct details',
  );
  const nextKey = await evaluate(
    "[...document.querySelectorAll('.heading-actions select option')].find(node => node.textContent === 'Peugeot 508 SW').value",
  );
  await input('.heading-actions select', nextKey);
  await waitFor("document.querySelector('h1').textContent.includes('508 SW')");
  check(
    await evaluate("document.querySelector('.stat-card.featured strong').textContent === '3'"),
    'model change refreshes counts without stale state',
  );
  await click('.heading-actions .primary');
  await waitFor("!!document.querySelector('#order-model')");
  check(
    await evaluate(
      "document.querySelector('#order-model').selectedOptions[0].textContent === '508 SW'",
    ),
    'order form inherits selected model',
  );
  await input('#order-supplier', 'Fournisseur de test');
  await input('#order-quantity', '3');
  await input('#order-date', '2030-12-20');
  await click('form button[type=submit]');
  await waitFor("location.pathname === '/commandes'");
  check(
    await evaluate("JSON.parse(localStorage.getItem('aramis.orders.v1'))[0].quantity === 3"),
    'new order persisted',
  );
  await clickText('Réceptionner');
  await clickText('Confirmer');
  await waitFor("JSON.parse(localStorage.getItem('aramis.orders.v1'))[0].status === 'received'");
  check(true, 'order reception workflow');
  await clickText('Nouvelle commande');
  await waitFor("!!document.querySelector('#order-brand')");
  await input('#order-brand', 'Peugeot');
  const orderModel = await evaluate(
    "[...document.querySelectorAll('#order-model option')].find(node => node.textContent === '108').value",
  );
  await input('#order-model', orderModel);
  await input('#order-supplier', 'Second partenaire');
  await input('#order-date', '2030-12-21');
  await click('form button[type=submit]');
  await waitFor("location.pathname === '/commandes'");
  check(
    await evaluate("document.querySelector('[role=status]').textContent.includes('créée')"),
    'new order success message is not stale',
  );
  await click('.row-actions .danger-text');
  await clickText('Confirmer');
  await waitFor("JSON.parse(localStorage.getItem('aramis.orders.v1'))[0].status === 'cancelled'");
  check(true, 'order cancellation workflow');
  await click('a[aria-label="Mon profil"]');
  await waitFor("!!document.querySelector('#profile-name')");
  await input('#profile-name', 'Alice Martin');
  await input('#profile-email', 'invalid');
  await click('form button[type=submit]');
  check(
    await evaluate(
      "!!document.querySelector('#email-error') && localStorage.getItem('aramis.profile.v1') === null",
    ),
    'invalid profile is not saved',
  );
  await input('#profile-email', 'alice@example.fr');
  await input('#profile-type', 'VO');
  await input('#profile-pole', 'PSA');
  await click('form button[type=submit]');
  await waitFor("!!localStorage.getItem('aramis.profile.v1')");
  check(
    await evaluate("document.querySelector('.profile-name').textContent.includes('Alice Martin')"),
    'saved profile updates navigation',
  );
  await navigate('/');
  check(
    await evaluate("document.querySelector('h1').textContent.includes('Alice')"),
    'profile persists after reload',
  );
  await input('#model-search', 'no-such-model');
  await waitFor("!!document.querySelector('.empty-state')");
  check(
    await evaluate("document.querySelectorAll('.model-table tbody tr').length === 0"),
    'no-result search has recovery action',
  );
  await clickText('Afficher tous les modèles');
  await waitFor("!!document.querySelector('.model-table')");
  check(
    await evaluate("document.querySelectorAll('.model-table tbody tr').length === 10"),
    'reset filters restores model list',
  );
  await clickText('Suivant');
  await waitFor("new URLSearchParams(location.search).get('page') === '2'");
  check(
    await evaluate("document.querySelector('.pagination').textContent.includes('Page 2')"),
    'model pagination advances',
  );
  await clickText('Peugeot');
  await waitFor("new URLSearchParams(location.search).get('marque') === 'Peugeot'");
  check(
    await evaluate(
      "[...document.querySelectorAll('.model-link small')].every(node => node.textContent === 'Peugeot')",
    ),
    'brand button filters models',
  );
  await click('.model-link');
  await waitFor("location.pathname.startsWith('/modeles/')");
  await evaluate('history.back()');
  await waitFor(
    "location.pathname === '/' && new URLSearchParams(location.search).get('marque') === 'Peugeot'",
  );
  check(true, 'browser back preserves filters');
  await navigate('/PageModele/108');
  await waitFor("location.pathname === '/modeles/Peugeot/108'");
  check(true, 'legacy model URL redirects');
  await browser.screenshot('model-desktop', 1440, 1000);
  await click('.stage-button');
  await waitFor("!!document.querySelector('.vehicle-filters select').value");
  check(
    await evaluate("!!document.querySelector('.empty-state')"),
    'zero-count stage has an empty state',
  );
  await clickText('Afficher tous les véhicules');
  await waitFor("document.querySelectorAll('.vehicle-table tbody tr').length === 7");
  check(true, 'stage filter can be reset');
  await navigate('/Profile/');
  await waitFor("location.pathname === '/profil'");
  check(true, 'legacy profile URL redirects');
  await evaluate("localStorage.setItem('aramis.profile.v1', 'null')");
  await navigate('/profil');
  check(
    await evaluate("!!document.querySelector('form') && !!document.querySelector('[role=alert]')"),
    'corrupted profile recovers without crashing',
  );
  await navigate('/modeles/Unknown/Missing');
  check(
    await evaluate("document.querySelector('h1').textContent.includes('inventaire')"),
    'unknown model has not-found page',
  );
  await navigate('/missing-page');
  check(
    await evaluate("document.querySelector('.eyebrow').textContent.includes('404')"),
    'unknown route has 404 recovery',
  );
  for (const width of [375, 768, 1024]) {
    await browser.send('Emulation.setDeviceMetricsOverride', {
      width,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });
    for (const route of [
      '/',
      '/modeles/Peugeot/108',
      '/profil',
      '/commandes',
      '/commandes/nouvelle',
    ]) {
      await navigate(route);
      const dimensions = await evaluate(
        '({viewport: innerWidth, page: document.documentElement.scrollWidth})',
      );
      check(
        dimensions.page <= dimensions.viewport + 1,
        `no page overflow at ${width}px on ${route}: ${JSON.stringify(dimensions)}`,
      );
    }
  }
  await navigate('/');
  await browser.screenshot('dashboard-mobile', 375, 900);
  await navigate('/modeles/Peugeot/108');
  await browser.screenshot('model-mobile', 375, 900);
  check(browser.errors.length === 0, 'no browser runtime exceptions: ' + browser.errors.join('; '));
  console.log(`${checks} browser checks passed.`);
} finally {
  browser.close();
}
