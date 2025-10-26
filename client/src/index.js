import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Router>
    <App />
  </Router>
);

// Set Theme Color
const theme = window.localStorage.getItem("theme") || "Dark";
if (theme === "Dark") {
  document.body.classList.remove("light-theme");
  document.body.classList.add("dark-theme");
} else {
  document.body.classList.remove("dark-theme");
  document.body.classList.add("light-theme");
}

localStorage.setItem("theme", theme);
