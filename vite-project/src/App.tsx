import { useEffect } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import AppProvider from './context/AppProvider';
import Nav from './Components/Nav';
import Home from './Pages/Home';
import PageModele from './Pages/PageModele';
import Profile from './Pages/Profile';
import Orders from './Pages/Orders';
import NotFound from './Pages/NotFound';
import { models } from './lib/data';
import { modelPath, normalize } from './lib/inventory';
import './App.css';
function LegacyModel() {
  const { modele = '' } = useParams();
  const matches = models.filter((model) => normalize(model.model) === normalize(modele));
  return matches.length === 1 ? (
    <Navigate replace to={modelPath(matches[0].brand, matches[0].model)} />
  ) : (
    <Navigate replace to={`/?q=${encodeURIComponent(modele)}`} />
  );
}
function RouteEffects() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
    document.title = pathname.startsWith('/modeles/')
      ? 'Fiche modèle · Aramis Auto'
      : pathname.startsWith('/commandes')
        ? 'Commandes · Aramis Auto'
        : pathname === '/profil'
          ? 'Mon profil · Aramis Auto'
          : 'Arrivages · Aramis Auto';
    document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [pathname]);
  return null;
}
export default function App() {
  return (
    <AppProvider>
      <a href="#main-content" className="skip-link">
        Aller au contenu
      </a>
      <Nav />
      <RouteEffects />
      <main id="main-content" className="app-main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/modeles/:marque/:modele" element={<PageModele />} />
          <Route path="/commandes" element={<Orders key="list" />} />
          <Route path="/commandes/nouvelle" element={<Orders key="new" create />} />
          <Route path="/profil" element={<Profile />} />
          <Route path="/Profile" element={<Navigate to="/profil" replace />} />
          <Route path="/PageModele/:modele" element={<LegacyModel />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <span>
          aramis<span className="brand-dot">auto</span> · Espace de pilotage
        </span>
        <span>
          Données importées · <Link to="/profil">Mon profil</Link>
        </span>
      </footer>
    </AppProvider>
  );
}
