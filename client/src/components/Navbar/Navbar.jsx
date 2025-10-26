import "./Navbar.css";
import { useEffect, useState } from "react";

import getMe from "../../utils/getMe";

import { TbLogin2 } from "react-icons/tb";
import { IoIosArrowDown, IoIosColorPalette } from "react-icons/io";
import { VscDebugDisconnect } from "react-icons/vsc";

const Navbar = () => {
  const access_token = window.localStorage.getItem("access_token");
  const token_type = window.localStorage.getItem("token_type");

  const [theme, setTheme] = useState(
    window.localStorage.getItem("theme") || "Dark"
  );

  const [userData, setUserData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <>
      <div className="navbar">
        {userData ? (
          <div className="navbar-connection">
            <div>
              <img
                className="navbar-pic"
                src={`https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`}
                alt={userData.global_name}
              />
            </div>
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
              Crystaux LFF
              <IoIosArrowDown />
              {isOpen && (
                <ul className="dropdown-menu-navbar">
                  <li
                    className="dropdown-item"
                    onClick={handleThemeChange}
                    style={{ borderBottom: "1px solid var(--accent35)" }}
                  >
                    <IoIosColorPalette />
                    <span>{theme === "Dark" ? "Light" : "Dark"} Theme</span>
                  </li>
                  <li
                    className="dropdown-item"
                    style={{ color: "#ff5252" }}
                    onClick={handleDisconnect}
                  >
                    <VscDebugDisconnect />
                    <span>Disconnect</span>
                  </li>
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div className="navbar-connection">
            <a
              id="login"
              href="https://discord.com/oauth2/authorize?client_id=1431388474954748065&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000&scope=identify"
            >
              <TbLogin2 />
              Discord Login
            </a>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;
