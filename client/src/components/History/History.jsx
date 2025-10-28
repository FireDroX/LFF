import "./History.css";
import { useEffect, useState } from "react";
import { MdCancel } from "react-icons/md";
import historyTops from "../../utils/historyTops";
import { formatNumberWithSpaces, formatDateShort } from "../../utils/functions";
import { FaTrophy } from "react-icons/fa";

const History = ({ closeModal }) => {
  const [history, setHistory] = useState({ crystaux: [], iscoin: [] });
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("crystaux");

  useEffect(() => {
    const fetchHistory = async () => {
      const data = await historyTops();
      if (Array.isArray(data)) {
        setHistory({
          crystaux: data.filter((t) => t.type === "crystaux"),
          iscoin: data.filter((t) => t.type === "iscoin"),
        });
      }
      setLoading(false);
    };
    fetchHistory();
  }, []);

  const renderLeaderboard = (title, tops) => (
    <div className="history-leaderboard">
      <h5 style={{ color: "var(--text85)" }}>{title}</h5>
      {tops.length === 0 ? (
        <p style={{ color: "var(--text50)", fontSize: "0.8rem" }}>
          Aucun historique
        </p>
      ) : (
        tops.map((top) => {
          const sorted = [...(top.users || [])].sort(
            (a, b) => b.score - a.score
          );
          const start = formatDateShort(top.start_date);
          const end = formatDateShort(top.end_date);

          return (
            <ul className="lff-classement" key={top.id}>
              {sorted.slice(0, 5).map(({ score, name }, index) => (
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
              ))}

              {start && end && (
                <li key="dates" className="lff-separator">
                  <span className="lff-separator-text">
                    {start} - {end}
                  </span>
                </li>
              )}
            </ul>
          );
        })
      )}
    </div>
  );

  return (
    <div className="history-modal">
      <button className="close-btn" onClick={closeModal}>
        <MdCancel size={22} />
      </button>

      <select
        className="history-select"
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
      >
        <option value="crystaux">💎 Crystaux</option>
        <option value="iscoin">🪙 Iscoin</option>
      </select>

      {loading ? (
        <div className="history-loading">Chargement...</div>
      ) : selectedType === "crystaux" ? (
        renderLeaderboard("💎 Historique Crystaux", history.crystaux)
      ) : (
        renderLeaderboard("🪙 Historique Iscoin", history.iscoin)
      )}
    </div>
  );
};

export default History;
