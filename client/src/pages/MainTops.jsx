import { useEffect, useState } from "react";

import { currentTop } from "../utils/requests";
import { formatTop, filterPointOptions } from "../utils/functions";
import { WEEKLY_OPTIONS, ISVALUE_OPTIONS } from "../utils/pointOptions";

import AddPoints from "../components/AddPoints/AddPoints";
import Leaderboard from "../components/Leaderboard/Leaderboard";

const pointOptions = {
  ...WEEKLY_OPTIONS,
  ...ISVALUE_OPTIONS,
};

const MainTops = ({ isLogged, flags, currentUser }) => {
  const [tops, setTops] = useState({
    crystaux: { users: [] },
    pvp: { users: [] },
    iscoin: { users: [] },
    dragonEgg: { users: [] },
    beacon: { users: [] },
    sponge: { users: [] },
  });

  // ✅ Filtre pointOptions selon flags
  const filteredPointOptions = filterPointOptions(pointOptions, flags);

  useEffect(() => {
    // Charger crystaux, pvp et iscoin
    Promise.all([
      currentTop("crystaux"),
      currentTop("pvp"),
      currentTop("iscoin"),
      currentTop("dragonegg"),
      currentTop("beacon"),
      currentTop("sponge"),
    ]).then(
      ([
        crystauxData,
        pvpData,
        iscoinData,
        dragonEggData,
        beaconData,
        spongeData,
      ]) => {
        setTops({
          crystaux: formatTop(crystauxData.users),
          pvp: formatTop(pvpData.users),
          iscoin: formatTop(iscoinData.users),
          dragonegg: formatTop(dragonEggData.users),
          beacon: formatTop(beaconData.users),
          sponge: formatTop(spongeData.users),
        });
      },
    );
  }, []);

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

export default MainTops;
