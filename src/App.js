import logo from "./logo.svg";
import "./App.css";
import Dashboard from "./components/dashboard/Dashboard";
import AdministratorDashboard from "./components/Admin/AdminstratorDashboard";
import { useState } from "react";

function App() {
  const [currentView, setCurrentView] = useState("DEFAULT");
  const [adminCredentials, setAdminCredentials] = useState(null);

  const handleLoginSuccess = (data, type) => {
    if (type === "ADMIN") {
      setAdminCredentials({
        username: data.username,
        password: data.password,
      });
      setCurrentView("ADMIN");
    }
  };

  const handleLogout = () => {
    setAdminCredentials(null);
    setCurrentView("DEFAULT");
  };

  return (
    <div className="App">
      {currentView === "DEFAULT" && (
        <Dashboard onAdminLogin={handleLoginSuccess} onUserLogout={handleLogout}/>
      )}
      {currentView === "ADMIN" && adminCredentials && (
        <AdministratorDashboard
          adminUsername={adminCredentials.username}
          adminPassword={adminCredentials.password}
          onAdminLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
