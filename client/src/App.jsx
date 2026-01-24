import "./App.css";
import { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import { getMe, getToken } from "./utils/requests";

import Navbar from "./components/Navbar/Navbar";

const MainTops = lazy(() => import("./pages/MainTops"));
const Rewards = lazy(() => import("./pages/Rewards"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));

const DynamicPage = ({ isLogged, data }) => {
  const [page, setPage] = useState(null);
  const location = useLocation();

  // Get the text after the last 'p?' in the URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const p = queryParams.get("p") ?? "weekly";
    setPage(p.toLowerCase());
  }, [location]);

  switch (page) {
    case "profile":
      return <Profile isLogged={isLogged} data={data} />;
    case "dashboard":
      return <Dashboard isLogged={isLogged} isAdmin={data?.isAdmin} />;
    case "rewards":
      return <Rewards />;
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
      getToken(code).then(() => (window.location.href = "/"));
      return;
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
      <Routes>
        <Route
          path="/*"
          element={
            <Suspense fallback={<Loader />}>
              <DynamicPage
                isLogged={userInfos.isLogged}
                data={userInfos.data}
              />
            </Suspense>
          }
        />
      </Routes>
    </>
  );
}

export default App;
