import { useEffect, useState } from "react";

import { currentTop } from "../../utils/requests";
import { formatTop, filterPointOptions } from "../../utils/functions";
import { WEEKLY_OPTIONS as pointOptions } from "../../utils/pointOptions";

import AddPoints from "../../components/AddPoints/AddPoints";
import Leaderboard from "../../components/Leaderboard/Leaderboard";

const Weekly = ({ isLogged, flags }) => {
  const [tops, setTops] = useState({
    crystaux: { users: [] },
    iscoin: { users: [] },
  });

  // ✅ Filtre pointOptions selon flags
  const filteredPointOptions = filterPointOptions(pointOptions, flags);

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

  const keys = ["crystaux", "iscoin"];

  return (
    <section className="App">
      <div className="lff-classements-container">
        {/* Classement Crystaux et IsCoin */}
        {keys.map((k) => (
          <Leaderboard
            key={k}
            title={
              <>
                {pointOptions[k].label}{" "}
                <img
                  className="lff-classements-icon"
                  src={pointOptions[k].icon}
                  alt={pointOptions[k].label}
                />
              </>
            }
            top={tops[k]?.users}
            start={tops[k]?.start}
            end={tops[k]?.end}
            requiredAmount={pointOptions[k].requiredAmount}
          />
        ))}
      </div>

      {/* ✅ Affiche AddPoints seulement si connecté + flags > 0 */}
      {isLogged && Object.keys(filteredPointOptions).length > 0 && (
        <AddPoints
          setTops={setTops}
          selectDefault={Object.keys(filteredPointOptions)[0]}
          options={filteredPointOptions}
        />
      )}
    </section>
  );
};

export default Weekly;
