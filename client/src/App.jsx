import "./App.css";
import { useState, useEffect, Suspense, lazy } from "react";

import { getMe, getToken } from "./utils/requests";
import { getCurrentRoute } from "./utils/navigation";

import Navbar from "./components/Navbar/Navbar";

const MainTops = lazy(() => import("./pages/MainTops"));
const Rewards = lazy(() => import("./pages/Rewards"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Commands = lazy(() => import("./pages/Commands"));

const DynamicPage = ({ isLogged, data }) => {
  const [page, setPage] = useState(getCurrentRoute);

  useEffect(() => {
    const handleNavigation = () => setPage(getCurrentRoute());
    window.addEventListener("popstate", handleNavigation);
    return () => window.removeEventListener("popstate", handleNavigation);
  }, []);

  switch (page) {
    case "profile":
      return <Profile isLogged={isLogged} data={data} />;
    case "dashboard":
      return <Dashboard isLogged={isLogged} isAdmin={data?.isAdmin} />;
    case "rewards":
      return <Rewards />;
    case "commands":
      return <Commands />;
    default:
      return (
        <MainTops
          isLogged={isLogged}
          flags={data?.flags}
          currentUser={data?.id}
        />
      );
  }
};

function App() {
  const access_token = window.localStorage.getItem("access_token");
  const token_type = window.localStorage.getItem("token_type");

  const [userInfos, setUserInfos] = useState({
    data: null,
    isLogged: false,
  });

  // Vérifier connexion
  useEffect(() => {
    if (access_token && token_type) {
      getMe(token_type, access_token).then((data) => {
        if (data && !data.error)
          setUserInfos({
            data,
            isLogged: true,
          });
      });
    }
  }, [access_token, token_type]);

  // Charger le token de connexion OAuth2 s'il y a un code dans l'URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      window.history.replaceState({}, document.title, "/leaderboards");

      getToken(code).then(() => (window.location.href = "/leaderboards"));
    }
  }, []);

  const Loader = () => (
    <section className="App">
      <div className="spinner-container">
        <div className="spinner" aria-hidden="true"></div>
      </div>
    </section>
  );

  return (
    <>
      <Navbar userData={userInfos.data} />
      <Suspense fallback={<Loader />}>
        <DynamicPage
          isLogged={userInfos.isLogged}
          data={userInfos.data}
        />
      </Suspense>
    </>
  );
}

export default App;
