import { Link } from 'react-router-dom';
import Icon from '../Components/Icon';
export default function NotFound({ model = false }: { model?: boolean }) {
  return (
    <section className="empty-page">
      <span className="eyebrow">{model ? 'MODÈLE INTROUVABLE' : 'ERREUR 404'}</span>
      <h1>
        {model ? 'Ce modèle n’est pas dans l’inventaire.' : 'Cette page a pris une autre route.'}
      </h1>
      <p>Retrouvez les modèles et les arrivages depuis la vue d’ensemble.</p>
      <Link className="button primary" to="/">
        <Icon name="back" />
        Revenir au tableau de bord
      </Link>
    </section>
  );
}
