# LFF

> Leaderboard & Points pour la communauté

## 📋 Table des matières

1. [Description](#description)
2. [Fonctionnalités](#fonctionnalités)
3. [Technologies](#technologies)
4. [Utilisation](#utilisation)
5. [Contribuer](#contribuer)
6. [Contact](#contact)

---

## 🚀 Description

LFF est une application full-stack légère qui permet de gérer un **classement de points** pour les membres d’une communauté.
On peut :

- Voir un **tableau de classement** des utilisateurs triés par score.
- « Ajouter » des points pour un utilisateur (via un composant d’ajout).
- Séparer visuellement les utilisateurs ayant **50 points ou plus** des autres avec une barre de séparation.
- Afficher une période (date de début / fin) sur cette barre (ex : `(10/26 00h00)`) pour indiquer la période en cours.

---

## 🧩 Fonctionnalités

- Affichage dynamique du classement (`top.users`) trié par score.
- Icônes trophée pour les 3 premiers.
- Formatage des scores (par ex. avec des espaces).
- Barre de séparation « 50 pts mini » (ou personnalisable) pour distinguer deux groupes.
- Composant d’ajout de points pour les utilisateurs connectés (`isLogged`).
- Mise à jour partielle de l’état : seule la clé `users` est remplacée lorsque de nouveaux points sont ajoutés.
- Période visible via `start` / `end`, formatée pour l’affichage.

---

## 🛠️ Technologies

- **Frontend** : React (JSX, CSS)
- **Icons** : react-icons
- **Backend / API** : Express (dossier `api/express`)
- **Déploiement** : Peut être hébergé sur Render.com ou autre (voir lien du repo)
- **Language principale** : JavaScript
- **Styles** : CSS

---

## 🎮 Utilisation

- Connecte-toi (ou tu peux activer la propriété `isLogged` manuellement pour test).
- Ajoute des points via le bouton « Ajouter » (le bouton est actif quand `points > 0`).
- Le tableau se mettra à jour : seule la partie `users` de l’état global est remplacée, ce qui permet de ne pas écraser `start` / `end`.
- Le composant `Leaderboard` :

  ```jsx
  <Leaderboard
    top={topCrystaux.users}
    start={topCrystaux.start}
    end={topCrystaux.end}
    requiredAmount={topCrystaux.requiredAmount}
  />
  ```

- Le format de la date dans la barre de séparation est raccourci : ex : `(10/26 00h00)`.

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

## 📬 Contact

Pour toute question ou suggestion :

- GitHub : [FireDroX](https://github.com/FireDroX)
- Projet hébergé : [lff.onrender.com](https://lff.onrender.com)

---
