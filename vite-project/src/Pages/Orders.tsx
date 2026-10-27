import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../context/store';
import { brands, models } from '../lib/data';
import { modelPath, normalize } from '../lib/inventory';
import { date, number } from '../lib/format';
import { isDate, localToday, type OrderStatus } from '../lib/storage';
import { orderLabels } from '../lib/orderLabels';
import Icon from '../Components/Icon';

function OrderForm() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { addOrder, storageError } = useAppStore();
  const initial = models.find(
    (model) => model.brand === params.get('marque') && model.model === params.get('modele'),
  );
  const [brand, setBrand] = useState(initial?.brand ?? '');
  const [modelKey, setModelKey] = useState(initial?.key ?? '');
  const [quantity, setQuantity] = useState('1');
  const [supplier, setSupplier] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [error, setError] = useState('');
  const selectedModel = models.find((model) => model.key === modelKey && model.brand === brand);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (
      !selectedModel ||
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) < 1 ||
      Number(quantity) > 999 ||
      !supplier.trim() ||
      supplier.trim().length > 120 ||
      !isDate(expectedDate) ||
      expectedDate < localToday()
    ) {
      setError(
        'Choisissez un modèle, une quantité de 1 à 999, un fournisseur et une date à partir d’aujourd’hui.',
      );
      return;
    }
    const result = addOrder({
      brand: selectedModel.brand,
      model: selectedModel.model,
      quantity: Number(quantity),
      supplier,
      expectedDate,
    });
    if (result) setError(result);
    else navigate('/commandes?statut=pending&creation=ok', { replace: true });
  }
  return (
    <div className="order-create-layout">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">NOUVELLE COMMANDE</p>
            <h2>Préparer le prochain arrivage</h2>
            <p className="muted">Tous les champs sont obligatoires.</p>
          </div>
        </div>
        {storageError && (
          <p className="notice warning" role="alert">
            {storageError}
          </p>
        )}
        <form className="form-body" onSubmit={submit}>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="order-brand">Marque</label>
              <select
                id="order-brand"
                required
                value={brand}
                onChange={(event) => {
                  setBrand(event.target.value);
                  setModelKey('');
                }}
              >
                <option value="">Choisir une marque</option>
                {brands.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="order-model">Modèle</label>
              <select
                id="order-model"
                required
                disabled={!brand}
                value={modelKey}
                onChange={(event) => setModelKey(event.target.value)}
              >
                <option value="">Choisir un modèle</option>
                {models
                  .filter((model) => model.brand === brand)
                  .map((model) => (
                    <option key={model.key} value={model.key}>
                      {model.model}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="order-supplier">Fournisseur</label>
            <input
              id="order-supplier"
              required
              maxLength={120}
              placeholder="Nom du fournisseur ou du partenaire"
              value={supplier}
              onChange={(event) => setSupplier(event.target.value)}
            />
          </div>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="order-quantity">Nombre de véhicules</label>
              <input
                id="order-quantity"
                type="number"
                required
                min="1"
                max="999"
                step="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="order-date">Réception prévue</label>
              <input
                id="order-date"
                type="date"
                required
                min={localToday()}
                value={expectedDate}
                onChange={(event) => setExpectedDate(event.target.value)}
              />
            </div>
          </div>
          {error && (
            <p role="alert" className="notice error">
              {error}
            </p>
          )}
          <div className="form-actions">
            <Link className="button subtle" to="/commandes">
              Annuler
            </Link>
            <button className="button primary" type="submit">
              <Icon name="plus" />
              Créer la commande
            </button>
          </div>
        </form>
      </section>
      <aside className="source-card order-note">
        <Icon name="box" />
        <p className="eyebrow">DU SUIVI À LA RÉCEPTION</p>
        <h2>Un seul endroit pour vos commandes.</h2>
        <ol>
          <li>Renseignez les véhicules attendus.</li>
          <li>Retrouvez la commande dans votre suivi.</li>
          <li>Confirmez sa réception ou son annulation.</li>
        </ol>
        <p>
          Ce suivi est enregistré dans votre navigateur. Il n’envoie pas de commande au fournisseur
          et ne modifie pas l’import des arrivages.
        </p>
        {selectedModel && (
          <Link className="text-link" to={modelPath(selectedModel.brand, selectedModel.model)}>
            Consulter la fiche modèle <Icon name="arrow" />
          </Link>
        )}
      </aside>
    </div>
  );
}
export default function Orders({ create = false }: { create?: boolean }) {
  const { orders, updateOrder, storageError } = useAppStore();
  const [params, setParams] = useSearchParams();
  const [action, setAction] = useState<{ id: string; status: OrderStatus } | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const status = params.get('statut') ?? '';
  const search = params.get('q') ?? '';
  const filtered = orders.filter(
    (order) =>
      (!status || order.status === status) &&
      normalize(`${order.brand} ${order.model} ${order.supplier}`).includes(normalize(search)),
  );
  const counts = {
    pending: orders.filter((order) => order.status === 'pending').length,
    received: orders.filter((order) => order.status === 'received').length,
    cancelled: orders.filter((order) => order.status === 'cancelled').length,
  };
  function filter(key: string, value: string) {
    const next = new URLSearchParams(params);
    next.delete('creation');
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
    setAction(null);
  }
  function confirmAction() {
    if (!action) return;
    const result = updateOrder(action.id, action.status);
    if (result) setError(result);
    else {
      setMessage(
        action.status === 'received'
          ? 'La réception a bien été confirmée.'
          : 'La commande a été annulée.',
      );
      setError('');
    }
    setAction(null);
  }
  return (
    <>
      <nav className="breadcrumbs" aria-label="Fil d’Ariane">
        <Link to="/">Vue d’ensemble</Link>
        <span>/</span>
        {create ? (
          <>
            <Link to="/commandes">Commandes</Link>
            <span>/</span>
            <span aria-current="page">Nouvelle commande</span>
          </>
        ) : (
          <span aria-current="page">Commandes</span>
        )}
      </nav>
      <div className="page-heading">
        <div>
          <p className="eyebrow">SUIVI DES ACHATS</p>
          <h1>
            {create ? 'Nouvelle commande' : 'Mes commandes'}
            <span className="heading-dot">.</span>
          </h1>
          <p className="page-description">
            {create
              ? 'Anticipez vos besoins et gardez le fil des prochaines réceptions.'
              : 'Toutes vos commandes, de leur création à leur réception.'}
          </p>
        </div>
        {!create && (
          <Link className="button primary" to="/commandes/nouvelle">
            <Icon name="plus" />
            Nouvelle commande
          </Link>
        )}
      </div>
      {create ? (
        <OrderForm key={params.toString()} />
      ) : (
        <>
          {storageError && (
            <p role="alert" className="notice warning">
              {storageError}
            </p>
          )}
          {(message || params.get('creation') === 'ok') && (
            <p role="status" className="notice success">
              <Icon name="check" />
              {message || 'Votre commande a bien été créée.'}
            </p>
          )}
          {error && (
            <p role="alert" className="notice error">
              {error}
            </p>
          )}
          <section className="panel">
            <div className="orders-toolbar">
              <div className="tabs" aria-label="Filtrer les commandes">
                {[
                  { value: '', label: 'Toutes', count: orders.length },
                  ...(['pending', 'received', 'cancelled'] as const).map((value) => ({
                    value,
                    label: orderLabels[value],
                    count: counts[value],
                  })),
                ].map((tab) => (
                  <button
                    key={tab.value}
                    className={status === tab.value ? 'tab active' : 'tab'}
                    aria-pressed={status === tab.value}
                    onClick={() => filter('statut', tab.value)}
                  >
                    {tab.label}
                    <span>{tab.count}</span>
                  </button>
                ))}
              </div>
              <div className="search-field">
                <Icon name="search" />
                <label htmlFor="order-search" className="sr-only">
                  Rechercher une commande
                </label>
                <input
                  id="order-search"
                  type="search"
                  placeholder="Modèle ou fournisseur…"
                  value={search}
                  onChange={(event) => filter('q', event.target.value)}
                />
              </div>
            </div>
            {filtered.length ? (
              <div className="table-scroll">
                <table className="data-table orders-table">
                  <thead>
                    <tr>
                      <th scope="col">Commande / modèle</th>
                      <th scope="col">Fournisseur</th>
                      <th scope="col">Quantité</th>
                      <th scope="col">Réception prévue</th>
                      <th scope="col">Statut</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((order) => (
                      <tr key={order.id}>
                        <th scope="row">
                          <Link className="text-link" to={modelPath(order.brand, order.model)}>
                            {order.brand} {order.model}
                          </Link>
                          <small className="table-secondary">
                            Créée le {date(order.createdAt)}
                          </small>
                        </th>
                        <td>{order.supplier}</td>
                        <td>{number(order.quantity)}</td>
                        <td>
                          {date(order.expectedDate)}
                          {order.status === 'pending' && order.expectedDate < localToday() && (
                            <small className="table-secondary overdue">Date dépassée</small>
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge ${order.status === 'received' ? 'green' : order.status === 'pending' ? 'blue' : 'neutral'}`}
                          >
                            {orderLabels[order.status]}
                          </span>
                        </td>
                        <td>
                          {order.status === 'pending' ? (
                            action?.id === order.id ? (
                              <div
                                className="confirm-action"
                                role="group"
                                aria-label="Confirmation"
                              >
                                <span>
                                  {action.status === 'received'
                                    ? 'Confirmer la réception ?'
                                    : 'Annuler cette commande ?'}
                                </span>
                                <div>
                                  <button className="button small primary" onClick={confirmAction}>
                                    Confirmer
                                  </button>
                                  <button
                                    className="button small subtle"
                                    onClick={() => setAction(null)}
                                  >
                                    Retour
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="row-actions">
                                <button
                                  className="button small secondary"
                                  onClick={() => setAction({ id: order.id, status: 'received' })}
                                >
                                  <Icon name="check" />
                                  Réceptionner
                                </button>
                                <button
                                  className="text-button danger-text"
                                  onClick={() => setAction({ id: order.id, status: 'cancelled' })}
                                >
                                  Annuler
                                </button>
                              </div>
                            )
                          ) : (
                            <span className="muted">Terminée</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">
                  <Icon name="box" />
                </span>
                <h2>
                  {orders.length
                    ? 'Aucune commande ne correspond'
                    : 'Le suivi commence avec votre première commande.'}
                </h2>
                <p>
                  {orders.length
                    ? 'Modifiez la recherche ou le statut sélectionné.'
                    : 'Ajoutez les véhicules attendus, puis suivez leur réception ici.'}
                </p>
                {orders.length ? (
                  <button className="button secondary" onClick={() => setParams({})}>
                    Effacer les filtres
                  </button>
                ) : (
                  <Link className="button primary" to="/commandes/nouvelle">
                    <Icon name="plus" />
                    Créer une commande
                  </Link>
                )}
              </div>
            )}
          </section>
          <p className="source-footnote">
            Commandes enregistrées sur cet appareil. La réception met à jour votre suivi ;
            l’inventaire importé reste indépendant.
          </p>
        </>
      )}
    </>
  );
}
