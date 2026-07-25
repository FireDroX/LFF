import "./styles/Commands.css";
import { useEffect, useState } from "react";
import { FaDiscord, FaTerminal } from "react-icons/fa";
import { getCommands } from "../utils/requests";

const TYPE_LABELS = {
  3: "texte",
  4: "nombre",
};

const formatChoices = (option) =>
  option.choices?.map((choice) => choice.name).join(" | ");

const formatOption = (option) => {
  const value = formatChoices(option) || TYPE_LABELS[option.type] || "valeur";
  const content = `${option.name}: ${value}`;
  return option.required ? `<${content}>` : `[${content}]`;
};

const Commands = () => {
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCommands()
      .then((result) => setCommands(result?.commands || []))
      .catch((requestError) => {
        console.error("Commands loading failed:", requestError);
        setError("Impossible de charger les commandes pour le moment.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="App">
      <header className="page-intro commands-intro">
        <span className="page-kicker">Bot Discord</span>
        <h1>Commandes disponibles</h1>
        <p>
          Toutes les commandes utilisables par les membres, directement depuis
          Discord.
        </p>
      </header>

      <div className="commands-content">
        <div className="commands-summary">
          <span className="commands-summary-icon">
            <FaDiscord />
          </span>
          <div>
            <strong>{commands.length || "—"} commandes publiques</strong>
            <span>Tapez / dans Discord pour les retrouver.</span>
          </div>
        </div>

        {loading && (
          <div className="commands-state">
            <div className="spinner" aria-hidden="true" />
            <span>Chargement des commandes…</span>
          </div>
        )}

        {error && <div className="commands-state commands-state--error">{error}</div>}

        {!loading && !error && (
          <div className="commands-grid">
            {commands.map((command, index) => {
              const usage = `/${command.name}${
                command.options?.length
                  ? ` ${command.options.map(formatOption).join(" ")}`
                  : ""
              }`;

              return (
                <article className="command-card" key={command.name}>
                  <div className="command-card-index">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="command-card-heading">
                    <span className="command-card-icon">
                      <FaTerminal />
                    </span>
                    <h2>/{command.name}</h2>
                  </div>

                  <p>{command.description}</p>
                  <code className="command-usage">{usage}</code>

                  {command.options?.length > 0 && (
                    <ul className="command-options">
                      {command.options.map((option) => (
                        <li key={option.name}>
                          <div>
                            <code>{option.name}</code>
                            {option.required && <span>Requis</span>}
                          </div>
                          <p>{option.description}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Commands;
