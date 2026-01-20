import "./Leaderboard.css";
import { FaTrophy } from "react-icons/fa";
import { formatNumberWithSpaces, formatDateShort } from "../../utils/functions";

const Leaderboard = ({
  title,
  top,
  start,
  end,
  requiredAmount,
  currentUser,
}) => {
  // On trie les joueurs par score décroissant
  const sorted = Array.isArray(top)
    ? [...top].sort((a, b) => b.score - a.score)
    : [];

  // Trouver la position où les scores passent en dessous de `requiredAmount` (50 ou 1000)
  const separationIndex = sorted.findIndex(
    (player) => player.score < requiredAmount,
  );

  // Find the current user's position
  const userPosition = currentUser
    ? sorted.findIndex((u) => u.userId === currentUser) + 1
    : 0;

  const startFormatted = formatDateShort(start);
  const endFormatted = formatDateShort(end);

  return (
    <div className="lff-leaderboard">
      <div className="lff-header">
        <div className="lff-header-left">
          <h5 className="lff-header-title">{title}</h5>
        </div>

        <span className="lff-header-min">
          {requiredAmount > 0
            ? `MIN ${formatNumberWithSpaces(requiredAmount)} PTS`
            : "NO MIN"}
        </span>
      </div>
      <ul className="lff-classement">
        {Array.isArray(sorted) &&
          sorted.slice(0, 3).flatMap(({ score, name }, index) => {
            const maxScore = sorted.length > 0 ? sorted[0].score : 1;
            const currentUserData =
              userPosition > 0
                ? {
                    name: sorted[userPosition - 1]?.name,
                    score: sorted[userPosition - 1]?.score,
                    position: userPosition,
                  }
                : {
                    name: "You",
                    score: 0,
                    position: "??",
                  };

            const items = [];

            items.push(
              <li key={`player-${index}`} className="lff-player">
                <div className="lff-row">
                  <span
                    className="lff-classement-top"
                    style={{
                      color:
                        index === 0
                          ? "#FFD700"
                          : index === 1
                            ? "#C0C0C0"
                            : "#CD7F32",
                    }}
                  >
                    0{index + 1}
                  </span>

                  <span className="lff-classement-name">{name}</span>

                  <span className="lff-classement-score">
                    {formatNumberWithSpaces(score)}
                  </span>
                </div>

                <div className="lff-progress-bar">
                  <div
                    className="lff-progress-bar-fill"
                    style={{
                      width: `${(score / maxScore) * 100}%`,
                    }}
                  />
                </div>
              </li>,
            );

            if (index === 2) {
              items.push(
                <li
                  key="player-current"
                  className="lff-player lff-current-user"
                >
                  <div className="lff-row">
                    <span
                      className="lff-classement-top"
                      style={{
                        color: "var(--text35)",
                      }}
                    >
                      {String(currentUserData.position).padStart(2, "0")}
                    </span>

                    <span className="lff-classement-name">
                      {currentUserData.name}
                    </span>

                    <span className="lff-classement-score">
                      {formatNumberWithSpaces(currentUserData.score)}
                    </span>
                  </div>

                  <div className="lff-progress-bar">
                    <div
                      className="lff-progress-bar-fill"
                      style={{
                        width: `${
                          currentUserData.score > 0
                            ? (currentUserData.score / maxScore) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </li>,
              );
            }

            return items;
          })}
      </ul>
    </div>
  );
};

export default Leaderboard;
