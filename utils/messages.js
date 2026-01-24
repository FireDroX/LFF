const EMOJIS_TYPES = {
  // ===== TYPES =====
  crystaux: "<:crystaux:1435609810438717551>",
  pvp: "⚔️",
  iscoin: "<:iscoin:1435610578566516889>",
  dragonegg: "<:dragon_egg:1435590827723460628>",
  beacon: "<:beacon:1435590833276452874>",
  sponge: "<:sponge:1435590830772719717>",
};

// ✅ Messages pour ajout standard
const ADD_MESSAGES = [
  ({ user, score, type, total }) =>
    `> ✅ \`${user}\` vient d'ajouter **${score}** points **${type}** ${EMOJIS_TYPES[type]} (total : **${total}** points)`,
  ({ user, score, type, total }) =>
    `> 📊 \`${user}\` augmente son score de **${score}** sur **${type}** ${EMOJIS_TYPES[type]} (total : **${total}**)`,
  ({ user, score, type, total }) =>
    `> :loudspeaker: Update : \`${user}\` +${score} pts → total **${total}** (**${type}** ${EMOJIS_TYPES[type]})`,
  ({ user, score, type, total }) =>
    `> 🔹 Mise à jour : \`${user}\` +${score} pts (**${type}**) ${EMOJIS_TYPES[type]} → total **${total}**`,
  ({ user, score, type, total }) =>
    `> 📈 \`${user}\` améliore son score sur **${type}** ${EMOJIS_TYPES[type]} (+${score}, total : ${total})`,
  ({ user, score, type, total }) =>
    `> 🧮 \`${user}\` vient d’ajouter **${score}** points → total **${total}** sur **${type}** ${EMOJIS_TYPES[type]}`,
  ({ user, score, type, total }) =>
    `> 🔄 Mise à jour de \`${user}\` : +${score} points sur **${type}** ${EMOJIS_TYPES[type]} (total : ${total})`,
  ({ user, score, type, total }) =>
    `> 🪶 \`${user}\` enregistre un gain de **${score}** pts sur **${type}** ${EMOJIS_TYPES[type]} (total : ${total})`,
  ({ user, score, type, total }) =>
    `> 🧩 \`${user}\` ajoute ${score} pts à son total sur **${type}** ${EMOJIS_TYPES[type]} (${total} pts)`,
  ({ user, score, type, total }) =>
    `> ✳️ \`${user}\` actualise son score : +${score} pts (**${type}**) ${EMOJIS_TYPES[type]} → ${total} pts`,
];

// ✅ Messages pour première entrée dans le classement
const FIRST_ENTRY_MESSAGES = [
  ({ user, type, score }) =>
    `> 👋 \`${user}\` rejoint le classement **${type}** ${EMOJIS_TYPES[type]} avec **${score}** point(s)`,
  ({ user, type, score }) =>
    `> 🆕 \`${user}\` entre pour la première fois dans **${type}** ${EMOJIS_TYPES[type]} (${score} pts)`,
  ({ user, type, score }) =>
    `> 🌟 Nouvelle entrée : \`${user}\` commence sur **${type}** ${EMOJIS_TYPES[type]} (${score} pts)`,
  ({ user, type, score }) =>
    `> 🚀 \`${user}\` fait ses débuts sur **${type}** ${EMOJIS_TYPES[type]} (${score} points initiaux)`,
  ({ user, type, score }) =>
    `> 📍 Première participation de \`${user}\` sur **${type}** ${EMOJIS_TYPES[type]} (${score} pts)`,
  ({ user, type, score }) =>
    `> 🧭 \`${user}\` rejoint l’aventure **${type}** ${EMOJIS_TYPES[type]} avec ${score} pts`,
  ({ user, type, score }) =>
    `> ✨ \`${user}\` apparaît pour la première fois dans le top **${type}** ${EMOJIS_TYPES[type]} (${score} pts)`,
  ({ user, type, score }) =>
    `> 🪶 \`${user}\` débute dans le classement **${type}** ${EMOJIS_TYPES[type]} (${score} pts)`,
  ({ user, type, score }) =>
    `> 🔰 \`${user}\` s’inscrit pour la première fois dans **${type}** ${EMOJIS_TYPES[type]} (score : ${score})`,
  ({ user, type, score }) =>
    `> 🧩 Première activité détectée : \`${user}\` entre dans **${type}** ${EMOJIS_TYPES[type]} (${score} pts)`,
];

