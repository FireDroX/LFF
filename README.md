# LFF — Classements Minecraft et Discord

LFF réunit un site React, une API Express, un bot Discord et des classements
Minecraft hebdomadaires. L'application utilise MySQL et est prévue pour être
servie sur `https://lff.addrien.fr`.

## Stack

- Frontend : React 19 + Vite
- Backend : Node.js + Express
- Base de données : MySQL (`mysql2`)
- Authentification : Discord OAuth2
- Interactions Discord : API Discord, sans `discord.js`

## Base de données

Au démarrage, le serveur :

1. se connecte à MySQL avec les variables `SQL_*` ;
2. crée la base `SQL_DBNAME` si elle n'existe pas ;
3. applique `database/schema.sql` ;
4. démarre seulement lorsque la connexion est opérationnelle.

Le schéma contient :

- `tops` : périodes de classement par catégorie ;
- `users` : identité Discord et pseudo courant ;
- `top_rankings` : score d'un utilisateur pour une période, relié aux deux
  tables précédentes.

Les modifications de score sont transactionnelles. Un score inférieur ou égal
à zéro supprime la ligne du classement.

Pour initialiser la base sans démarrer le serveur :

```bash
npm run db:init
npm run db:verify
```

Le compte `SQL_USER` doit avoir le droit de créer `SQL_DBNAME`. Si la base est
créée en amont par l'hébergeur, les droits de création de tables suffisent.

## Installation

Prérequis : Node.js 20.19+ et MySQL 8+.

```bash
npm install
npm --prefix client install
copy .env.example .env
npm run db:init
npm run build
npm start
```

En développement, lancer les deux processus dans deux terminaux :

```bash
npm run dev
npm run dev:client
```

Vite écoute sur `http://localhost:5173` et redirige les routes API vers
`http://localhost:3001`.

## Configuration

Les variables attendues sont documentées dans `.env.example`.

```env
PORT=3001
PUBLIC_URL=https://lff.addrien.fr
FRONTEND_URL=https://lff.addrien.fr

SQL_SERVER=127.0.0.1
SQL_PORT=3306
SQL_DBNAME=lff
SQL_USER=lff
SQL_PASSWORD=...
```

`PUBLIC_URL` est l'origine canonique utilisée par les commandes Discord et par
l'OAuth. `FRONTEND_URL` reste accepté comme valeur de repli.

Dans le portail développeur Discord, ajouter ces URLs de redirection :

- `https://lff.addrien.fr`
- `http://localhost:5173` pour le développement local

## Routes principales

- `GET /healthz` : état du serveur et de MySQL
- `GET /config` : configuration publique du client
- `GET /leaderboard/current/:type`
- `GET /leaderboard/history`
- `POST /points/add/:type`
- `PATCH /leaderboards/update/:type`
- `GET /profile`
- `POST /interactions`

Types disponibles : `crystaux`, `pvp`, `iscoin`, `dragonegg`, `beacon` et
`sponge`.

## Déploiement

Le `Dockerfile` construit le client Vite puis produit une image Node qui sert
`client/dist` et l'API sur le même domaine.

Pour reconstruire et relancer le conteneur :

```bash
chmod +x build.sh
./build.sh
```

Par défaut, le script utilise l'image `lff-image:latest`, le conteneur `lff`,
le réseau `mariadb-network` et publie l'application sur
`127.0.0.1:3456`. Ces valeurs sont surchargeables :

```bash
HOST_PORT=4567 CONTAINER_NAME=lff-prod ./build.sh
```

Le reverse proxy de `lff.addrien.fr` doit transmettre le trafic au port défini
par `PORT` et conserver les en-têtes `Host` et `X-Forwarded-Proto`.

Les secrets MySQL et Discord doivent être injectés au démarrage du conteneur ;
le fichier `.env` est exclu de l'image Docker et de Git.
