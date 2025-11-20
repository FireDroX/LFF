# 🏝️ LFF – Classements Minecraft & Discord Integration

## 🔍 Présentation

**LFF** est une plateforme web connectée à un serveur Minecraft et à Discord permettant de gérer et afficher des classements dynamiques :
💎 Crystaux, ⚔️ PVP, 🪙 IsCoin, 🥚 Dragon Egg, 🔷 Beacon et 🧽 Sponge.

Les utilisateurs peuvent se connecter via Discord pour :

- Ajouter ou retirer leurs points selon leurs rôles
- Consulter les classements hebdomadaires
- Visualiser l’historique de chaque type de classement

Les administrateurs disposent d’un **dashboard** dédié pour modifier les scores, lancer de nouveaux classements et surveiller l’activité.

---

## ⚙️ Fonctionnalités principales

### 🔸 Côté utilisateur

#### 🧑‍💻 Connexion & Profil

- 🔐 **Connexion sécurisée via Discord OAuth2**
- 📊 **Profil utilisateur avec graphique QuickChart** affichant :

  - Total de chaque type de points
  - Progression semaine par semaine
  - Classement actuel

- 🖼️ **Avatar & pseudo Discord automatiquement synchronisés**

#### 🏆 Classements & Historique

- Visualisation en temps réel des classements :

  - Crystaux
  - PVP
  - IsCoin
  - Dragon Egg
  - Beacon
  - Sponge

- Historique complet par type de classement
- Page dédiée aux tops hebdomadaires / mensuels

#### ➕ Modification des points

Selon leur rôle Discord, les utilisateurs peuvent :

- Ajouter des points
- Retirer des points
- Voir en direct leur score mis à jour

Avec des **messages dynamiques contextualisés** (messages.js).

---

### 🔸 **Côté administrateur**

#### 🛠️ Dashboard

- Gestion de tous les tops (activation, démarrage, fermeture)
- Édition manuelle des scores
- Visualisation détaillée de chaque utilisateur
- Audit trail :

  - Qui modifie ?
  - Quand ?
  - Quel type ?

#### 🔐 Permissions avancées

Basé sur les rôles Discord :

| Rôle          | Permissions                                |
| ------------- | ------------------------------------------ |
| `ROLE_GANG`   | Modifier crystaux, pvp                     |
| `ROLE_ISLAND` | Modifier iscoin, dragonegg, beacon, sponge |
| `ROLE_STAFF`  | Accès complet (ignore les restrictions)    |

#### 🔔 Logs automatiques Discord

Chaque modification déclenche un log :

- Ajout de points
- Suppression de points
- Création d’un classement
- Fermeture d’un classement
- Anomalies détectées

---

## 💬 Commandes Discord

### `/leaderboard`

Affiche le classement du type sélectionné.

### `/points option:<add/remove> type:<...> amount:<nombre>`

Permet aux utilisateurs (selon rôle) de :

- Ajouter des points
- Retirer des points

Exemple :

```
/points option:add type:crystaux amount:50
```

### `/uptime`

Affiche le temps de fonctionnement du bot.

### `/help`

Affiche la liste des commandes disponibles.

### `/history type:<...>`

Consulter les anciens classements et naviguer entre les semaines

---

## 🌐 Site Web

### Pages principales :

#### 🏆 Classements

Visualisation en temps réel, filtrable par catégorie.

#### 👤 Profil

Contient :

- Votre avatar Discord
- Vos scores cumulés
- Votre classement global
- Un **graphique QuickChart** généré automatiquement

#### 📚 Historique

Liste de tous les tops terminés, consultables individuellement.

#### 🔧 Dashboard (Admin uniquement)

Gestion complète :

- Modifier les scores d’un utilisateur
- Lancer / terminer un classement
- Vérifier les logs
- Surveiller les événements récents

---

## 🧩 Partie technique

### **Stack :**

- **Backend :** Node.js + Express.js
- **Base de données :** Supabase (PostgreSQL)
- **Frontend :** React.js
- **Auth :** Discord OAuth2
- **Graphiques :** QuickChart
- **Hébergement :** Render + Supabase

### **Système des interactions Discord**

- Commands via API Discord (sans discord.js)
- Signature vérifiée via `verifyKeyMiddleware`
- Gestion 100% manuelle des réponses

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

# Install des commandes du bot discord
npm run register

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
DISCORD_CLIENT_PUBLIC_KEY...

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

🔗 GitHub : [https://github.com/FireDroX](https://github.com/FireDroX)
<br/>
🌐 Site : [https://lff.onrender.com](https://lff.onrender.com)
