import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { models } from '../lib/data';
import { isReady, modelPath, normalize, stageCounts } from '../lib/inventory';
import { money, number } from '../lib/format';
import { downloadVehicles } from '../lib/export';
import NotFound from '../Pages/NotFound';
import Icon from './Icon';
import RadarChart from './RadarChart';
import BarChartStock from './BarChartStock';
import DistributionChart from './BarChart';
export default function ContentPageModele() {
  const { marque = '', modele = '' } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const model = models.find(
    (item) =>
      normalize(item.brand) === normalize(marque) && normalize(item.model) === normalize(modele),
  );
  if (!model) return <NotFound model />;
  const stage = params.get('etape') ?? '';
  const type = params.get('type') ?? '';
  const vehicles = model.vehicles;
  const filtered = vehicles.filter(
    (vehicle) => (!stage || vehicle.stage === stage) && (!type || vehicle.type === type),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 10));
  const page = Math.max(1, Math.min(pages, Math.floor(Number(params.get('page')) || 1)));
  const ready = vehicles.filter(isReady).length;
  const siblingModels = models.filter((item) => item.brand === model.brand);
  const orderQuery = new URLSearchParams({ marque: model.brand, modele: model.model });
  function filter(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setParams(next, { replace: true });
  }
  return (
    <>
      <nav className="breadcrumbs" aria-label="Fil d’Ariane">
        <Link to="/">Vue d’ensemble</Link>
        <span>/</span>
        <Link to={`/?marque=${encodeURIComponent(model.brand)}`}>{model.brand}</Link>
        <span>/</span>
        <span aria-current="page">{model.model}</span>
      </nav>
      <div className="page-heading">
        <div>
          <p className="eyebrow">FICHE MODÈLE · {model.brand.toUpperCase()}</p>
          <h1>
            {model.brand} <span className="accent-text">{model.model}</span>
          </h1>
          <p className="page-description">
            Suivez chaque véhicule, de la confirmation à l’arrivée.
          </p>
        </div>
        <div className="heading-actions">
          <Link className="button primary" to={`/commandes/nouvelle?${orderQuery}`}>
            <Icon name="plus" />
            Créer une commande
          </Link>
          <label className="select-field">
            <span className="sr-only">Changer de modèle</span>
            <select
              value={model.key}
              onChange={(event) => {
                const next = models.find((item) => item.key === event.target.value);
                if (next) navigate(modelPath(next.brand, next.model));
              }}
            >
              {siblingModels.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.brand} {item.model}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="stats-grid detail-stats">
        <article className="stat-card featured">
          <span className="stat-label">
            <Icon name="car" />
            Véhicules en arrivage
          </span>
          <strong>{number(vehicles.length)}</strong>
          <span>Dans l’import fourni</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">
            <Icon name="check" />
            Préparation terminée
          </span>
          <strong>{number(ready)}</strong>
          <span>{Math.round((ready / vehicles.length) * 100)} % des arrivages du modèle</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">
            <Icon name="car" />
            Véhicules neufs
          </span>
          <strong>{number(vehicles.filter((vehicle) => vehicle.type === 'VN').length)}</strong>
          <span>Type VN</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">
            <Icon name="car" />
            Véhicules d’occasion
          </span>
          <strong>{number(vehicles.filter((vehicle) => vehicle.type === 'VO').length)}</strong>
          <span>Type VO</span>
        </article>
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">DU FOURNISSEUR À ARAMIS</p>
            <h2>Où en sont les véhicules ?</h2>
            <p className="muted">Sélectionnez une étape pour filtrer la liste des véhicules.</p>
          </div>
          <span className="badge blue">Toutes les étapes</span>
        </div>
        <div className="stages-layout">
          <BarChartStock
            vehicles={vehicles}
            active={stage}
            onSelect={(value) => filter('etape', value)}
          />
          <RadarChart vehicles={vehicles} />
        </div>
      </section>
      <div className="distribution-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">MOTORISATIONS</p>
              <h2>Répartition par énergie</h2>
            </div>
            <span className="badge neutral">{vehicles.length} véhicules</span>
          </div>
          <DistributionChart vehicles={vehicles} field="energy" />
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">TRANSMISSIONS</p>
              <h2>Répartition des boîtes</h2>
            </div>
          </div>
          <DistributionChart vehicles={vehicles} field="gearbox" />
        </section>
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">LE DÉTAIL DU PARC</p>
            <h2>Les véhicules du modèle</h2>
          </div>
          <button
            className="button subtle small"
            disabled={!filtered.length}
            onClick={() => downloadVehicles(filtered, `arrivages-${model.brand}-${model.model}`)}
          >
            <Icon name="download" />
            Exporter
          </button>
        </div>
        <div className="filter-toolbar vehicle-filters">
          <label className="select-field">
            <span>Étape</span>
            <select value={stage} onChange={(event) => filter('etape', event.target.value)}>
              <option value="">Toutes les étapes</option>
              {stageCounts(vehicles).map((item) => (
                <option key={item.name}>{item.name}</option>
              ))}
            </select>
          </label>
          <label className="select-field">
            <span>Type de véhicule</span>
            <select value={type} onChange={(event) => filter('type', event.target.value)}>
              <option value="">Tous les types</option>
              <option value="VN">Neuf (VN)</option>
              <option value="VO">Occasion (VO)</option>
            </select>
          </label>
          {(stage || type) && (
            <button className="text-button" onClick={() => setParams({})}>
              Effacer les filtres
            </button>
          )}
          <span className="muted" role="status">
            {number(filtered.length)} véhicule{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
        {filtered.length ? (
          <div className="table-scroll">
            <table className="data-table vehicle-table">
              <thead>
                <tr>
                  <th scope="col">Véhicule</th>
                  <th scope="col">Étape actuelle</th>
                  <th scope="col">Énergie / boîte</th>
                  <th scope="col">Kilométrage</th>
                  <th scope="col">Prix de vente</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice((page - 1) * 10, page * 10).map((vehicle) => (
                  <tr key={vehicle.id}>
                    <th scope="row">
                      #{vehicle.id}
                      <small className="table-secondary">
                        {vehicle.type === 'VN' ? 'Neuf' : 'Occasion'}
                      </small>
                    </th>
                    <td>
                      <span className={isReady(vehicle) ? 'badge green' : 'badge neutral'}>
                        {vehicle.stage}
                      </span>
                    </td>
                    <td>
                      {vehicle.energy}
                      <small className="table-secondary">{vehicle.gearbox}</small>
                    </td>
                    <td>{number(vehicle.km)} km</td>
                    <td>
                      {vehicle.price === null ? (
                        <span
                          className="muted"
                          title="Plusieurs prix différents figurent dans l’import pour ce véhicule."
                        >
                          À confirmer
                        </span>
                      ) : (
                        money(vehicle.price)
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>Aucun véhicule à cette étape</h3>
            <p>Choisissez une autre étape ou affichez tous les véhicules du modèle.</p>
            <button className="button secondary" onClick={() => setParams({})}>
              Afficher tous les véhicules
            </button>
          </div>
        )}
        {filtered.length > 0 && (
          <nav className="pagination" aria-label="Pagination des véhicules">
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
                Suivant
              </button>
            </div>
          </nav>
        )}
      </section>
      <p className="source-footnote">
        Périmètre : arrivages importés. La préparation terminée ne signifie pas que le véhicule est
        disponible à la vente.
      </p>
    </>
  );
}
