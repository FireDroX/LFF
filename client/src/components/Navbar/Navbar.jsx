import "./Navbar.css";
import { useEffect, useState } from "react";
import { getPublicConfig } from "../../utils/requests";
import { getCurrentRoute, navigateTo } from "../../utils/navigation";

import { TbLogin2 } from "react-icons/tb";
import { IoIosColorPalette } from "react-icons/io";
import { VscDebugDisconnect } from "react-icons/vsc";
import { CgTrash, CgProfile } from "react-icons/cg";
import { FaHistory, FaTerminal } from "react-icons/fa";
import { MdLeaderboard, MdAdminPanelSettings } from "react-icons/md";
import { SlPresent } from "react-icons/sl";

import RemovePoints from "../RemovePoints/RemovePoints";
import History from "../History/History";

import favicon from "../../assets/favicon.webp";

const Navbar = ({ userData }) => {
  const [theme, setTheme] = useState(
    window.localStorage.getItem("theme") || "Dark",
  );
  const [currentRoute, setCurrentRoute] = useState(getCurrentRoute);

  const [removeModal, setRemoveModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [publicConfig, setPublicConfig] = useState(null);
  const redirectUri =
    import.meta.env.VITE_DISCORD_REDIRECT_URI ||
    (import.meta.env.DEV
      ? window.location.origin
      : publicConfig?.publicUrl || window.location.origin);
  const discordLoginUrl = new URL("https://discord.com/oauth2/authorize");
  discordLoginUrl.search = new URLSearchParams({
    client_id: publicConfig?.discordClientId || "",
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "identify",
  }).toString();

  useEffect(() => {
    getPublicConfig()
      .then(setPublicConfig)
      .catch((error) => console.error("Public config loading failed:", error));
  }, []);

  useEffect(() => {
    const handleNavigation = () => setCurrentRoute(getCurrentRoute());
    window.addEventListener("popstate", handleNavigation);
    return () => window.removeEventListener("popstate", handleNavigation);
  }, []);

  const handleDisconnect = () => {
    window.localStorage.clear();
    window.location.href = "/leaderboards";
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
            <span>Gang LFF</span>
          </div>
          <div className="navbar-user-dropdown">
            <ul className="navbar-menu">
              {[
                // --- PROFIL ---
                userData && {
                  label: "Profile",
                  icon: <CgProfile />,
                  route: "profile",
                  action: () => navigateTo("profile"),
                },

                // --- CLASSEMENTS ---
                {
                  label: "Leaderboards",
                  icon: <MdLeaderboard />,
                  route: "leaderboards",
                  action: () => navigateTo("leaderboards"),
                },

                // -- REWARDS ---
                {
                  label: "Rewards",
                  icon: <SlPresent />,
                  route: "rewards",
                  action: () => navigateTo("rewards"),
                },

                // --- COMMANDES ---
                {
                  label: "Commandes",
                  icon: <FaTerminal />,
                  route: "commands",
                  action: () => navigateTo("commands"),
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
                  route: "dashboard",
                  action: () => navigateTo("dashboard"),
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
                .map(({ label, icon, route, action, color }, i) => (
                  <li
                    key={i}
                    className={`dropdown-item ${
                      route === currentRoute ? "nav-active" : ""
                    }`}
                    onClick={action}
                    title={label}
                    aria-label={label}
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
            <div className="lff-navbar-connected">
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
              href={publicConfig ? discordLoginUrl.toString() : undefined}
            >
              <TbLogin2 />
              <span>Discord Login</span>
            </a>
          )}
        </div>
      </div>
      {removeModal && (
        <RemovePoints closeModal={() => setRemoveModal(false)} />
      )}
      {historyModal && <History closeModal={() => setHistoryModal(false)} />}
    </>
  );
};

export default Navbar;
