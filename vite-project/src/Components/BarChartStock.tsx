import { stageCounts, type Vehicle } from '../lib/inventory';
import { number } from '../lib/format';
export default function BarChartStock({
  vehicles,
  active,
  onSelect,
}: {
  vehicles: Vehicle[];
  active: string;
  onSelect: (stage: string) => void;
}) {
  const data = stageCounts(vehicles);
  const max = Math.max(1, ...data.map((item) => item.value));
  return (
    <ol className="stage-bars">
      {data.map((item, index) => (
        <li key={item.name}>
          <button
            className={active === item.name ? 'stage-button selected' : 'stage-button'}
            aria-pressed={active === item.name}
            onClick={() => onSelect(active === item.name ? '' : item.name)}
          >
            <span className="stage-label">
              <span className="stage-index">{String(index + 1).padStart(2, '0')}</span>
              {item.name}
            </span>
            <span className="stage-track" aria-hidden="true">
              <span style={{ width: `${(item.value / max) * 100}%` }} />
            </span>
            <strong>{number(item.value)}</strong>
          </button>
        </li>
      ))}
    </ol>
  );
}
