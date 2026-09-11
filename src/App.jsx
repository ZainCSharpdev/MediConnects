import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./Pages/Dashboard";
import Inventory from "./Pages/Inventory";
import Billing from "./Pages/Billing";
import Sale from "./Pages/Sale";
import Login from "./Pages/Login";
import Signin from "./Pages/Signin";
import ChangePassword from "./Pages/ChangePassword";
import "./App.css";

// 1. Protects private routes: If no user in localStorage, send to /login
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem("user");
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// 2. Restricts public auth routes: If already logged in, skip login and send to /Dashboard
const PublicOnlyRoute = ({ children }) => {
  const user = localStorage.getItem("user");
  if (user) {
    return <Navigate to="/Dashboard" replace />;
  }
  return children;
};

function Layout() {
  const location = useLocation();

  // Sidebar will NOT appear on these specified auth routes
  const hideSidebarRoutes = ["/login", "/signin", "/ChangePassword"];
  const shouldHideSidebar = hideSidebarRoutes.includes(location.pathname);

  return (
    <div className="app-container">
      {!shouldHideSidebar && <Sidebar />}
      <main className="main-content">
        <Routes>
          {/* Root route checks session: goes to Dashboard if logged in, otherwise Login */}
          <Route
            path="/"
            element={
              localStorage.getItem("user") ? (
                <Navigate to="/Dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Authentication Routes (Sidebar hidden automatically) */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/signin"
            element={
              <PublicOnlyRoute>
                <Signin />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/ChangePassword"
            element={
              <PublicOnlyRoute>
                <ChangePassword />
              </PublicOnlyRoute>
            }
          />

          {/* Core Pharmacy Suite Routes (Sidebar will display) */}
          <Route
            path="/Dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Billing"
            element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute>
                <Sale />
              </ProtectedRoute>
            }
          />

          {/* Fallback Catch-all Route */}
          <Route
            path="*"
            element={
              <Navigate
                to={localStorage.getItem("user") ? "/Dashboard" : "/login"}
                replace
              />
            }
          />
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