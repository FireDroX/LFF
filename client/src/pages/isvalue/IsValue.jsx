import { useEffect, useState } from "react";

import currentTop from "../../utils/currentTop";
import {
  formatTop,
  formatNumberWithSpaces,
  compactNumber,
} from "../../utils/functions";

import AddPoints from "../../components/AddPoints/AddPoints";
import Leaderboard from "../../components/Leaderboard/Leaderboard";

import dragon_egg from "../../assets/dragon_egg.webp";
import beacon from "../../assets/beacon.webp";
import sponge from "../../assets/sponge.webp";

const IsValue = ({ isLogged }) => {
  const [tops, setTops] = useState({
    dragonEgg: { users: [] },
    beacon: { users: [] },
    sponge: { users: [] },
  });

  const pointOptions = {
    DragonEgg: {
      multiplier: 1500000000,
      label: "DragonEgg",
      format: (points) =>
        `${formatNumberWithSpaces(points)} = ${compactNumber(
          points * 1500000000
        )} $`,
    },
    Beacon: {
      multiplier: 150000000,
      label: "Beacon",
      format: (points) =>
        `${formatNumberWithSpaces(points)} = ${compactNumber(
          points * 150000000
        )} $`,
    },
    Sponge: {
      multiplier: 15000000,
      label: "Sponge",
      format: (points) =>
        `${formatNumberWithSpaces(points)} = ${compactNumber(
          points * 15000000
        )} $`,
    },
  };

  useEffect(() => {
    // Charger dragon_egg tops
    Promise.all([
      currentTop("dragonegg"),
      currentTop("beacon"),
      currentTop("sponge"),
    ]).then(([dragonEggData, beaconData, spongeData]) => {
      setTops({
        dragonEgg: formatTop(dragonEggData.users),
        beacon: formatTop(beaconData.users),
        sponge: formatTop(spongeData.users),
      });
    });
  }, []);

  return (
    <section className="App">
      <div className="lff-classements-container">
        {/* Classement Dragon Egg */}
        <Leaderboard
          title={
            <>
              Classement Egg{" "}
              <img
                className="lff-classements-icon"
                src={dragon_egg}
                alt="Dragon Egg"
              />
            </>
          }
          top={tops.dragonEgg?.users}
        />

        {/* Classement Beacon */}
        <Leaderboard
          title={
            <>
              Classement Beacon{" "}
              <img className="lff-classements-icon" src={beacon} alt="Beacon" />
            </>
          }
          top={tops.beacon?.users}
        />

        {/* Classement Sponge */}
        <Leaderboard
          title={
            <>
              Classement Sponge{" "}
              <img className="lff-classements-icon" src={sponge} alt="Sponge" />
            </>
          }
          top={tops.sponge?.users}
        />
      </div>

      {isLogged && (
        <AddPoints
          setTops={setTops}
          selectDefault="DragonEgg"
          options={pointOptions}
        />
      )}
    </section>
  );
};

export default IsValue;
