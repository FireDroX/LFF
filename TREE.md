# Structure du projet

```text
LFF/
├── api/
│   ├── discord/          # Interactions et commandes Discord
│   └── express/          # Routes HTTP
├── client/
│   ├── public/           # Fichiers statiques Vite
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│   ├── index.html
│   └── vite.config.mjs
├── database/
│   ├── index.js          # Connexion et initialisation MySQL
│   ├── leaderboards.js   # Requêtes et transactions
│   └── schema.sql
├── scripts/
│   └── initDatabase.js
├── utils/
├── .env.example
├── Dockerfile
├── index.js
└── package.json
```
