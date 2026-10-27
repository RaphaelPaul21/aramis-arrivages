type IconName =
  | 'grid'
  | 'car'
  | 'box'
  | 'user'
  | 'arrow'
  | 'search'
  | 'plus'
  | 'download'
  | 'check'
  | 'close'
  | 'back'
  | 'clock';
const paths: Record<IconName, string> = {
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  car: 'M5 17H3v-6l2-6h14l2 6v6h-2 M5 17h14 M5 17v3 M19 17v3 M3 11h18 M7 14h1 M16 14h1',
  box: 'M3 7l9-4 9 4v10l-9 4-9-4V7z M3 7l9 4 9-4 M12 11v10 M7.5 5l9 4',
  user: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z M4 21v-2a8 8 0 0 1 16 0v2',
  arrow: 'M4 12h16 M14 6l6 6-6 6',
  search: 'M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0z M15 15l6 6',
  plus: 'M12 5v14 M5 12h14',
  download: 'M12 3v12 M7 10l5 5 5-5 M4 16v5h16v-5',
  check: 'M5 12l4 4L19 6',
  close: 'M6 6l12 12 M18 6L6 18',
  back: 'M20 12H4 M10 6l-6 6 6 6',
  clock: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z M12 7v5l3 2',
};
export default function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return (
    <svg
      className={`icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
