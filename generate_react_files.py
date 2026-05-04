import os

files_to_create = {
    "src/App.jsx": """import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div>Landing Page Placeholder</div>} />
        <Route path="/menu" element={<div>Customer Menu Placeholder</div>} />
        <Route path="/dashboard/*" element={<div>Dashboard Placeholder</div>} />
        <Route path="/login" element={<div>Login Placeholder</div>} />
      </Routes>
    </Router>
  );
}

export default App;
""",
    "src/main.jsx": """import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
""",
    "src/pages/LandingPage/index.jsx": "export default function LandingPage() { return <div>Landing Page</div>; }",
    "src/pages/CustomerMenu/index.jsx": "export default function CustomerMenu() { return <div>Customer Menu</div>; }",
    "src/pages/Dashboard/Overview/index.jsx": "export default function Overview() { return <div>Dashboard Overview</div>; }",
    "src/pages/Dashboard/LiveOrders/index.jsx": "export default function LiveOrders() { return <div>Live Orders</div>; }",
    "src/pages/Dashboard/MenuManager/index.jsx": "export default function MenuManager() { return <div>Menu Manager</div>; }",
    "src/pages/Dashboard/TableManager/index.jsx": "export default function TableManager() { return <div>Table Manager</div>; }",
    "src/pages/Dashboard/StaffManager/index.jsx": "export default function StaffManager() { return <div>Staff Manager</div>; }",
    "src/pages/Dashboard/Analytics/index.jsx": "export default function Analytics() { return <div>Analytics</div>; }",
    "src/pages/Dashboard/Settings/index.jsx": "export default function Settings() { return <div>Settings</div>; }",
    "src/pages/Auth/Login.jsx": "export default function Login() { return <div>Login</div>; }",
    "src/pages/Auth/Register.jsx": "export default function Register() { return <div>Register</div>; }",
    "src/components/Navbar/index.jsx": "export default function Navbar() { return <nav>Navbar</nav>; }",
    "src/components/Sidebar/index.jsx": "export default function Sidebar() { return <aside>Sidebar</aside>; }",
    "src/components/OrderCard/index.jsx": "export default function OrderCard() { return <div>Order Card</div>; }",
    "src/components/MenuItemCard/index.jsx": "export default function MenuItemCard() { return <div>Menu Item Card</div>; }",
    "src/components/StatusBadge/index.jsx": "export default function StatusBadge() { return <span>Status</span>; }",
    "src/components/Modal/index.jsx": "export default function Modal({ children }) { return <div>{children}</div>; }",
    "src/context/AuthContext.jsx": "import { createContext } from 'react'; export const AuthContext = createContext();",
    "src/context/SocketContext.jsx": "import { createContext } from 'react'; export const SocketContext = createContext();",
    "src/context/CartContext.jsx": "import { createContext } from 'react'; export const CartContext = createContext();",
    "src/hooks/useSocket.js": "export function useSocket() { return {}; }",
    "src/hooks/useOrders.js": "export function useOrders() { return []; }",
    "src/services/api.js": "export const api = {};",
    "src/utils/formatCurrency.js": "export function formatCurrency(amount) { return amount; }",
    "src/utils/dateUtils.js": "export function formatDate(date) { return date; }"
}

base_dir = r"c:\Users\nikhi\Downloads\TableTap\frontend"

for filepath, content in files_to_create.items():
    full_path = os.path.join(base_dir, filepath.replace('/', os.sep))
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Created all React boilerplate files!")
