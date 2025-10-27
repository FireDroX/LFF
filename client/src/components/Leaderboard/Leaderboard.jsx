import "./Leaderboard.css";
import { FaTrophy } from "react-icons/fa";
import formatNumberWithSpaces from "../../utils/formatNumberWithSpaces";

const Leaderboard = ({ top, start, end }) => {
  // On trie les joueurs par score décroissant
  const sorted = [...top].sort((a, b) => b.score - a.score);

  // Trouver la position où les scores passent en dessous de 50
  const separationIndex = sorted.findIndex((player) => player.score < 50);

  const formatDateShort = (isoString) => {
    const date = new Date(isoString);
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${day}/${month} ${hours}h${minutes}`;
  };

  return (
    <>
      <h1 style={{ color: "var(--text85)" }}>Crystaux LFF</h1>
      <ul className="lff-classement">
        {sorted.map(({ score, name }, index) => (
          <>
            {/* Barre de séparation si on est juste avant le groupe < 50 */}
            {separationIndex === index && (
              <li key="separator" className="lff-separator">
                <span className="lff-separator-text">50 pts mini</span>
              </li>
            )}
            <li key={index}>
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
          </>
        ))}
        <li key="separator" className="lff-separator">
          <span className="lff-separator-text">
            {formatDateShort(start)} - {formatDateShort(end)}
          </span>
        </li>
      </ul>
    </>
  );
};

export default Leaderboard;
