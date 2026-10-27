# Aramis Auto — pilotage des arrivages

Tableau de bord React et TypeScript pour explorer les arrivages automobiles et suivre les commandes.

- Recherche, filtres, tri et export CSV des véhicules.
- Fiches modèles avec graphiques et comptages dédupliqués.
- Suivi local des commandes et profil personnalisable.
- Interface responsive, en français.

## Démarrer

Avec Node.js 22 :

```sh
npm --prefix vite-project ci
npm run dev
```

## Vérifier

```sh
npm test
npm run lint
npm run build
```

Consulter la [documentation de l’application](vite-project/README.md) pour les routes, les règles de données, les tests navigateur et l’hébergement.

Les données sont un import historique. Les commandes et le profil sont enregistrés dans le navigateur ; aucune commande n’est transmise à un fournisseur.

Projet basé sur [Catcathg/datavisualisation](https://github.com/Catcathg/datavisualisation), avec conservation de son historique Git.
