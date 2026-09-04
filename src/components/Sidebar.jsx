import { NavLink } from "react-router-dom";
import { LayoutDashboard, Pill, ShoppingCart, ReceiptText,TriangleAlert } from "lucide-react";
import "./sidebar.css";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="main-logo">
        <div className="logoCont">
          {/* Example Lucide SVG icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-cross h-5 w-5"
            aria-hidden="true"
          >
            <path d="M4 9a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4a1 1 0 0 1 1 1v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4a1 1 0 0 1 1-1h4a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-4a1 1 0 0 1-1-1V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4a1 1 0 0 1-1 1z"></path>
          </svg>
        </div>
        <div className="title">
          <h2 className="sidebar-logo">MediConnects</h2>
          <p className="sidebar-subtitle">Pharmacy Suite</p>
        </div>
      </div>

      <nav>
        <ul className="sidebar-links">
          <li>
            <NavLink to="/Dashboard" className={({ isActive }) => isActive ? "active" : ""}>
              <LayoutDashboard size={20} /> Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/inventory" className={({ isActive }) => isActive ? "active" : ""}>
              <Pill size={20} /> Inventory
            </NavLink>
          </li>
          <li>
            <NavLink to="/billing" className={({ isActive }) => isActive ? "active" : ""}>
              <ReceiptText size={20} /> Billing / POS
            </NavLink>
          </li>
          <li>
            <NavLink to="/sales" className={({ isActive }) => isActive ? "active" : ""}>
              <ShoppingCart size={20} /> Sales
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="sidebar-alerts">
        <p className="alert-text"><TriangleAlert size={13} /> Stock Alerts</p>
        <span>5 items need attention</span>
      </div>

      <div className="sidebar-user">
        <p className="user-name">Store Admin</p>
        <p className="user-role">Pharmacist</p>
      </div>
    </aside>
  );
}

export default Sidebar;
