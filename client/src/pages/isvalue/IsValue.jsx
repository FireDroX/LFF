import { useEffect, useState } from "react";

import { currentTop } from "../../utils/requests";
import { formatTop, filterPointOptions } from "../../utils/functions";
import { ISVALUE_OPTIONS as pointOptions } from "../../utils/pointOptions";

import AddPoints from "../../components/AddPoints/AddPoints";
import Leaderboard from "../../components/Leaderboard/Leaderboard";

const IsValue = ({ isLogged, flags, currentUser }) => {
  const [tops, setTops] = useState({
    dragonEgg: { users: [] },
    beacon: { users: [] },
    sponge: { users: [] },
  });

  // ✅ Filtre pointOptions selon flags
  const filteredPointOptions = filterPointOptions(pointOptions, flags);

  useEffect(() => {
    // Charger dragon_egg, beacon et sponge tops
    Promise.all([
      currentTop("dragonegg"),
      currentTop("beacon"),
      currentTop("sponge"),
    ]).then(([dragonEggData, beaconData, spongeData]) => {
      setTops({
        dragonegg: formatTop(dragonEggData.users),
        beacon: formatTop(beaconData.users),
        sponge: formatTop(spongeData.users),
      });
    });
  }, []);

  const keys = ["dragonegg", "beacon", "sponge"];

  return (
    <section className="App">
      <div className="lff-classements-container">
        {/* Classement Dragon Egg, Beacon et Sponge */}
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
            currentUser={currentUser}
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

export default IsValue;
