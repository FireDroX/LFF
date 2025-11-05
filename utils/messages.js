const EMOJIS_TYPES = {
  crystaux: "<:crystaux:1435609810438717551>",
  iscoin: "<:iscoin:1435610578566516889>",
  dragonegg: "<:dragon_egg:1435590827723460628>",
  beacon: "<:beacon:1435590833276452874>",
  sponge: "<:sponge:1435590830772719717>",
};

// ✅ Messages pour ajout standard
const ADD_MESSAGES = [
  ({ user, score, type, total }) =>
    `> ✅ **${user}** vient d'ajouter **${score}** points **${type}** ${EMOJIS_TYPES[type]} (total : **${total}** points)`,
  ({ user, score, type, total }) =>
    `> 📊 **${user}** augmente son score de **${score}** sur **${type}** ${EMOJIS_TYPES[type]} (total : **${total}**)`,
  ({ user, score, type, total }) =>
    `> :loudspeaker: Update : **${user}** +${score} pts → total **${total}** (**${type}** ${EMOJIS_TYPES[type]})`,
];

// ✅ Messages pour première entrée dans le classement
const FIRST_ENTRY_MESSAGES = [
  ({ user, type, score }) =>
    `> 👀 **${user}** participe pour la première fois au classement **${type}** ${EMOJIS_TYPES[type]} \`(avec ${score} point(s))\``,

  ({ user, type, score }) =>
    `> 🌱 **${user}** fait son entrée dans le classement **${type}** ${EMOJIS_TYPES[type]} \`(début avec ${score} point(s))\``,

  ({ user, type, score }) =>
    `> 🆕 Première contribution de **${user}** sur **${type}** ${EMOJIS_TYPES[type]} \`(${score} point(s) ajoutés)\``,
];

// ✅ Messages pour prise de première place
const FIRST_PLACE_MESSAGES = [
  ({ user, previousLeader, type }) =>
    `> 👑 **${user}** prend la 1ère place à **${previousLeader}** sur **${type}** ${EMOJIS_TYPES[type]} !`,
  ({ user, previousLeader, type }) =>
    `> 📈 **${user}** dépasse **${previousLeader}** et prend la tête sur **${type}** ${EMOJIS_TYPES[type]}`,
  ({ user, previousLeader, type }) =>
    `> ⚡ **${user}** devient #1 → **${previousLeader}** tombe à la 2e place (**${type}** ${EMOJIS_TYPES[type]})`,
];

// ✅ Message quand un user reset ses points
const REMOVE_MESSAGES = [
  ({ user, type }) => `> ❌ **${user}** a supprimé ses points sur **${type}**`,
  ({ user, type }) =>
    `> 🗑️ Reset : **${user}** remet son score à zéro sur **${type}**`,
  ({ user, type }) => `> ♻️ **${user}** a réinitialisé son score (**${type}**)`,
];

const STAFF_ADD_MESSAGES = [
  ({ staff, target, score, type, total }) =>
    `> 🛠️ **${staff}** ajoute **${score}** points à **${target}** sur **${type}** ${EMOJIS_TYPES[type]} (total : **${total}**)`,
  ({ staff, target, score, type, total }) =>
    `> ✅ Staff : **${staff}** booste **${target}** de **${score}** pts (**${type}** ${EMOJIS_TYPES[type]}) → total **${total}**`,
  ({ staff, target, score, type, total }) =>
    `> 📈 **${staff}** crédite **${target}** de **+${score}** pts sur **${type}** ${EMOJIS_TYPES[type]} (total : **${total}**)`,
];

const STAFF_REMOVE_MESSAGES = [
  ({ staff, target, score, type, total }) =>
    `> ⚠️ **${staff}** retire **${score}** points à **${target}** sur **${type}** ${EMOJIS_TYPES[type]} (total : **${total}**)`,
  ({ staff, target, score, type, total }) =>
    `> 🧹 Staff : **${staff}** ajuste **${target}** de **-${score}** pts (**${type}** ${EMOJIS_TYPES[type]}) → total **${total}**`,
  ({ staff, target, score, type, total }) =>
    `> 📉 **${staff}** réduit le score de **${target}** de **${score}** pts sur **${type}** ${EMOJIS_TYPES[type]} (total : **${total}**)`,
];

// ✅ Messages pour nouveau top créé
const NEW_TOP_MESSAGES = [
  ({ type, start, end }) =>
    `> 🏁 Nouveau classement **${type}** ${EMOJIS_TYPES[type]} lancé \`(${start} → ${end})\``,

  ({ type, start, end }) =>
    `> 📅 Début d’un nouveau cycle pour **${type}** ${EMOJIS_TYPES[type]} \`(${start} → ${end})\``,

  ({ type, start, end }) =>
    `> 🆕 Le classement **${type}** ${EMOJIS_TYPES[type]} vient d’être ouvert \`(${start} → ${end})\``,
];

// ✅ Fonction utilitaire pour tirer un message random
function getRandomMessage(messages, payload) {
  const fn = messages[Math.floor(Math.random() * messages.length)];
  return fn(payload);
}

module.exports = {
  getRandomMessage,
  ADD_MESSAGES,
  FIRST_ENTRY_MESSAGES,
  FIRST_PLACE_MESSAGES,
  REMOVE_MESSAGES,
  NEW_TOP_MESSAGES,
  STAFF_ADD_MESSAGES,
  STAFF_REMOVE_MESSAGES,
};
