import { useId } from 'react';
import { stageCounts, type Vehicle } from '../lib/inventory';
export default function RadarChart({ vehicles }: { vehicles: Vehicle[] }) {
  const id = useId();
  const data = stageCounts(vehicles);
  const maximum = Math.max(1, ...data.map((item) => item.value));
  const center = 160;
  const radius = 112;
  const point = (index: number, size: number) => {
    const angle = (index / data.length) * 2 * Math.PI - Math.PI / 2;
    return [center + Math.cos(angle) * size, center + Math.sin(angle) * size];
  };
  const polygon = (size: number) => data.map((_, index) => point(index, size).join(',')).join(' ');
  return (
    <figure className="radar-figure">
      <svg viewBox="0 0 320 320" role="img" aria-labelledby={id}>
        <title id={id}>
          Répartition des véhicules par étape.{' '}
          {data.map((item, index) => `${index + 1}. ${item.name} : ${item.value}`).join('; ')}
        </title>
        {[0.25, 0.5, 0.75, 1]
          .map((ratio) => (
            <polygon
              key={ratio}
              points={polygon(radius * ratio)}
              fill={ratio === 1 ? '#f4f8fb' : 'none'}
              stroke="#dce6ed"
            />
          ))
          .reverse()}
        {data.map((item, index) => {
          const [x, y] = point(index, radius);
          const [tx, ty] = point(index, radius + 23);
          return (
            <g key={item.name}>
              <line x1={center} y1={center} x2={x} y2={y} stroke="#dce6ed" />
              <text
                x={tx}
                y={ty}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#526b7d"
                fontSize="12"
              >
                {index + 1}
              </text>
            </g>
          );
        })}
        <polygon
          points={data
            .map((item, index) => point(index, (radius * item.value) / maximum).join(','))
            .join(' ')}
          fill="#54c3bc55"
          stroke="#07857e"
          strokeWidth="2.5"
        />
        {data.map((item, index) => {
          const [cx, cy] = point(index, (radius * item.value) / maximum);
          return <circle key={item.name} cx={cx} cy={cy} r="3" fill="#07857e" />;
        })}
      </svg>
      <figcaption>
        <span className="color-dot tone-1" />
        Véhicules uniques · échelle 0–{maximum}
        <small>Les numéros correspondent aux étapes ci-contre.</small>
      </figcaption>
    </figure>
  );
}
