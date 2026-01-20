import "./Navbar.css";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { TbLogin2 } from "react-icons/tb";
import { IoIosColorPalette } from "react-icons/io";
import { VscDebugDisconnect } from "react-icons/vsc";
import { CgTrash, CgProfile } from "react-icons/cg";
import { FaHistory } from "react-icons/fa";
import { MdLeaderboard, MdAdminPanelSettings } from "react-icons/md";

import RemovePoints from "../RemovePoints/RemovePoints";
import History from "../History/History";

import favicon from "../../assets/favicon.webp";

const Navbar = ({ userData }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const p = queryParams.get("p") ?? "weekly";
  const server = p.toLowerCase();

  const [theme, setTheme] = useState(
    window.localStorage.getItem("theme") || "Dark",
  );

  const [removeModal, setRemoveModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);

  const handleDisconnect = () => {
    window.localStorage.clear();
    window.location.href = "/";
  };

  const handleThemeChange = () => {
    if (theme === "Dark") {
      document.body.classList.remove("dark-theme");
      document.body.classList.add("light-theme");
      localStorage.setItem("theme", "Light");
      setTheme("Light");
    } else {
      document.body.classList.remove("light-theme");
      document.body.classList.add("dark-theme");
      localStorage.setItem("theme", "Dark");
      setTheme("Dark");
    }
  };

  const gangFlags = ["crystaux", "pvp"];
  const islandFlags = ["iscoin", "dragonegg", "beacon", "sponge"];

  const hasGangFlags = gangFlags.every((flag) =>
    userData?.flags.includes(flag),
  );
  const hasIslandFlags = islandFlags.every((flag) =>
    userData?.flags.includes(flag),
  );

  let userLabel = "Visitor";

  if (userData?.isAdmin) {
    userLabel = "Admin";
  } else if (hasGangFlags && hasIslandFlags) {
    userLabel = "LFF Player";
  } else if (hasGangFlags) {
    userLabel = "Gang Player";
  } else if (hasIslandFlags) {
    userLabel = "Island Player";
  }

  return (
    <>
      <div className="navbar">
        <div className="navbar-connection">
          <div className="LFF-img">
            <img src={favicon} alt="LFF" />
            Gang LFF
          </div>
          <div className="navbar-user-dropdown">
            <ul className="navbar-menu">
              {[
                // --- PROFIL ---
                userData && {
                  label: "Profile",
                  icon: <CgProfile />,
                  action: () => navigate("?p=Profile"),
                },

                // --- CLASSEMENTS ---
                {
                  label: "Leaderboards",
                  icon: <MdLeaderboard />,
                  action: () => navigate("?p=Leaderboards"),
                },

                // --- HISTORY ---
                {
                  label: "History",
                  icon: <FaHistory />,
                  action: () => setHistoryModal((prev) => !prev),
                },

                // --- THEME ---
                {
                  label: `${theme === "Dark" ? "Light" : "Dark"} Theme`,
                  icon: <IoIosColorPalette />,
                  action: handleThemeChange,
                },

                // --- ADMIN DASHBOARD ---
                userData?.isAdmin && {
                  label: "Dashboard",
                  icon: <MdAdminPanelSettings />,
                  action: () => navigate("?p=Dashboard"),
                },

                // --- DELETE POINTS ---
                userData && {
                  label: "Delete Points",
                  icon: <CgTrash />,
                  action: () => setRemoveModal((prev) => !prev),
                  color: "#ff5252",
                },

                // --- DISCONNECT ---
                userData && {
                  label: "Disconnect",
                  icon: <VscDebugDisconnect />,
                  action: handleDisconnect,
                  color: "#a70000",
                },
              ]
                .filter(Boolean) // enlève les 'false' ou undefined
                .map(({ label, icon, action, color }, i) => (
                  <li
                    key={i}
                    className="dropdown-item"
                    onClick={action}
                    style={{
                      ...(color && { color }),
                    }}
                  >
                    {icon}
                    <span>{label}</span>
                  </li>
                ))}
            </ul>
          </div>
          {userData ? (
            <div className="lff-navbar-footer">
              <img
                className="navbar-pic"
                src={`https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`}
                alt={userData.global_name}
              />
              <div className="lff-navbar-user">
                <h5>{userData.global_name}</h5>
                <small style={{ fontSize: "0.8rem" }}>{userLabel}</small>
              </div>
            </div>
          ) : (
            <a
              className="lff-navbar-footer"
              id="login"
              href={
                process.env.NODE_ENV === "production"
                  ? "https://discord.com/oauth2/authorize?client_id=1431388474954748065&response_type=code&redirect_uri=https%3A%2F%2Flff.onrender.com&scope=identify"
                  : "https://discord.com/oauth2/authorize?client_id=1431388474954748065&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000&scope=identify"
              }
            >
              <TbLogin2 />
              Discord Login
            </a>
          )}
        </div>
      </div>
      {removeModal && (
        <RemovePoints closeModal={() => setRemoveModal(false)} path={server} />
      )}
      {historyModal && <History closeModal={() => setHistoryModal(false)} />}
    </>
  );
};

export default Navbar;
