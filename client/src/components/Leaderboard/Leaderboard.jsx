import "./Leaderboard.css";
import { formatNumberWithSpaces } from "../../utils/functions";

const DEFAULT_TOP = [
  { userId: null, name: "No Data", score: 0 },
  { userId: null, name: "No Data", score: 0 },
  { userId: null, name: "No Data", score: 0 },
];

const Leaderboard = ({ title, top, requiredAmount, currentUser }) => {
  // On trie les joueurs par score décroissant
  const safeTop = Array.isArray(top) && top.length > 0 ? top : DEFAULT_TOP;

  const sorted = [...safeTop].sort((a, b) => b.score - a.score);

  // Find the current user's position
  const userPosition = currentUser
    ? sorted.findIndex(
        (u) => u.userId != null && String(u.userId) === String(currentUser),
      ) + 1
    : 0;
  const maxScore = Math.max(Number(sorted[0]?.score) || 0, 1);
  const progressWidth = (score) =>
    `${Math.min(100, Math.max(0, ((Number(score) || 0) / maxScore) * 100))}%`;

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
              <li
                key={`player-${index}`}
                className={`lff-player lff-player--rank-${index + 1}`}
              >
                <div className="lff-row">
                  <span className="lff-classement-top">
                    0{index + 1}
                  </span>

                  <span className="lff-classement-name">{name}</span>

                  <span className="lff-classement-score">
                    {typeof score === "string"
                      ? score
                      : formatNumberWithSpaces(score)}
                  </span>
                </div>

                <div className="lff-progress-bar">
                  <div
                    className="lff-progress-bar-fill"
                    style={{
                      width: progressWidth(score),
                    }}
                  />
                </div>
              </li>,
            );

            if (index === 2) {
              items.push(<li key="separator" className="lff-separator" />);
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
                      {typeof currentUserData.score === "string"
                        ? currentUserData.score
                        : formatNumberWithSpaces(currentUserData.score)}
                    </span>
                  </div>

                  <div className="lff-progress-bar">
                    <div
                      className="lff-progress-bar-fill"
                      style={{
                        width: progressWidth(currentUserData.score),
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
