import "./Navbar.css";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { TbLogin2 } from "react-icons/tb";
import { IoIosArrowDown, IoIosColorPalette } from "react-icons/io";
import { VscDebugDisconnect } from "react-icons/vsc";
import { CgTrash, CgProfile } from "react-icons/cg";
import { FaHistory } from "react-icons/fa";
import { MdLeaderboard, MdAdminPanelSettings } from "react-icons/md";
import { GiTwoCoins } from "react-icons/gi";

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
    window.localStorage.getItem("theme") || "Dark"
  );

  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <>
      <div className="navbar">
        <div className="navbar-connection">
          <div
            className="navbar-user-dropdown"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <div className="LFF-img">
              <img src={favicon} alt="LFF" />
            </div>
            Gang LFF
            <IoIosArrowDown />
            {isOpen && (
              <ul className="dropdown-menu-navbar">
                {[
                  // --- PROFIL ---
                  userData && {
                    label: "Profile",
                    icon: <CgProfile />,
                    action: () => navigate("?p=Profile"),
                    borderBottom: true,
                  },

                  // --- CLASSEMENTS ---
                  ...[
                    { path: "Weekly", icon: <MdLeaderboard /> },
                    { path: "IsValue", icon: <GiTwoCoins /> },
                  ]
                    .filter(({ path }) => path.toLowerCase() !== server)
                    .map(({ path, icon }) => ({
                      label: path,
                      icon,
                      action: () => navigate(`?p=${path}`),
                    })),

                  // --- HISTORY ---
                  {
                    label: "History",
                    icon: <FaHistory />,
                    action: () => setHistoryModal((prev) => !prev),
                    borderTop: true,
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
                    borderTop: true,
                  },

                  // --- DELETE POINTS ---
                  userData && {
                    label: "Delete Points",
                    icon: <CgTrash />,
                    action: () => setRemoveModal((prev) => !prev),
                    color: "#ff5252",
                    borderTop: true,
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
                  .map(
                    (
                      { label, icon, action, borderTop, borderBottom, color },
                      i
                    ) => (
                      <li
                        key={i}
                        className="dropdown-item"
                        onClick={action}
                        style={{
                          ...(borderTop && {
                            borderTop: "1px solid var(--accent35)",
                          }),
                          ...(borderBottom && {
                            borderBottom: "1px solid var(--accent35)",
                          }),
                          ...(color && { color }),
                        }}
                      >
                        {icon}
                        <span>{label}</span>
                      </li>
                    )
                  )}
              </ul>
            )}
          </div>
          {userData ? (
            <div>
              <img
                className="navbar-pic"
                src={`https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`}
                alt={userData.global_name}
              />
            </div>
          ) : (
            <a
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
