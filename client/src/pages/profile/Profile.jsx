import "./Profile.css";
import { useState, useEffect } from "react";

import { MdLeaderboard, MdAdminPanelSettings } from "react-icons/md";
import { GiTwoCoins } from "react-icons/gi";

import { profile } from "../../utils/requests";

const Profile = ({ isLogged, data }) => {
  const [totals, setTotals] = useState({
    crystaux: 0,
    iscoin: 0,
    dragonegg: 0,
    beacon: 0,
    sponge: 0,
  });

  useEffect(() => {
    if (isLogged && data) {
      profile().then((result) => {
        if (result && !result.error) {
          setTotals(result.totals);
        }
      });
    }
  }, [isLogged, data]);

  if (!isLogged) {
    return (
      <section className="App">
        <div className="profile-dashboard profile-dashboard--center">
          <div className="profile-card">
            <h3>Accès refusé</h3>
            <p>Ce tableau de bord est réservé aux membres du site.</p>
          </div>
        </div>
      </section>
    );
  }

  const chartConfig = {
    type: "bar",
    data: {
      labels: ["Crystaux", "IsCoin", "DragonEgg", "Beacon", "Sponge"],
      datasets: [
        {
          label: "Valeur Totale (en $)",
          data: [
            totals.crystaux,
            totals.iscoin,
            totals.dragonegg,
            totals.beacon,
            totals.sponge,
          ],
          backgroundColor: "",
          borderRadius: 5,
        },
      ],
    },
    options: {
      scales: {
        yAxes: [
          {
            id: "Y1",
            position: "right",
          },
        ],
      },
      plugins: {
        tickFormat: "a",
      },
    },
  };

  return (
    <section className="App">
      <div className="profile-dashboard profile-dashboard--center">
        <div className="profile-card">
          <div className="profile-card-header">
            <img
              className="profile-card-pic"
              src={`https://cdn.discordapp.com/avatars/${data?.id}/${data?.avatar}.png`}
              alt={data?.global_name}
            />
            <h3 className="profile-card-name">{data?.global_name}</h3>
          </div>
          <div className="profile-card-footer">
            <div className="profile-card-access">
              <p>Accès :</p>
              <div className="profile-access-badges">
                {data?.flags.includes("crystaux") && (
                  <span className="access-badge gang">
                    <MdLeaderboard />
                    Gang
                  </span>
                )}
                {data?.flags.includes("iscoin") && (
                  <span className="access-badge island">
                    <GiTwoCoins />
                    Island
                  </span>
                )}
                {data?.isAdmin && (
                  <span className="access-badge admin">
                    <MdAdminPanelSettings />
                    Dashboard
                  </span>
                )}
              </div>
            </div>
            <img
              className="profile-chart"
              src={`https://quickchart.io/chart?width=450&height=250&c=${encodeURIComponent(
                JSON.stringify(chartConfig)
              )}`}
              alt="User stats"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
