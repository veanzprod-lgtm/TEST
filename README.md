# Loupiote Studio – Site vitrine

## Aperçu
Ce dépôt contient une maquette complète de site vitrine pour une agence vidéo, développée en HTML sémantique, CSS (via `src/styles/style.css`) et JavaScript moderne (`src/scripts/main.js`). Le contenu éditorial et les listings (menu, réalisations, équipe, informations de contact) sont fournis par des fichiers JSON dans `src/data/` qui sont chargés au runtime.

## Prérequis
- [Node.js](https://nodejs.org/) >= 16 (recommandé)
- npm (fourni avec Node.js)

## Installer les dépendances
Après avoir cloné le dépôt, installez les dépendances de développement (principalement `live-server` pour le serveur local) :

```bash
npm install
```

## Lancer le site en local
Un serveur de développement simple est fourni. Il sert les fichiers statiques depuis `src/` et recharge automatiquement lorsque vous modifiez les fichiers.

```bash
npm start
```

Cela démarre `live-server` sur `http://127.0.0.1:8080` (l’URL exacte est rappelée dans la console). Ouvrez cette adresse dans votre navigateur pour parcourir le site.

> 💡 Astuce : si le port 8080 est déjà utilisé, `live-server` en choisira un autre automatiquement. Vérifiez le message affiché après `npm start`.

## Structure du projet
```
src
├── index.html                  # Page d’accueil
├── marketing-video/            # Page pilier Marketing vidéo
├── savoir-faire/               # Formats et compétences
├── accompagnement/             # Méthodes et FAQ
├── realisations/               # Listing + fiches projet
├── la-meute/                   # Équipe et culture
├── contact/                    # Bureaux, formulaire, carte
├── cgv/ et mentions-legales/   # Pages légales
├── styles/style.css            # Feuille de styles principale
├── scripts/main.js             # Logique UI + data loading
├── data/
│   ├── menu.json               # Navigation principale
│   ├── site.json               # Infos globales (coordonnées…)
│   ├── realisations.json       # Projets du portfolio
│   └── team.json               # Membres de l’équipe
├── sitemap.xml                 # Sitemap statique
└── robots.txt                  # Fichier robots
```

## Personnalisation du contenu
- Modifiez les fichiers JSON dans `src/data/` pour mettre à jour le menu, les coordonnées, les projets ou les profils de l’équipe.
- Les images/vidéos utilisent des placeholders ; remplacez les URLs par vos assets optimisés.
- Les métadonnées SEO (titre, description, Open Graph) se trouvent en tête de chaque fichier HTML.

## Déploiement
Le site est statique. Un simple hébergement de fichiers (Netlify, Vercel, GitHub Pages, OVH, etc.) suffit :
1. Construisez/optimisez vos assets si nécessaire.
2. Déployez l’intégralité du dossier `src/` sur votre hébergeur.

## Tests
Aucun test automatisé n’est fourni. Vous pouvez néanmoins exécuter des audits Lighthouse dans votre navigateur pour valider les performances, l’accessibilité et le SEO.
