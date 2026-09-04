import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./Pages/Dashboard";
import Inventory from "./Pages/Inventory";
import Billing from "./Pages/Billing";
import Sale from "./Pages/Sale";
import Login from "./Pages/Login";
import Signin from "./Pages/Signin";
import ChangePassword from "./Pages/ChangePassword";
import "./App.css"; // Import the CSS file

function Layout() {
  const location = useLocation();

  // Define routes where sidebar should NOT appear
  const hideSidebarRoutes = ["/login", "/signin", "/ChangePassword"];
  const shouldHideSidebar = hideSidebarRoutes.includes(location.pathname);

  return (
    <div className="app-container">
      {!shouldHideSidebar && <Sidebar />}
      <main className="main-content">
        <Routes>
          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/ChangePassword" element={<ChangePassword />} />

          {/* Core Pharmacy Suite Routes */}
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/Billing" element={<Billing />} />
          <Route path="/sales" element={<Sale />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;

