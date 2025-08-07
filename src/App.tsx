import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/routes";
import "./App.css";
import { useEffect } from "react";
import { useUser } from "./context/usercontext";

function App() {
  const { checkToken } = useUser();

  useEffect(() => {
    checkToken();
  }, []);

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
