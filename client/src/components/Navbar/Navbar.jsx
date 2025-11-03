import "./Navbar.css";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import getMe from "../../utils/getMe";

import { TbLogin2 } from "react-icons/tb";
import { IoIosArrowDown, IoIosColorPalette } from "react-icons/io";
import { VscDebugDisconnect } from "react-icons/vsc";
import { CgTrash } from "react-icons/cg";
import { FaHistory } from "react-icons/fa";
import { MdLeaderboard } from "react-icons/md";
import { GiTwoCoins } from "react-icons/gi";

import RemovePoints from "../RemovePoints/RemovePoints";
import History from "../History/History";

const Navbar = () => {
  const access_token = window.localStorage.getItem("access_token");
  const token_type = window.localStorage.getItem("token_type");

  const [theme, setTheme] = useState(
    window.localStorage.getItem("theme") || "Dark"
  );

  const [userData, setUserData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [removeModal, setRemoveModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);

  useEffect(() => {
    if (access_token && token_type) {
      getMe(token_type, access_token).then((data) => {
        if (data && !data.error) setUserData(data);
      });
    }
  }, [access_token, token_type]);

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

  const Leaderboards = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const pathName = location.pathname.toLowerCase().substring(1);
    const server = pathName || "weekly"; // fallback si vide

    const paths = [
      { path: "Weekly", icon: <MdLeaderboard /> },
      { path: "IsValue", icon: <GiTwoCoins /> },
    ];

    return (
      <>
        {paths
          .filter(({ path }) => path.toLowerCase() !== server) // on retire le serveur actif
          .map(({ path, icon }) => (
            <li
              key={path}
              className="dropdown-item"
              onClick={() => navigate(`/${path}`)}
            >
              {icon}
              <span>{path}</span>
            </li>
          ))}
      </>
    );
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
              <img
                src="https://images.minecraft-heads.com/render3d/head/1d/1d129c9c653db28c75d7dc3cc472eb10.webp"
                alt="LFF"
              />
            </div>
            Gang LFF
            <IoIosArrowDown />
            {isOpen && (
              <ul className="dropdown-menu-navbar">
                <Leaderboards />
                <li
                  className="dropdown-item"
                  onClick={() => setHistoryModal((prev) => !prev)}
                  style={{
                    borderTop: "1px solid var(--accent35)",
                  }}
                >
                  <FaHistory />
                  <span>History</span>
                </li>
                <li className="dropdown-item" onClick={handleThemeChange}>
                  <IoIosColorPalette />
                  <span>{theme === "Dark" ? "Light" : "Dark"} Theme</span>
                </li>
                {userData && (
                  <>
                    <li
                      className="dropdown-item"
                      style={{
                        color: "#ff5252",
                        borderTop: "1px solid var(--accent35)",
                      }}
                      onClick={() => setRemoveModal((prev) => !prev)}
                    >
                      <CgTrash />
                      <span>Delete Points</span>
                    </li>
                    <li
                      className="dropdown-item"
                      style={{ color: "#a70000" }}
                      onClick={handleDisconnect}
                    >
                      <VscDebugDisconnect />
                      <span>Disconnect</span>
                    </li>
                  </>
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
        <RemovePoints
          closeModal={() => setRemoveModal(false)}
          path={window.location.pathname.toLowerCase().substring(1) || "weekly"}
        />
      )}
      {historyModal && <History closeModal={() => setHistoryModal(false)} />}
    </>
  );
};

export default Navbar;
