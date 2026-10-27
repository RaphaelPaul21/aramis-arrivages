import { Link } from 'react-router-dom';
import { useAppStore } from '../context/store';
import { date } from '../lib/format';
import { modelPath } from '../lib/inventory';
import { orderLabels } from '../lib/orderLabels';
import Icon from './Icon';
export default function HistoricItems() {
  const { orders } = useAppStore();
  return (
    <section className="panel recent-orders">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">VOTRE ACTIVITÉ</p>
          <h2>Dernières commandes</h2>
        </div>
        <Link className="text-link" to="/commandes">
          Tout voir <Icon name="arrow" />
        </Link>
      </div>
      {orders.length ? (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Création</th>
                <th scope="col">Modèle</th>
                <th scope="col">Quantité</th>
                <th scope="col">Fournisseur</th>
                <th scope="col">Statut</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id}>
                  <td>{date(order.createdAt)}</td>
                  <th scope="row">
                    <Link className="text-link" to={modelPath(order.brand, order.model)}>
                      {order.brand} {order.model}
                    </Link>
                  </th>
                  <td>{order.quantity}</td>
                  <td>{order.supplier}</td>
                  <td>
                    <span
                      className={`badge ${order.status === 'received' ? 'green' : order.status === 'pending' ? 'blue' : 'neutral'}`}
                    >
                      {orderLabels[order.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-orders">
          <span className="empty-icon">
            <Icon name="box" />
          </span>
          <div>
            <h3>Votre prochaine commande commence ici.</h3>
            <p>Créez une commande pour suivre les véhicules attendus et leur réception.</p>
          </div>
          <Link className="button secondary" to="/commandes/nouvelle">
            <Icon name="plus" />
            Créer une commande
          </Link>
        </div>
      )}
    </section>
  );
}
