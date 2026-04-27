import logo from "./logo.svg";
import "./App.css";
import Dashboard from "./components/dashboard/Dashboard";
import AdministratorDashboard from "./components/Admin/AdminstratorDashboard";
import { useState, useEffect } from "react";
import { initiateKeyExchange } from "./utils/encryption";  // ← new

function App() {
  const [currentView, setCurrentView] = useState("DEFAULT");
  const [adminCredentials, setAdminCredentials] = useState(null);
  const [secureReady, setSecureReady] = useState(false);  // ← new

  // ← new — runs once on app start
  useEffect(() => {
    initiateKeyExchange()
      .then(() => setSecureReady(true))
      .catch((err) => console.error("Key exchange failed:", err));
  }, []);

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

  // ← new — don't render anything until secure session is ready
  if (!secureReady) {
    return <div style={{ padding: "2rem" }}>Establishing secure session...</div>;
  }

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