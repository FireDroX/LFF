import "./App.css";
import { useState, useEffect } from "react";

import getToken from "./utils/getToken";
import getMe from "./utils/getMe";
import currentTop from "./utils/currentTop";

import Navbar from "./components/Navbar/Navbar";
import AddPoints from "./components/AddPoints/AddPoints";
import Leaderboard from "./components/Leaderboard/Leaderboard";

function App() {
  const access_token = window.localStorage.getItem("access_token");
  const token_type = window.localStorage.getItem("token_type");

  const [isLogged, setIsLogged] = useState(null);
  const [tops, setTops] = useState({
    crystaux: { users: [] },
    iscoin: { users: [] },
  });

  // Vérifier connexion
  useEffect(() => {
    if (access_token && token_type) {
      getMe(token_type, access_token).then((data) => {
        if (data && !data.error) setIsLogged(true);
        else setIsLogged(false);
      });
    } else setIsLogged(false);
  }, [access_token, token_type]);

  // Fonction utilitaire pour formatter les tops
  const formatTop = (users, start, end, type) => {
    if (!Array.isArray(users)) return { users: [], start, end, type };

    const sorted = users.sort((a, b) => b.score - a.score);
    const top5 = sorted.slice(0, 5);

    const filled = [
      ...(top5 || []),
      ...Array(5 - (top5?.length || 0))
        .fill()
        .map(() => ({ score: 0, name: "Nobody" })),
    ];

    return { users: filled, start, end, type };
  };

  // Charger les deux classements
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      getToken(code).then(() => (window.location.href = "/"));
      return;
    }

    // Charger crystaux
    // Charger iscoin
    Promise.all([currentTop("crystaux"), currentTop("iscoin")]).then(
      ([crystauxData, iscoinData]) => {
        setTops({
          crystaux: formatTop(
            crystauxData.users,
            crystauxData.start,
            crystauxData.end
          ),
          iscoin: formatTop(iscoinData.users, iscoinData.start, iscoinData.end),
        });
      }
    );
  }, []);

  if (isLogged === null) {
    return (
      <section className="App">
        <div className="spinner-container">
          <div className="spinner" aria-hidden="true"></div>
        </div>
      </section>
    );
  }

  return (
    <>
      <Navbar />
      <section className="App">
        <div className="lff-classements-container">
          {/* Classement Crystaux */}
          <Leaderboard
            title="Classement Crystaux 💎"
            top={tops.crystaux?.users}
            start={tops.crystaux?.start}
            end={tops.crystaux?.end}
            requiredAmount={50}
          />

          {/* Classement Iscoin */}
          <Leaderboard
            title="Classement IsCoin 🪙"
            top={tops.iscoin?.users}
            start={tops.iscoin?.start}
            end={tops.iscoin?.end}
            requiredAmount={1000}
          />
        </div>

        {isLogged && <AddPoints setTops={setTops} />}
      </section>
    </>
  );
}

export default App;
