import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../context/store';
import { POLES, validateProfile, type Profile } from '../lib/storage';
import Icon from './Icon';
export default function ProfilePage() {
  const { profile, saveProfile, storageError } = useAppStore();
  const [draft, setDraft] = useState(profile);
  const [errors, setErrors] = useState<Partial<Record<keyof Profile, string>>>({});
  const [message, setMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const dirty = JSON.stringify(draft) !== JSON.stringify(profile);
  function change<K extends keyof Profile>(key: K, value: Profile[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setMessage('');
    setSaveError('');
    setErrors((current) => ({ ...current, [key]: undefined }));
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateProfile(draft);
    setErrors(nextErrors);
    setMessage('');
    setSaveError('');
    if (Object.keys(nextErrors).length) {
      document.getElementById(`profile-${Object.keys(nextErrors)[0]}`)?.focus();
      return;
    }
    const error = saveProfile(draft);
    if (error) setSaveError(error);
    else {
      setDraft({ ...draft, name: draft.name.trim(), email: draft.email.trim() });
      setMessage('Votre profil a bien été enregistré.');
    }
  }
  return (
    <>
      <nav className="breadcrumbs" aria-label="Fil d’Ariane">
        <Link to="/">Vue d’ensemble</Link>
        <span>/</span>
        <span aria-current="page">Mon profil</span>
      </nav>
      <div className="page-heading">
        <div>
          <p className="eyebrow">VOTRE ESPACE</p>
          <h1>
            Mon profil<span className="heading-dot">.</span>
          </h1>
          <p className="page-description">
            Vos informations pour un espace de travail à votre image.
          </p>
        </div>
      </div>
      <div className="profile-layout">
        <aside className="profile-summary">
          <span className="large-avatar">
            {profile.name ? (
              profile.name
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((word) => word[0])
                .join('')
                .toUpperCase()
            ) : (
              <Icon name="user" />
            )}
          </span>
          <h2>{profile.name || 'Bienvenue dans votre espace'}</h2>
          <p>{profile.email || 'Complétez votre profil pour personnaliser le tableau de bord.'}</p>
          {profile.pole && <span className="badge blue">{profile.pole}</span>}
          <div className="profile-note">
            <Icon name="user" />
            <p>
              Ces préférences sont enregistrées sur cet appareil. Elles ne créent pas de compte
              utilisateur.
            </p>
          </div>
          <Link className="text-link" to="/commandes">
            Mes commandes <Icon name="arrow" />
          </Link>
        </aside>
        <section className="panel profile-form-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">INFORMATIONS PERSONNELLES</p>
              <h2>Faisons connaissance</h2>
              <p className="muted">Tous les champs sont obligatoires.</p>
            </div>
          </div>
          {storageError && (
            <p role="alert" className="notice warning">
              {storageError}
            </p>
          )}
          <form className="form-body" onSubmit={submit} noValidate>
            <div className="form-field">
              <label htmlFor="profile-name">Nom complet</label>
              <input
                id="profile-name"
                name="name"
                autoComplete="name"
                required
                maxLength={80}
                placeholder="Votre prénom et votre nom"
                value={draft.name}
                onChange={(event) => change('name', event.target.value)}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <span className="field-error" id="name-error">
                  {errors.name}
                </span>
              )}
            </div>
            <div className="form-field">
              <label htmlFor="profile-email">Adresse e-mail</label>
              <input
                id="profile-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="prenom.nom@exemple.fr"
                value={draft.email}
                onChange={(event) => change('email', event.target.value)}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <span className="field-error" id="email-error">
                  {errors.email}
                </span>
              )}
            </div>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="profile-type">Activité</label>
                <select
                  id="profile-type"
                  required
                  value={draft.type}
                  onChange={(event) => change('type', event.target.value as Profile['type'])}
                  aria-invalid={!!errors.type}
                  aria-describedby={errors.type ? 'type-error' : undefined}
                >
                  <option value="">Sélectionner une activité</option>
                  <option value="VN">Véhicules neufs (VN)</option>
                  <option value="VO">Véhicules d’occasion (VO)</option>
                </select>
                {errors.type && (
                  <span className="field-error" id="type-error">
                    {errors.type}
                  </span>
                )}
              </div>
              <div className="form-field">
                <label htmlFor="profile-pole">Pôle</label>
                <select
                  id="profile-pole"
                  required
                  value={draft.pole}
                  onChange={(event) => change('pole', event.target.value)}
                  aria-invalid={!!errors.pole}
                  aria-describedby={errors.pole ? 'pole-error' : undefined}
                >
                  <option value="">Sélectionner un pôle</option>
                  {POLES.map((pole) => (
                    <option key={pole}>{pole}</option>
                  ))}
                </select>
                {errors.pole && (
                  <span className="field-error" id="pole-error">
                    {errors.pole}
                  </span>
                )}
              </div>
            </div>
            {saveError && (
              <p role="alert" className="notice error">
                {saveError}
              </p>
            )}
            {message && (
              <p role="status" className="notice success">
                <Icon name="check" />
                {message}
              </p>
            )}
            <div className="form-actions">
              <span className="muted">
                {dirty ? 'Modifications non enregistrées' : 'Enregistré sur cet appareil'}
              </span>
              <div>
                <button
                  className="button subtle"
                  type="button"
                  disabled={!dirty}
                  onClick={() => {
                    setDraft(profile);
                    setErrors({});
                    setMessage('');
                    setSaveError('');
                  }}
                >
                  Annuler
                </button>
                <button className="button primary" type="submit">
                  <Icon name="check" />
                  Enregistrer le profil
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </>
  );
}