// ✅ Messages pour prise de première place
const FIRST_PLACE_MESSAGES = [
  ({ user, previousLeader, type }) =>
    `> 👑 \`${user}\` prend la 1ère place à \`${previousLeader}\` sur **${type}** ${EMOJIS_TYPES[type]}`,
  ({ user, previousLeader, type }) =>
    `> ⚡ \`${user}\` dépasse \`${previousLeader}\` et devient #1 sur **${type}** ${EMOJIS_TYPES[type]}`,
  ({ user, previousLeader, type }) =>
    `> 📈 \`${user}\` devient premier du classement **${type}** ${EMOJIS_TYPES[type]} (devant \`${previousLeader}\`)`,
  ({ user, previousLeader, type }) =>
    `> 🥇 \`${user}\` prend la tête sur **${type}** ${EMOJIS_TYPES[type]} – \`${previousLeader}\` passe 2e`,
  ({ user, previousLeader, type }) =>
    `> 🚀 \`${user}\` accède à la 1ère place sur **${type}** ${EMOJIS_TYPES[type]} devant \`${previousLeader}\``,
  ({ user, previousLeader, type }) =>
    `> 🔝 \`${user}\` s’impose face à \`${previousLeader}\` et devient #1 sur **${type}** ${EMOJIS_TYPES[type]}`,
  ({ user, previousLeader, type }) =>
    `> 🧭 \`${user}\` prend le contrôle du classement **${type}** ${EMOJIS_TYPES[type]} (ex-#1 : \`${previousLeader}\`)`,
  ({ user, previousLeader, type }) =>
    `> 🏅 \`${user}\` atteint la 1ère place — \`${previousLeader}\` rétrograde à la 2e position (**${type}**)`,
  ({ user, previousLeader, type }) =>
    `> 🧨 \`${user}\` s’empare de la tête du classement **${type}** ${EMOJIS_TYPES[type]} !`,
  ({ user, previousLeader, type }) =>
    `> 📊 \`${user}\` domine désormais **${type}** ${EMOJIS_TYPES[type]} (ex-premier : \`${previousLeader}\`)`,
];

// ✅ Message quand un user reset ses points
const REMOVE_MESSAGES = [
  ({ user, type }) =>
    `> ❌ \`${user}\` a supprimé ses points sur **${type}** ${EMOJIS_TYPES[type]}`,
  ({ user, type }) =>
    `> 🗑️ \`${user}\` a réinitialisé son score sur **${type}** ${EMOJIS_TYPES[type]}`,
  ({ user, type }) =>
    `> ♻️ \`${user}\` remet son compteur à zéro sur **${type}** ${EMOJIS_TYPES[type]}`,
  ({ user, type }) =>
    `> 🔄 \`${user}\` a vidé son score dans **${type}** ${EMOJIS_TYPES[type]}`,
  ({ user, type }) =>
    `> ⚠️ Réinitialisation du score de \`${user}\` sur **${type}** ${EMOJIS_TYPES[type]}`,
  ({ user, type }) =>
    `> 🧹 \`${user}\` nettoie son score dans **${type}** ${EMOJIS_TYPES[type]}`,
  ({ user, type }) =>
    `> 📉 \`${user}\` repart de zéro sur **${type}** ${EMOJIS_TYPES[type]}`,
  ({ user, type }) =>
    `> 🪣 \`${user}\` efface ses points sur **${type}** ${EMOJIS_TYPES[type]}`,
  ({ user, type }) =>
    `> 📴 \`${user}\` a retiré toutes ses contributions à **${type}** ${EMOJIS_TYPES[type]}`,
  ({ user, type }) =>
    `> 🧩 \`${user}\` a remis à zéro son score pour **${type}** ${EMOJIS_TYPES[type]}`,
];

