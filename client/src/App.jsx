import "./App.css";
import { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import getToken from "./utils/getToken";
import getMe from "./utils/getMe";

import Navbar from "./components/Navbar/Navbar";

const Weekly = lazy(() => import("./pages/weekly/Weekly"));
const IsValue = lazy(() => import("./pages/isvalue/IsValue"));

const DynamicPage = ({ isLogged }) => {
  const [page, setPage] = useState(null);
  const location = useLocation();

  // Get the text after the last '/' in the URL
  useEffect(() => {
    const path = location.pathname.toLowerCase().split("/").pop();
    setPage(path);
  }, [location]);

  switch (page) {
    case "isvalue":
      return <IsValue isLogged={isLogged} />;
    default:
      return <Weekly isLogged={isLogged} />;
  }
};

function App() {
  const access_token = window.localStorage.getItem("access_token");
  const token_type = window.localStorage.getItem("token_type");

  const [isLogged, setIsLogged] = useState(null);

  // Vérifier connexion
  useEffect(() => {
    if (access_token && token_type) {
      getMe(token_type, access_token).then((data) => {
        if (data && !data.error) setIsLogged(true);
        else setIsLogged(false);
      });
    } else setIsLogged(false);
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
              <DynamicPage isLogged={isLogged} />
            </Suspense>
          }
        />
      </Routes>
    </>
  );
}

export default App;
