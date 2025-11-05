import "./App.css";
import { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import getToken from "./utils/getToken";
import getMe from "./utils/getMe";

import Navbar from "./components/Navbar/Navbar";

const Weekly = lazy(() => import("./pages/weekly/Weekly"));
const IsValue = lazy(() => import("./pages/isvalue/IsValue"));

const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));

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
    case "dashboard":
      return <Dashboard islogged={isLogged} isAdmin={data?.isAdmin} />;
    case "isvalue":
      return <IsValue isLogged={isLogged} flags={flags} />;
    default:
      return <Weekly isLogged={isLogged} flags={data?.flags} />;
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