// ✅ Messages pour ajout de points par le staff
const STAFF_ADD_MESSAGES = [
  ({ staff, target, score, type, total }) =>
    `> 🛠️ \`${staff}\` ajoute **${score}** points à \`${target}\` sur **${type}** ${EMOJIS_TYPES[type]} (total : **${total}**)`,
  ({ staff, target, score, type, total }) =>
    `> ✅ \`${staff}\` crédite \`${target}\` de **${score}** pts sur **${type}** ${EMOJIS_TYPES[type]} (nouveau total : ${total})`,
  ({ staff, target, score, type, total }) =>
    `> 📈 Action staff : \`${staff}\` a augmenté le score de \`${target}\` de **${score}** pts (**${type}**) ${EMOJIS_TYPES[type]} → ${total} pts`,
  ({ staff, target, score, type, total }) =>
    `> 🔹 \`${staff}\` a mis à jour le score de \`${target}\` (+${score}) sur **${type}** ${EMOJIS_TYPES[type]} (total : ${total})`,
  ({ staff, target, score, type, total }) =>
    `> 🧮 \`${staff}\` ajuste le score de \`${target}\` à **${total}** (+${score}) sur **${type}** ${EMOJIS_TYPES[type]}`,
  ({ staff, target, score, type, total }) =>
    `> 📊 \`${staff}\` a modifié le score de \`${target}\` sur **${type}** ${EMOJIS_TYPES[type]} (+${score}, total : ${total})`,
  ({ staff, target, score, type, total }) =>
    `> ⚙️ \`${staff}\` a appliqué un bonus de **${score}** points à \`${target}\` sur **${type}** ${EMOJIS_TYPES[type]} (total : ${total})`,
  ({ staff, target, score, type, total }) =>
    `> 🪶 Mise à jour manuelle : \`${staff}\` → \`${target}\` +${score} pts (**${type}**) ${EMOJIS_TYPES[type]} (total : ${total})`,
  ({ staff, target, score, type, total }) =>
    `> 🧾 \`${staff}\` ajoute **${score}** pts à \`${target}\` sur **${type}** ${EMOJIS_TYPES[type]} (nouveau total : ${total})`,
  ({ staff, target, score, type, total }) =>
    `> 🟢 Intervention staff : \`${staff}\` crédite \`${target}\` de **${score}** pts (**${type}** ${EMOJIS_TYPES[type]}) → total ${total}`,
];

// ✅ Messages pour retrait de points par le staff
const STAFF_REMOVE_MESSAGES = [
  ({ staff, target, score, type, total }) =>
    `> ⚠️ \`${staff}\` retire **${score}** points à \`${target}\` sur **${type}** ${EMOJIS_TYPES[type]} (total : **${total}**)`,
  ({ staff, target, score, type, total }) =>
    `> 🧹 \`${staff}\` a réduit le score de \`${target}\` de **${score}** pts (**${type}** ${EMOJIS_TYPES[type]}) → ${total} pts`,
  ({ staff, target, score, type, total }) =>
    `> 📉 \`${staff}\` a ajusté à la baisse le score de \`${target}\` (-${score}) sur **${type}** ${EMOJIS_TYPES[type]} (total : ${total})`,
  ({ staff, target, score, type, total }) =>
    `> 🔻 \`${staff}\` a retiré ${score} points à \`${target}\` sur **${type}** ${EMOJIS_TYPES[type]} (restant : ${total})`,
  ({ staff, target, score, type, total }) =>
    `> 🪣 Mise à jour : \`${staff}\` a décrémenté le score de \`${target}\` de **${score}** pts (**${type}**) → ${total}`,
  ({ staff, target, score, type, total }) =>
    `> 🧾 Action staff : \`${staff}\` corrige le score de \`${target}\` (-${score}) sur **${type}** ${EMOJIS_TYPES[type]} (total : ${total})`,
  ({ staff, target, score, type, total }) =>
    `> 🗑️ \`${staff}\` a supprimé **${score}** pts du score de \`${target}\` (**${type}**) ${EMOJIS_TYPES[type]} → ${total}`,
  ({ staff, target, score, type, total }) =>
    `> 🪫 \`${staff}\` a réduit manuellement le score de \`${target}\` de **${score}** pts sur **${type}** ${EMOJIS_TYPES[type]}`,
  ({ staff, target, score, type, total }) =>
    `> 🔧 \`${staff}\` a appliqué une correction (-${score}) sur le score de \`${target}\` (**${type}** ${EMOJIS_TYPES[type]}) (total : ${total})`,
  ({ staff, target, score, type, total }) =>
    `> ⚙️ Intervention staff : \`${staff}\` a ajusté \`${target}\` (-${score}) sur **${type}** ${EMOJIS_TYPES[type]} (nouveau total : ${total})`,
];

