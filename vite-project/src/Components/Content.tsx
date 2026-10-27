import { useSearchParams, Link } from 'react-router-dom';
import { useAppStore } from '../context/store';
import { brands, inventory, models } from '../lib/data';
import { isReady, modelPath, normalize } from '../lib/inventory';
import { number } from '../lib/format';
import { downloadVehicles } from '../lib/export';
import SearchBar from './searchBar';
import ModelList from './List';
import HistoricItems from './HistoricItems';
import Icon from './Icon';
import Peugeot from '../assets/Images/peugeot.svg';
import Citroen from '../assets/Images/citroen.svg';
import Renault from '../assets/Images/Renault.svg';
import Skoda from '../assets/Images/skoda.svg';
const favorites = [
  { name: 'Peugeot', logo: Peugeot },
  { name: 'Citroën', logo: Citroen },
  { name: 'Renault', logo: Renault },
  { name: 'Skoda', logo: Skoda },
];
const PAGE_SIZE = 10;
export default function Content() {
  const [params, setParams] = useSearchParams();
  const { profile, orders } = useAppStore();
  const search = params.get('q') ?? '';
  const brand = params.get('marque') ?? '';
  const sort = params.get('tri') ?? 'volume';
  const filtered = models.filter(
    (model) =>
      (!brand || model.brand === brand) &&
      normalize(`${model.brand} ${model.model}`).includes(normalize(search)),
  );
  const sorted = [...filtered].sort((a, b) =>
    sort === 'nom'
      ? a.brand.localeCompare(b.brand, 'fr') ||
        a.model.localeCompare(b.model, 'fr', { numeric: true })
      : sort === 'faible'
        ? a.count - b.count || a.model.localeCompare(b.model)
        : b.count - a.count || a.model.localeCompare(b.model),
  );
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const requestedPage = Number(params.get('page')) || 1;
  const page = Math.max(1, Math.min(pages, Math.floor(requestedPage)));
  const visible = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const scopedVehicles = filtered.flatMap((model) => model.vehicles);
  const lowArrivals = [...models]
    .sort((a, b) => a.count - b.count || a.brand.localeCompare(b.brand))
    .slice(0, 3);
  const pending = orders.filter((order) => order.status === 'pending');
  function filter(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setParams(next, { replace: true });
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">VOTRE PARC, EN UN COUP D’ŒIL</p>
          <h1>
            Bonjour{profile.name ? `, ${profile.name.split(' ')[0]}` : ''}
            <span className="heading-dot">.</span>
          </h1>
          <p className="page-description">
            Une vue claire sur vos arrivages et vos prochaines commandes.
          </p>
        </div>
        <Link className="button primary" to="/commandes/nouvelle">
          <Icon name="plus" />
          Nouvelle commande
        </Link>
      </div>
      <div className="stats-grid" aria-label="Indicateurs de l’inventaire complet">
        <article className="stat-card featured">
          <span className="stat-label">
            <Icon name="car" />
            Véhicules en arrivage
          </span>
          <strong>{number(inventory.vehicles.length)}</strong>
          <span>Véhicules uniques dans l’import</span>
          <div className="stat-decoration" aria-hidden="true" />
        </article>
        <article className="stat-card">
          <span className="stat-label">
            <Icon name="grid" />
            Modèles représentés
          </span>
          <strong>{number(models.length)}</strong>
          <span>Répartis sur {brands.length} marques</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">
            <Icon name="check" />
            Préparation terminée
          </span>
          <strong>{number(inventory.vehicles.filter(isReady).length)}</strong>
          <span>Dans le périmètre des arrivages</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">
            <Icon name="box" />
            Commandes en cours
          </span>
          <strong>{number(pending.length)}</strong>
          <Link className="text-link" to="/commandes">
            {number(pending.reduce((sum, order) => sum + order.quantity, 0))} véhicules à suivre{' '}
            <Icon name="arrow" />
          </Link>
        </article>
      </div>
      <div className="dashboard-layout">
        <section className="panel inventory-panel" aria-labelledby="inventory-heading">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">EXPLORER LE PARC</p>
              <h2 id="inventory-heading">Les modèles en arrivage</h2>
            </div>
            <button
              className="button subtle small"
              disabled={!scopedVehicles.length}
              onClick={() => downloadVehicles(scopedVehicles, 'arrivages')}
            >
              <Icon name="download" />
              Exporter
            </button>
          </div>
          <div className="brand-filters" aria-label="Filtrer par marque">
            <button
              className={brand === '' ? 'brand-filter active' : 'brand-filter'}
              aria-pressed={brand === ''}
              onClick={() => filter('marque', '')}
            >
              <Icon name="grid" />
              <span>Toutes les marques</span>
            </button>
            {favorites.map((item) => (
              <button
                key={item.name}
                className={brand === item.name ? 'brand-filter active' : 'brand-filter'}
                aria-pressed={brand === item.name}
                onClick={() => filter('marque', brand === item.name ? '' : item.name)}
              >
                <img src={item.logo} alt="" />
                <span>{item.name}</span>
              </button>
            ))}
          </div>
          <div className="filter-toolbar">
            <SearchBar value={search} onChange={(value) => filter('q', value)} />
            <label className="select-field">
              <span className="sr-only">Marque</span>
              <select value={brand} onChange={(event) => filter('marque', event.target.value)}>
                <option value="">Toutes les marques</option>
                {brands.map((item) => (
                  <option key={item}>{item}</option>
                ))}
                {brand && !brands.includes(brand) && <option value={brand}>{brand}</option>}
              </select>
            </label>
            <label className="select-field">
              <span className="sr-only">Trier les modèles</span>
              <select value={sort} onChange={(event) => filter('tri', event.target.value)}>
                <option value="volume">Volume décroissant</option>
                <option value="faible">Volume croissant</option>
                <option value="nom">Ordre alphabétique</option>
              </select>
            </label>
          </div>
          <div className="results-summary">
            <span role="status">
              {number(filtered.length)} modèles · {number(scopedVehicles.length)} véhicules
            </span>
            {(search || brand) && (
              <button className="text-button" onClick={() => setParams({})}>
                Effacer les filtres
              </button>
            )}
          </div>
          {visible.length ? (
            <ModelList models={visible} />
          ) : (
            <div className="empty-state">
              <Icon name="search" />
              <h3>Aucun modèle trouvé</h3>
              <p>Essayez un autre nom ou retirez les filtres.</p>
              <button className="button secondary" onClick={() => setParams({})}>
                Afficher tous les modèles
              </button>
            </div>
          )}
          {sorted.length > 0 && (
            <nav className="pagination" aria-label="Pagination des modèles">
              <span>
                Page {page} sur {pages}
              </span>
              <div>
                <button
                  className="button subtle small"
                  disabled={page === 1}
                  onClick={() => {
                    const next = new URLSearchParams(params);
                    next.set('page', String(page - 1));
                    setParams(next);
                  }}
                >
                  Précédent
                </button>
                <button
                  className="button subtle small"
                  disabled={page === pages}
                  onClick={() => {
                    const next = new URLSearchParams(params);
                    next.set('page', String(page + 1));
                    setParams(next);
                  }}
                >
                  Suivant <Icon name="arrow" />
                </button>
              </div>
            </nav>
          )}
        </section>
        <aside className="dashboard-aside">
          <section className="panel attention-panel">
            <span className="eyebrow">À SURVEILLER</span>
            <h2>Les arrivages les plus faibles</h2>
            <p className="muted">Les modèles les moins représentés dans l’import.</p>
            <div className="low-models">
              {lowArrivals.map((model) => (
                <Link
                  className="low-model"
                  to={modelPath(model.brand, model.model)}
                  key={model.key}
                >
                  <span className="model-symbol">
                    <Icon name="car" />
                  </span>
                  <span>
                    <small>{model.brand}</small>
                    <strong>{model.model}</strong>
                    <span className="muted">{model.count} véhicule en arrivage</span>
                  </span>
                  <Icon name="arrow" />
                </Link>
              ))}
            </div>
            <button
              className="text-link text-button"
              onClick={() => {
                setParams({ tri: 'faible' });
                document
                  .getElementById('inventory-heading')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              Voir tous les modèles <Icon name="arrow" />
            </button>
          </section>
          <section className="source-card">
            <span className="source-dot" />
            <p className="eyebrow">LE BON PÉRIMÈTRE</p>
            <h3>Des arrivages, véhicule par véhicule.</h3>
            <p>
              Cet import ne fournit ni stock disponible ni données de marché. Les chiffres présentés
              couvrent uniquement les arrivages.
            </p>
            <details>
              <summary>À propos des données</summary>
              <p>
                {number(inventory.quality.sourceRows)} lignes,{' '}
                {number(inventory.quality.duplicates)} répétitions regroupées et{' '}
                {inventory.quality.excluded} fiches à supprimer exclues. Chaque véhicule est compté
                une seule fois. Les prix contradictoires restent à confirmer.
              </p>
            </details>
          </section>
        </aside>
      </div>
      <HistoricItems />
    </>
  );
}
