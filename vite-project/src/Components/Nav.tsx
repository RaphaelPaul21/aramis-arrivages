import { Link, NavLink } from 'react-router-dom';
import { useAppStore } from '../context/store';
import Icon from './Icon';
export default function Nav() {
  const { profile, orders } = useAppStore();
  const pending = orders.filter((order) => order.status === 'pending').length;
  const initials = profile.name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  return (
    <header className="site-header">
      <div className="nav-inner">
        <Link className="brand-lockup" to="/" aria-label="Aramis Auto, accueil">
          <span className="brand-word">
            aramis<span>auto</span>
            <i />
          </span>
          <span className="brand-subtitle">ESPACE DE PILOTAGE</span>
        </Link>
        <nav className="main-nav" aria-label="Navigation principale">
          <NavLink to="/" end>
            <Icon name="grid" />
            Vue d’ensemble
          </NavLink>
          <NavLink to="/commandes">
            <Icon name="box" />
            Commandes{pending > 0 && <span className="nav-count">{pending}</span>}
          </NavLink>
        </nav>
        <NavLink className="profile-link" to="/profil" aria-label="Mon profil">
          <span className="avatar">{initials || <Icon name="user" />}</span>
          <span className="profile-name">
            {profile.name || 'Mon profil'}
            <small>{profile.pole || 'Personnaliser mon espace'}</small>
          </span>
        </NavLink>
      </div>
    </header>
  );
}
