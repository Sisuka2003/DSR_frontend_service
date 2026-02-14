import logo from './logo.svg';
import './App.css';
import Dashboard from './components/dashboard/Dashboard';
import AdministratorDashboard from './components/Admin/AdminstratorDashboard';
import DataControllerDashboard from './components/dataController/DataControllerDashboard'
import Header from './components/header/Header';

function App() {
  return (
    <div className="App">
      {/* <Header/> */}
      <Dashboard />
    </div>
  );
}

export default App;
