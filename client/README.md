# Client LFF

Client React construit avec Vite.

```bash
npm install
npm run dev
npm run build
npm run preview
```

Le serveur de développement lit `PORT` dans le `.env` à la racine et utilise
cette valeur pour le proxy API. En production, Express sert le contenu généré
dans `client/dist`.