// ✅ Messages pour nouveau top créé
const NEW_TOP_MESSAGES = [
  ({ type, start, end }) =>
    `> 🏁 Nouveau classement **${type}** ${EMOJIS_TYPES[type]} lancé \`(${start} → ${end})\``,
  ({ type, start, end }) =>
    `> 📅 Début d’un nouveau cycle pour **${type}** ${EMOJIS_TYPES[type]} \`(${start} → ${end})\``,
  ({ type, start, end }) =>
    `> 🆕 Le classement **${type}** ${EMOJIS_TYPES[type]} est désormais actif \`(${start} → ${end})\``,
  ({ type, start, end }) =>
    `> 🪶 Nouveau top ouvert : **${type}** ${EMOJIS_TYPES[type]} \`(${start} → ${end})\``,
  ({ type, start, end }) =>
    `> 📊 Ouverture d’un nouveau classement **${type}** ${EMOJIS_TYPES[type]} \`(${start} → ${end})\``,
  ({ type, start, end }) =>
    `> 🔔 Le nouveau cycle **${type}** ${EMOJIS_TYPES[type]} commence ! \`(${start} → ${end})\``,
  ({ type, start, end }) =>
    `> 🧾 Un nouveau top **${type}** ${EMOJIS_TYPES[type]} vient d’être lancé \`(${start} → ${end})\``,
  ({ type, start, end }) =>
    `> 🕓 Nouveau classement actif pour **${type}** ${EMOJIS_TYPES[type]} \`(${start} → ${end})\``,
  ({ type, start, end }) =>
    `> ⚙️ Mise en place d’un nouveau classement **${type}** ${EMOJIS_TYPES[type]} \`(${start} → ${end})\``,
  ({ type, start, end }) =>
    `> 📈 Redémarrage du classement **${type}** ${EMOJIS_TYPES[type]} \`(${start} → ${end})\``,
];

// ✅ Messages pour fin de top
const END_TOP_MESSAGES = [
  ({ type, start, end, podium }) =>
    `> 🏆 Résultats du classement **${type}** ${EMOJIS_TYPES[type]} \`(${start} → ${end})\`\n` +
    podium.join("\n"),
  ({ type, start, end, podium }) =>
    `> 📊 Fin du classement **${type}** ${EMOJIS_TYPES[type]} \`(${start} → ${end})\`\n` +
    podium.join("\n"),
  ({ type, start, end, podium }) =>
    `> 📅 Classement terminé pour **${type}** ${EMOJIS_TYPES[type]} \`(${start} → ${end})\`\n` +
    podium.join("\n"),
  ({ type, start, end, podium }) =>
    `> 🥇 Fin de période pour **${type}** ${EMOJIS_TYPES[type]} \`(${start} → ${end})\`\n` +
    podium.join("\n"),
  ({ type, start, end, podium }) =>
    `> 🏁 Bilan du classement **${type}** ${EMOJIS_TYPES[type]} \`(${start} → ${end})\`\n` +
    podium.join("\n"),
  ({ type, start, end, podium }) =>
    `> 🧾 Résumé final du top **${type}** ${EMOJIS_TYPES[type]} \`(${start} → ${end})\`\n` +
    podium.join("\n"),
  ({ type, start, end, podium }) =>
    `> 🕒 Clôture du classement **${type}** ${EMOJIS_TYPES[type]} \`(${start} → ${end})\`\n` +
    podium.join("\n"),
  ({ type, start, end, podium }) =>
    `> 🧩 Classement **${type}** ${EMOJIS_TYPES[type]} terminé \`(${start} → ${end})\`\n` +
    podium.join("\n"),
  ({ type, start, end, podium }) =>
    `> 📈 Résultats finaux pour **${type}** ${EMOJIS_TYPES[type]} \`(${start} → ${end})\`\n` +
    podium.join("\n"),
  ({ type, start, end, podium }) =>
    `> 🗓️ Le classement **${type}** ${EMOJIS_TYPES[type]} est maintenant clos \`(${start} → ${end})\`\n` +
    podium.join("\n"),
];

