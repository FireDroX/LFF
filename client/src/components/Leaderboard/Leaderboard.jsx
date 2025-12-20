import "./Leaderboard.css";
import { FaTrophy } from "react-icons/fa";
import { formatNumberWithSpaces, formatDateShort } from "../../utils/functions";

const Leaderboard = ({ title, top, start, end, requiredAmount, currentUser }) => {
  // On trie les joueurs par score décroissant
  const sorted = Array.isArray(top)
    ? [...top].sort((a, b) => b.score - a.score)
    : [];

  // Trouver la position où les scores passent en dessous de `requiredAmount` (50 ou 1000)
  const separationIndex = sorted.findIndex(
    (player) => player.score < requiredAmount
  );

  // Find the current user's position
  const userPosition = currentUser ? sorted.findIndex((u) => u.userId === currentUser.id) + 1 : 0;

  const startFormatted = formatDateShort(start);
  const endFormatted = formatDateShort(end);

  return (
    <div>
      <h5 style={{ color: "var(--text85)" }}>{title}</h5>
      <ul className="lff-classement">
        {Array.isArray(sorted) &&
          sorted.flatMap(({ score, name }, index) => {
            const items = [];
            if (separationIndex === index) {
              items.push(
                <li key={`separator-${index}`} className="lff-separator">
                  <span className="lff-separator-text">
                    {requiredAmount} pts mini
                  </span>
                </li>
              );
            }
            items.push(
              <li key={`player-${index}`}>
                <span className="lff-classement-top">
                  {index === 0 ? (
                    <FaTrophy color="#FFD700" />
                  ) : index === 1 ? (
                    <FaTrophy color="#C0C0C0" />
                  ) : index === 2 ? (
                    <FaTrophy color="#CD7F32" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="lff-classement-score">
                  {formatNumberWithSpaces(score)}
                </span>
                <span className="lff-classement-name">{name}</span>
              </li>
            );
            return items;
          })}

        <li key="dates" className="lff-separator">
          <span className="lff-separator-text">
            {startFormatted && endFormatted
              ? `${startFormatted} - ${endFormatted}`
              : ""}
          </span>
        </li>
      </ul>
    </div>
  );
};

export default Leaderboard;
