import { useState } from "react";

import { WEEKLY_OPTIONS, ISVALUE_OPTIONS } from "../utils/pointOptions";

import Leaderboard from "../components/Leaderboard/Leaderboard";

const pointOptions = {
  ...WEEKLY_OPTIONS,
  ...ISVALUE_OPTIONS,
};

const Rewards = ({}) => {
  const [tops, setTops] = useState({
    crystaux: {
      users: [500, 300, 200].map((score) => ({
        name: `${score} Tokens`,
        score: "GANG",
      })),
    },
    pvp: {
      users: Array(3).fill({
        name: "En fonction du placement",
        score: "ISLAND",
      }),
    },
    iscoin: {
      users: Array(3).fill({
        name: "En fonction du placement",
        score: "ISLAND",
      }),
    },
    dragonegg: {
      users: Array(3).fill({ name: "Classement permanant", score: "ISLAND" }),
    },
    beacon: {
      users: Array(3).fill({ name: "Classement permanant", score: "ISLAND" }),
    },
    sponge: {
      users: Array(3).fill({ name: "Classement permanant", score: "ISLAND" }),
    },
  });

  const keys = ["crystaux", "pvp", "iscoin", "dragonegg", "beacon", "sponge"];

  return (
    <section className="App">
      <div className="lff-classements-container">
        {/* Classement Crystaux et IsCoin */}
        {keys.map((k) => (
          <Leaderboard
            key={k}
            title={
              <>
                <img
                  className="lff-classements-icon"
                  src={pointOptions[k].icon}
                  alt={pointOptions[k].label}
                />
                {pointOptions[k].label}
              </>
            }
            top={tops[k]?.users}
            requiredAmount={pointOptions[k].requiredAmount}
          />
        ))}
      </div>
    </section>
  );
};

export default Rewards;
