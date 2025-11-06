# 🏝️ LFF – Classements Minecraft & Discord Integration

## 🔍 Présentation

**LFF** est une plateforme web connectée à un serveur Minecraft et à Discord permettant de gérer et afficher des classements dynamiques :
💎 Crystaux, 🪙 IsCoin, 🥚 Dragon Egg, 🔷 Beacon et 🧽 Sponge.

Les utilisateurs peuvent se connecter via Discord pour :

- Ajouter ou retirer leurs points selon leurs rôles
- Consulter les classements hebdomadaires
- Visualiser l’historique de chaque type de classement

Les administrateurs disposent d’un **dashboard** dédié pour modifier les scores, lancer de nouveaux classements et surveiller l’activité.

---

## ⚙️ Fonctionnalités principales

### 🔸 Côté utilisateur

- 🔐 **Connexion via Discord OAuth2**
- 🏆 **Classements dynamiques** : Crystaux, IsCoin, Dragon Egg, Beacon, Sponge
- ⏱️ **Mises à jour automatiques** chaque semaine
- 🌗 **Thèmes clair/sombre**
- 🧾 **Historique des classements**
- ➕ **Ajout et suppression de points** selon les permissions Discord

### 🔸 Côté administrateur

- 🛠️ **Dashboard admin** avec édition manuelle des scores
- ✅ Vérification automatique du rôle Discord (“Manage Roles”) pour autorisation admin
- 🧩 Système d’audit pour prévenir les modifications concurrentes
- 📢 **Logs Discord automatiques** (ajout, suppression, nouveau classement, etc.)

### 🔸 Côté technique

- Backend : **Express.js + Supabase**
- Frontend : **React.js**
- Auth : **Discord OAuth2**
- Hébergement : Supabase + Node.js
- Système de messages dynamiques (`messages.js`) pour une expérience plus vivante

---

## 🚀 Installation

```bash
# Clone du projet
git clone https://github.com/FireDroX/LFF.git
cd LFF

# Installation des dépendances
npm install

# Lancement du serveur backend
npm run dev

# Lancement du frontend
cd ./client
npm run start
```

Crée un fichier `.env` :

```env
PORT=Celui que vous voulez

DISCORD_CLIENT_ID=...
DISCORD_CLIENT_TOKEN=...
DISCORD_CLIENT_SECRET=...
DISCORD_GUILD_ID=...
DISCORD_ROLE_ISLAND=...
DISCORD_ROLE_GANG=...
DISCORD_ROLE_STAFF=...
DISCORD_LOG_CHANNEL_ID=...

FRONTEND_URL=...

SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 🤝 Contribuer

Les contributions sont les bienvenues !

- Fork ce dépôt
- Crée une branche feature (`git checkout -b feature/NouvelleFonctionnalité`)
- Commit tes modifications (`git commit -am "Ajout : nouvelle fonctionnalité"`)
- Push ta branche (`git push origin feature/NouvelleFonctionnalité`)
- Ouvre une Pull Request

Merci de respecter la structure du code, les conventions (naming, mise en forme) et d’ajouter des tests si possible.

---

## 👑 Crédits

Développé avec ❤️ par **FireDroX**
Intégration Discord et API Supabase par la communauté LFF.

GitHub : [FireDroX](https://github.com/FireDroX)
<br />
Projet hébergé : [lff.onrender.com](https://lff.onrender.com)