// ✅ Message suppression de X points
const REMOVE_SINGLE_MESSAGES = [
  ({ user, score, type, total }) =>
    `> ➖ \`${user}\` a retiré **${score} ${type}** ${EMOJIS_TYPES[type]}. Nouveau total : **${total}**.`,
  ({ user, score, type, total }) =>
    `> 🔻 ${score} ${type} ${EMOJIS_TYPES[type]} ont été retirés à \`${user}\`. Total actuel : **${total}**.`,
  ({ user, score, type, total }) =>
    `> ❗ \`${user}\` perd **${score} ${type}** ${EMOJIS_TYPES[type]}. Nouveau score : **${total}**.`,
  ({ user, score, type, total }) =>
    `> 📉 Retrait de **${score} ${type}** ${EMOJIS_TYPES[type]} pour \`${user}\`. Total = **${total}**.`,
  ({ user, score, type, total }) =>
    `> ⚠️ \`${user}\` s'est vu retirer **${score} ${type}** ${EMOJIS_TYPES[type]}. Score restant : **${total}**.`,
  ({ user, score, type, total }) =>
    `> 🔴 ${score} ${type} ${EMOJIS_TYPES[type]} en moins pour \`${user}\`. Nouveau total : **${total}**.`,
  ({ user, score, type, total }) =>
    `> ⬇️ \`${user}\` perd ${score} ${type} ${EMOJIS_TYPES[type]}. Total mis à jour : **${total}**.`,
  ({ user, score, type, total }) =>
    `> ❌ ${score} ${type} ${EMOJIS_TYPES[type]} retirés à \`${user}\`. Score après retrait : **${total}**.`,
  ({ user, score, type, total }) =>
    `> 🟥 \`${user}\` perd ${score} ${type} ${EMOJIS_TYPES[type]}. Nouveau score total : **${total}**.`,
  ({ user, score, type, total }) =>
    `> 📕 ${score} ${type} ${EMOJIS_TYPES[type]} retirés à \`${user}\`. Total restant : **${total}**.`,
];

// ✅ Fonction utilitaire pour tirer un message random
function getRandomMessage(messages, payload) {
  const fn = messages[Math.floor(Math.random() * messages.length)];
  return fn(payload);
}

module.exports = {
  getRandomMessage,
  MESSAGE_SETS: {
    ADD: ADD_MESSAGES,
    FIRST_ENTRY: FIRST_ENTRY_MESSAGES,
    FIRST_PLACE: FIRST_PLACE_MESSAGES,
    REMOVE: REMOVE_MESSAGES,
    REMOVE_SINGLE: REMOVE_SINGLE_MESSAGES,
    NEW_TOP: NEW_TOP_MESSAGES,
    STAFF_ADD: STAFF_ADD_MESSAGES,
    STAFF_REMOVE: STAFF_REMOVE_MESSAGES,
    END_TOP: END_TOP_MESSAGES,
  },
};
