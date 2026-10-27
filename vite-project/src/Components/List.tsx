import { Link } from 'react-router-dom';
import type { ModelSummary } from '../lib/inventory';
import { modelPath } from '../lib/inventory';
import { number } from '../lib/format';
import Icon from './Icon';
export default function ModelList({ models }: { models: ModelSummary[] }) {
  return (
    <div className="table-scroll">
      <table className="data-table model-table">
        <thead>
          <tr>
            <th scope="col">Marque / modèle</th>
            <th scope="col">En arrivage</th>
            <th scope="col">Préparation terminée</th>
            <th scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {models.map((model) => (
            <tr key={model.key}>
              <th scope="row">
                <Link className="model-link" to={modelPath(model.brand, model.model)}>
                  <span className="model-symbol">
                    <Icon name="car" />
                  </span>
                  <span>
                    <small>{model.brand}</small>
                    {model.model}
                  </span>
                </Link>
              </th>
              <td>
                <strong>{number(model.count)}</strong> <span className="muted">véh.</span>
              </td>
              <td>
                <span className={model.ready ? 'badge green' : 'badge neutral'}>
                  {number(model.ready)} prêt{model.ready > 1 ? 's' : ''}
                </span>
              </td>
              <td>
                <Link
                  className="icon-button"
                  to={modelPath(model.brand, model.model)}
                  aria-label={`Voir ${model.brand} ${model.model}`}
                >
                  <Icon name="arrow" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
