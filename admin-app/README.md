# Studio Admin

Application Next.js 14 pour gérer les contenus JSON du site vitrine via la GitHub Contents API.

## Prérequis

- Node.js 18+
- Accès à un dépôt GitHub contenant un répertoire `data/` avec `site.json`, `realisations.json`, `team.json`, `skills.json`
- Un token personnel GitHub (Classic) avec le scope `repo`

## Configuration

1. Copier `.env.example` vers `.env` et renseigner :
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` : identifiants statiques
   - `GITHUB_TOKEN` : PAT Classic
   - `GITHUB_OWNER` : propriétaire du dépôt
   - `GITHUB_REPO` : nom du dépôt
   - `BRANCH` : branche cible (par défaut `main`)
   - `DATA_DIR` : dossier contenant les JSON (par défaut `data`)

2. Installer les dépendances :

```bash
npm install
```

3. Lancer le serveur de développement :

```bash
npm run dev
```

4. Ouvrir [http://localhost:3000](http://localhost:3000) et se connecter.

## Déploiement sur Vercel

1. Créer un nouveau projet Vercel depuis ce dossier.
2. Ajouter les mêmes variables d'environnement dans l'interface Vercel.
3. Déployer. Les routes API restent server-side, aucune clé GitHub n'est exposée au navigateur.

## Utilisation

1. Se connecter sur `/login`.
2. Depuis le tableau de bord, choisir une section (site, réalisations, équipe, compétences).
3. Modifier les champs puis sauvegarder. Chaque sauvegarde écrit un commit sur GitHub via la Contents API.
4. Se déconnecter via le bouton dédié.

## Tests

- **Unitaires (Zod)** : `npm run test:unit`
- **E2E (Playwright)** : `npm run test:e2e`
- **Tous les tests** : `npm test`

Le test unitaire vérifie la validation email et slug. Le test E2E simule un flux de login + sauvegarde.

## Dépannage

- `401 Unauthorized` : vérifier email/mot de passe.
- Erreurs GitHub 4xx/5xx : vérifier token, droits repo, valeur `BRANCH` ou `DATA_DIR`.
- Erreurs Zod : le message indique quel champ est invalide.
