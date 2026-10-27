import Icon from './Icon';
export default function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="search-field">
      <Icon name="search" />
      <label className="sr-only" htmlFor="model-search">
        Rechercher une marque ou un modèle
      </label>
      <input
        id="model-search"
        type="search"
        placeholder="Rechercher une marque, un modèle…"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
