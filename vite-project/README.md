# Aramis Auto — pilotage des arrivages

Application React + TypeScript + Vite, en français, adaptée aux écrans mobiles et de bureau.

## Installation et démarrage

Node.js 22 LTS conseillé.

```sh
cd vite-project
npm ci
npm run dev
```

Depuis la racine du dépôt, les commandes `npm run dev`, `npm run build`, `npm run lint`, `npm test` et `npm run preview` délèguent au projet Vite. Installer les dépendances dans `vite-project`.

## Parcours disponibles

- **Vue d’ensemble** : indicateurs globaux, filtres par marque, recherche insensible aux accents, tri, pagination, export CSV du résultat filtré et accès aux fiches modèles. Les filtres sont dans l’URL et peuvent être partagés.
- **Fiche modèle** : changement de modèle, répartition par étape, énergie et boîte, filtrage du tableau par étape ou VN/VO, export CSV et création d’une commande préremplie.
- **Commandes** : création avec quantité, fournisseur et date prévue ; recherche et filtres de statut ; confirmation de réception ou d’annulation ; affichage des échéances dépassées.
- **Profil** : nom, adresse e-mail, activité et pôle, validation avant enregistrement, annulation des modifications, personnalisation de l’en-tête et de l’accueil.
- Pages introuvables et modèles absents proposent un retour à l’accueil.

## Routes et hébergement

| Route                      | Écran                   |
| -------------------------- | ----------------------- |
| `/`                        | Vue d’ensemble          |
| `/modeles/:marque/:modele` | Fiche modèle            |
| `/commandes`               | Suivi des commandes     |
| `/commandes/nouvelle`      | Création d’une commande |
| `/profil`                  | Profil                  |

Les anciennes routes `/PageModele/:modele` et `/Profile/` redirigent vers les nouveaux écrans. Marque et modèle sont encodés séparément, ce qui évite les collisions entre marques.

Pour déployer le dossier `dist`, configurer le serveur pour renvoyer `index.html` sur les routes applicatives inconnues (fallback SPA). Les vrais fichiers statiques doivent rester servis normalement. Vite dev et preview gèrent ce fallback.

## Origine et règles des données

Les fichiers sources sous `data/aramis-auto` sont conservés sans modification.

- Seul `stock-arrivage.json` alimente l’inventaire.
- `stock-vente.json` est une copie des mêmes 4 338 lignes, toutes marquées « Arrivage ». Il n’est pas utilisé comme stock disponible.
- Les lignes sont regroupées par `VEHICULE_ID` : 2 288 identifiants distincts, dont 6 « A Supprimer » exclus, soit **2 282 véhicules affichés**.
- En l’absence de date permettant de départager les versions, le premier enregistrement avec un modèle renseigné fournit les attributs. Un identifiant ne compte jamais dans deux modèles. Un libellé manquant devient « Modèle non renseigné ».
- Lorsque plusieurs prix sont fournis pour un même véhicule, aucun prix arbitraire n’est affiché : la valeur devient « À confirmer ».
- Toutes les étapes restantes, dont le transport et le transit, sont comptées. Toute nouvelle étape est conservée.
- Les répartitions concernent uniquement les arrivages importés. Aucune part de marché, prévision, disponibilité à la vente ou date de synchronisation n’est inventée.
- Les données sont un import historique, pas un flux actualisé. Remplacer le fichier source puis reconstruire pour actualiser l’inventaire.

Les règles sont dans `src/lib/inventory.ts`, indépendantes de l’interface et couvertes par les tests.

## Persistance et limites fonctionnelles

Les profils et les commandes sont enregistrés dans le `localStorage` de cette origine, dans les clés versionnées `aramis.profile.v1` et `aramis.orders.v1`. Les valeurs sont validées à la lecture ; un stockage corrompu, désactivé ou saturé ne provoque pas de crash ni de faux message de sauvegarde réussie. Les anciens champs de profil compatibles de la clé `content` sont récupérés.

Ce dépôt ne contient ni API métier, ni authentification, ni base de données partagée. Les commandes sont un **suivi local**, sans transmission aux fournisseurs. Confirmer une réception change le suivi de commande sans modifier les données de l’import. L’effacement du stockage du navigateur supprime ce suivi.

## Vérifications

```sh
npm test
npm run lint
npm run build
npm run format
```

Les tests Node couvrent la déduplication, les statuts omis auparavant, les modèles à un véhicule, les prix contradictoires, les clés de modèle, les données vides et les erreurs de persistance.

Un contrôle navigateur reproductible est disponible sans dépendance d’automatisation supplémentaire :

1. Démarrer Vite sur `http://127.0.0.1:5173`.
2. Démarrer Chrome avec `--headless=new --remote-debugging-port=9223 --user-data-dir=<dossier-de-test-isolé>`.
3. Dans `vite-project`, exécuter `node scripts/browser-smoke.mjs`.

Utiliser exclusivement un profil de test : ce script efface les clés applicatives de son origine de test. Il vérifie les parcours, les anciennes URL, les erreurs de stockage et les débordements sur plusieurs tailles d’écran. Les captures sont enregistrées dans `.review-artifacts` (ignoré par Git).

## Organisation

- `src/Pages` : points d’entrée des routes.
- `src/Components` : écrans, navigation, tableaux et graphiques SVG/CSS accessibles.
- `src/lib` : données, calculs, stockage, formats et export.
- `src/context` : profil et commandes partagés entre les écrans.
- `src/index.css` : styles de base et composants visuels communs.
- `src/App.css` : mise en page et adaptations responsive.

Les polices sont servies localement. Les graphiques ne nécessitent plus plusieurs bibliothèques concurrentes.
