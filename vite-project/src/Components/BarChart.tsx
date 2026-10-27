import { countBy, type Vehicle } from '../lib/inventory';
import { number } from '../lib/format';
export default function DistributionChart({
  vehicles,
  field,
}: {
  vehicles: Vehicle[];
  field: 'energy' | 'gearbox';
}) {
  const data = countBy(vehicles, field);
  return (
    <ul className="distribution-list">
      {data.map((item, index) => (
        <li key={item.name}>
          <div className="distribution-label">
            <span>
              <i className={`color-dot tone-${index % 5}`} />
              {item.name}
            </span>
            <strong>
              {number(item.value)}{' '}
              <small>· {Math.round((item.value / vehicles.length) * 100)} %</small>
            </strong>
          </div>
          <div className="bar-track" aria-hidden="true">
            <div
              className={`bar-fill tone-${index % 5}`}
              style={{ width: `${(item.value / vehicles.length) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
