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
  const [topCrystaux, setTopCrystaux] = useState();

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
    currentTop().then(({ users, start, end }) => {
      if (Array.isArray(users)) {
        // 1️⃣ Trier du plus grand au plus petit
        const sorted = users.sort((a, b) => b.score - a.score);

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
        setTopCrystaux({ users: filled, start, end });
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
          <Leaderboard
            top={topCrystaux.users}
            start={topCrystaux.start}
            end={topCrystaux.end}
          />
          {isLogged && <AddPoints setTop={setTopCrystaux} />}
        </div>
      </section>
    </>
  );
}

export default App;
