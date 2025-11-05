import "./App.css";
import { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import getToken from "./utils/getToken";
import getMe from "./utils/getMe";

import Navbar from "./components/Navbar/Navbar";

const Weekly = lazy(() => import("./pages/weekly/Weekly"));
const IsValue = lazy(() => import("./pages/isvalue/IsValue"));

const DynamicPage = ({ isLogged, flags }) => {
  const [page, setPage] = useState(null);
  const location = useLocation();

  // Get the text after the last 'p?' in the URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const p = queryParams.get("p") ?? "weekly";
    setPage(p.toLowerCase());
  }, [location]);

  switch (page) {
    case "isvalue":
      return <IsValue isLogged={isLogged} flags={flags} />;
    default:
      return <Weekly isLogged={isLogged} flags={flags} />;
  }
};

function App() {
  const access_token = window.localStorage.getItem("access_token");
  const token_type = window.localStorage.getItem("token_type");

  const [userInfos, setUserInfos] = useState({ isLogged: false, flags: [] });

  // Vérifier connexion
  useEffect(() => {
    if (access_token && token_type) {
      getMe(token_type, access_token).then((data) => {
        if (data && !data.error)
          setUserInfos({ isLogged: true, flags: data.flags });
        else setUserInfos({ isLogged: false, flags: [] });
      });
    } else setUserInfos({ isLogged: false, flags: [] });
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
      <Navbar />
      <Routes>
        <Route
          path="/*"
          element={
            <Suspense fallback={<Loader />}>
              <DynamicPage
                isLogged={userInfos.isLogged}
                flags={userInfos.flags}
              />
            </Suspense>
          }
        />
      </Routes>
    </>
  );
}

export default App;
