import "./StaffDashboard.css";
import { useCallback, useEffect, useState } from "react";

import currentTop from "../../utils/currentTop";
import staffUpdatePoints from "../../utils/staffUpdatePoints";
import {
  WEEKLY_OPTIONS,
  ISVALUE_OPTIONS,
} from "../../utils/pointOptions";
import {
  formatNumberWithSpaces,
  formatDateShort,
} from "../../utils/functions";

const STAFF_TYPES = ["crystaux", "iscoin", "dragonegg", "beacon", "sponge"];
const POINT_OPTIONS = {
  ...WEEKLY_OPTIONS,
  ...ISVALUE_OPTIONS,
};

const EMPTY_FORM = {
  selectedUserKey: "",
  username: "",
  userId: "",
  points: "",
};

const buildInitialFormsState = () =>
  STAFF_TYPES.reduce((acc, type) => {
    acc[type] = { ...EMPTY_FORM };
    return acc;
  }, {});

const StaffDashboard = ({ isLogged, flags }) => {
  const isStaff =
    Boolean(isLogged) && Array.isArray(flags) && flags.includes("staff");

  const [leaderboards, setLeaderboards] = useState({});
  const [forms, setForms] = useState(() => buildInitialFormsState());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(null);

  const resetForm = (type) => {
    setForms((prev) => ({
      ...prev,
      [type]: { ...EMPTY_FORM },
    }));
  };

  const updateForm = (type, patch) => {
    setForms((prev) => ({
      ...prev,
      [type]: {
        ...(prev[type] || { ...EMPTY_FORM }),
        ...patch,
      },
    }));
  };

  const loadLeaderboards = useCallback(() => {
    setLoading(true);
    Promise.all(
      STAFF_TYPES.map((type) =>
        currentTop(type)
          .then((data) => {
            if (data?.error) throw new Error(data.error);
            return [type, data];
          })
          .catch((err) => {
            console.error(`Failed to load leaderboard ${type}`, err);
            return [type, null];
          })
      )
    )
      .then((entries) => {
        const mapped = {};
        let hasFailure = false;

        entries.forEach(([type, data]) => {
          if (!data) {
            hasFailure = true;
            return;
          }
          mapped[type] = data;
        });

        setLeaderboards(mapped);
        setError(
          hasFailure
            ? "Certaines données n'ont pas pu être chargées. Réessayez."
            : ""
        );
      })
      .catch((err) => {
        console.error("Failed to load staff leaderboards", err);
        setError("Impossible de charger les classements pour le moment.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isStaff) {
      loadLeaderboards();
    } else {
      setLeaderboards({});
      setError("");
      setLoading(false);
    }
  }, [isStaff, loadLeaderboards]);

  const handleSelectUser = (type, value) => {
    if (!value) {
      resetForm(type);
      return;
    }

    const users = leaderboards[type]?.users || [];
    let selectedUser = null;

    if (value.startsWith("id:")) {
      const id = value.slice(3);
      selectedUser = users.find(
        (user) => user.userId && String(user.userId) === id
      );
    } else if (value.startsWith("idx:")) {
      const index = Number(value.slice(4));
      if (!Number.isNaN(index) && users[index]) {
        selectedUser = users[index];
      }
    }

    if (selectedUser) {
      updateForm(type, {
        selectedUserKey: value,
        username: selectedUser.name || "",
        userId: selectedUser.userId ? String(selectedUser.userId) : "",
      });
    } else {
      updateForm(type, { selectedUserKey: value });
    }
  };

  const submitChange = async (type, direction) => {
    const form = forms[type] || { ...EMPTY_FORM };
    const amount = Number(form.points);

    if (!amount || amount <= 0) {
      setError("Veuillez indiquer un nombre de points strictement positif.");
      return;
    }

    if (!form.username && !form.userId) {
      setError(
        "Un nom d'utilisateur ou un identifiant Discord est requis pour continuer."
      );
      return;
    }

    try {
      setSubmitting(type);
      setError("");

      const payload = {
        delta: direction === "add" ? amount : -amount,
        username: form.username || undefined,
        userId: form.userId ? String(form.userId) : undefined,
      };

      const updated = await staffUpdatePoints(type, payload);
      if (updated?.error) {
        throw new Error(updated.error);
      }

      setLeaderboards((prev) => ({
        ...prev,
        [type]: {
          ...(prev[type] || {}),
          ...updated,
        },
      }));
      resetForm(type);
    } catch (err) {
      console.error("Staff update failed", err);
      setError(
        err?.message ||
          "Impossible de mettre à jour le classement. Réessayez."
      );
    } finally {
      setSubmitting(null);
    }
  };

  const renderLeaderboardRows = (users = []) => {
    if (!Array.isArray(users) || users.length === 0) {
      return (
        <tr>
          <td colSpan="4" className="staff-empty">
            Aucun joueur pour le moment.
          </td>
        </tr>
      );
    }

    return users.map((user, index) => (
      <tr key={`${user.userId || user.name || index}-${index}`}>
        <td>{index + 1}</td>
        <td>{user.name || "Sans nom"}</td>
        <td>{formatNumberWithSpaces(user.score || 0)}</td>
        <td>{user.userId || "—"}</td>
      </tr>
    ));
  };

  if (!isStaff) {
    return (
      <section className="App">
        <div className="staff-dashboard staff-dashboard--center">
          <div className="staff-card">
            <h3>Accès refusé</h3>
            <p>
              Ce tableau de bord est réservé aux membres du staff habilités.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="App">
      <div className="staff-dashboard">
        <div className="staff-dashboard-header">
          <div>
            <h2>Gestion des classements</h2>
            <p>
              Ajustez les scores en temps réel. Sélectionnez un joueur existant
              ou saisissez un nouveau membre.
            </p>
          </div>
          <button
            className="staff-refresh"
            onClick={loadLeaderboards}
            disabled={loading || submitting !== null}
          >
            Recharger
          </button>
        </div>

        {error && <div className="staff-error">{error}</div>}

        {loading ? (
          <div className="spinner-container">
            <div className="spinner" aria-hidden="true"></div>
          </div>
        ) : (
          <div className="staff-grid">
            {STAFF_TYPES.map((type) => {
              const option = POINT_OPTIONS[type] || {};
              const board = leaderboards[type] || {};
              const users = board.users || [];
              const form = forms[type] || { ...EMPTY_FORM };
              const disabled = submitting === type;
              const hasDates = board.start && board.end;

              return (
                <div className="staff-card" key={type}>
                  <div className="staff-card-header">
                    <div className="staff-card-title">
                      <h3>{option.label || type}</h3>
                      {option.icon && (
                        <img
                          src={option.icon}
                          alt={option.label || type}
                          className="staff-card-icon"
                        />
                      )}
                    </div>
                    {hasDates && (
                      <span className="staff-period">
                        {formatDateShort(board.start)} -{" "}
                        {formatDateShort(board.end)}
                      </span>
                    )}
                  </div>

                  <div className="staff-table-wrapper">
                    <table className="staff-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Joueur</th>
                          <th>Points</th>
                          <th>Discord ID</th>
                        </tr>
                      </thead>
                      <tbody>{renderLeaderboardRows(users)}</tbody>
                    </table>
                  </div>

                  <div className="staff-form">
                    <label>
                      Joueur existant
                      <select
                        value={form.selectedUserKey}
                        onChange={(event) =>
                          handleSelectUser(type, event.target.value)
                        }
                      >
                        <option value="">-- Nouveau membre --</option>
                        {users.map((user, index) => {
                          const value = user.userId
                            ? `id:${user.userId}`
                            : `idx:${index}`;
                          return (
                            <option key={value} value={value}>
                              {user.name || "Sans nom"} (
                              {formatNumberWithSpaces(user.score || 0)} pts)
                            </option>
                          );
                        })}
                      </select>
                    </label>

                    <label>
                      Nom d'affichage
                      <input
                        type="text"
                        placeholder="Nom du joueur"
                        value={form.username}
                        onChange={(event) =>
                          updateForm(type, {
                            username: event.target.value,
                          })
                        }
                      />
                    </label>

                    <label>
                      Discord ID (optionnel)
                      <input
                        type="text"
                        placeholder="Identifiant numérique"
                        value={form.userId}
                        onChange={(event) =>
                          updateForm(type, {
                            userId: event.target.value.trim(),
                          })
                        }
                      />
                    </label>

                    <label>
                      Points
                      <input
                        type="number"
                        min="1"
                        max="1000000"
                        value={form.points}
                        onChange={(event) =>
                          updateForm(type, {
                            points: event.target.value,
                          })
                        }
                      />
                    </label>

                    <div className="staff-form-actions">
                      <button
                        type="button"
                        className="staff-button staff-button--add"
                        disabled={disabled}
                        onClick={() => submitChange(type, "add")}
                      >
                        Ajouter
                      </button>
                      <button
                        type="button"
                        className="staff-button staff-button--remove"
                        disabled={disabled}
                        onClick={() => submitChange(type, "remove")}
                      >
                        Retirer
                      </button>
                      <button
                        type="button"
                        className="staff-button staff-button--reset"
                        disabled={disabled}
                        onClick={() => resetForm(type)}
                      >
                        Vider
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default StaffDashboard;
