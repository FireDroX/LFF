import "./App.css";
import { useState, useEffect } from "react";

import { FaTrophy } from "react-icons/fa";

import getToken from "./utils/getToken";
import getMe from "./utils/getMe";
import currentTop from "./utils/currentTop";
import formatNumberWithSpaces from "./utils/formatNumberWithSpaces";
import addPoints from "./utils/addPoints";

import Navbar from "./components/Navbar/Navbar";

function App() {
  const access_token = window.localStorage.getItem("access_token");
  const token_type = window.localStorage.getItem("token_type");

  const [isLogged, setIsLogged] = useState(null);
  const [top, setTop] = useState([]);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    if (access_token && token_type) {
      getMe(token_type, access_token).then((data) => {
        if (data && !data.error) setIsLogged(true);
        else setIsLogged(false);
      });
    } else setIsLogged(false);
  }, [access_token, token_type]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      getToken(code).then(() => {
        window.location.href = "/";
      });
    }
    currentTop().then((data) => {
      if (Array.isArray(data)) {
        // 1️⃣ Trier du plus grand au plus petit
        const sorted = data.sort((a, b) => b.score - a.score);

        // 2️⃣ Garder les 5 premiers
        const top5 = sorted.slice(0, 5);

        // 3️⃣ Compléter avec des "Nobody" si nécessaire
        const filled = [
          ...top5,
          ...Array(5 - top5.length)
            .fill()
            .map(() => ({ score: 0, name: "Nobody" })),
        ];

        // 4️⃣ Mettre à jour le state
        setTop(filled);
      }
    });
  }, []);

  if (isLogged === null)
    return (
      <section className="App">
        <div>
          <div className="spinner" aria-hidden="true"></div>
        </div>
      </section>
    );

  return (
    <>
      <Navbar />
      <section className="App">
        <div>
          <h1 style={{ color: "var(--text85)" }}>Crystaux LFF</h1>
          <ul className="lff-classement">
            {top
              .sort((a, b) => b.score - a.score)
              .map(({ score, name }, index) => (
                <li key={index}>
                  <span className="lff-classement-top">
                    {index === 0 ? (
                      <FaTrophy color="#FFD700" />
                    ) : index === 1 ? (
                      <FaTrophy color="#C0C0C0" />
                    ) : index === 2 ? (
                      <FaTrophy color="#CD7F32" />
                    ) : (
                      index
                    )}
                  </span>
                  <span className="lff-classement-score">
                    {formatNumberWithSpaces(score)}
                  </span>
                  <span className="lff-classement-name">{name}</span>
                </li>
              ))}
          </ul>
          {isLogged && (
            <div className="add-points">
              <input
                type="number"
                name="Points"
                value={points}
                onChange={(e) => {
                  if (e.target.value === "") setPoints(0);
                  else if (e.target.value > 999) setPoints(999);
                  else setPoints(parseInt(e.target.value));
                }}
              />
              <button
                onClick={() => {
                  if (points !== 0) {
                    addPoints(points).then((newTop) => setTop(newTop));
                    setPoints(0);
                  }
                }}
              >
                Ajouter
              </button>
              <p>
                {formatNumberWithSpaces(points)} ={" "}
                {formatNumberWithSpaces(points * 100)} Crystaux
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default App;
