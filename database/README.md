# Correspondance Supabase → MySQL

La structure Supabase confirmée utilise trois tables applicatives :

- `tops`
- `users`
- `top_rankings`

L'utilisateur est authentifié par Discord. `users.id` contient l'identifiant
Discord (stocké en texte depuis la migration historique du projet) et
`users.name` son pseudo courant. `top_rankings` référence à la fois
`tops.id` et `users.id`.

Les anciennes fonctions PostgreSQL sont remplacées ainsi :

| Fonction Supabase | Équivalent MySQL/Node |
| --- | --- |
| `get_current_leaderboard` | `findActiveTop` + `getLeaderboard` |
| `get_last_leaderboard` | `findLastTop` + `getLeaderboard` |
| `get_leaderboard_history` | `getHistory` |
| `increment_score` | `adjustScore` dans une transaction |
| `staff_adjust_score` | `adjustScore` dans une transaction |

Le script `npm run db:verify` contrôle les colonnes, l'incrément atomique, les
égalités de rang et la suppression à zéro. Ses données de test sont annulées
avec un rollback.
