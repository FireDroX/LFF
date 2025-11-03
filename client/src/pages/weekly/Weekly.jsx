import { useEffect, useState } from "react";

import currentTop from "../../utils/currentTop";
import {
  formatTop,
  formatNumberWithSpaces,
  compactNumber,
} from "../../utils/functions";

import AddPoints from "../../components/AddPoints/AddPoints";
import Leaderboard from "../../components/Leaderboard/Leaderboard";

const Weekly = ({ isLogged }) => {
  const [tops, setTops] = useState({
    crystaux: { users: [] },
    iscoin: { users: [] },
  });

  const pointOptions = {
    Crystaux: {
      emoji: "💎",
      multiplier: 100,
      label: "Crystaux",
      format: (points) =>
        `${formatNumberWithSpaces(points)} = ${compactNumber(
          points * 100
        )} Crystaux`,
    },
    IsCoin: {
      emoji: "🪙",
      multiplier: 2000000,
      label: "IsCoin",
      format: (points) =>
        `${formatNumberWithSpaces(points)} = ${compactNumber(
          points * 2000000
        )} $`,
    },
  };

  useEffect(() => {
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

  return (
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

      {isLogged && (
        <AddPoints
          setTops={setTops}
          selectDefault="Crystaux"
          options={pointOptions}
        />
      )}
    </section>
  );
};

export default Weekly;
