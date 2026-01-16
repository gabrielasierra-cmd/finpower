import { Link } from "react-router-dom";
import { useSettings } from "../contexts/SettingsContext";
import "./Sidebar.css";

export default function Sidebar() {
  const { sidebarCollapsed } = useSettings();
  const width = sidebarCollapsed ? "64px" : "240px";

  return (
    <aside className="sidebar" style={{ width, transition: "width 0.2s" }}>
      <div className="sidebar-logo">{sidebarCollapsed ? "FP" : "FinPower"}</div>

      <nav className="sidebar-menu">
        <Link to="/" className="sidebar-item" title="Vista Geral">🏠 {!sidebarCollapsed && "Vista Geral"}</Link>
        <Link to="/categorias" className="sidebar-item" title="Dispensas">📦 {!sidebarCollapsed && "Dispensas"}</Link>
        <Link to="/relatorios" className="sidebar-item" title="Relatórios">📊 {!sidebarCollapsed && "Relatórios"}</Link>
        <Link to="/partilhar" className="sidebar-item" title="Partilhar">🔗 {!sidebarCollapsed && "Partilhar"}</Link>
        <Link to="/consejos" className="sidebar-item" title="Conselhos">💡 {!sidebarCollapsed && "Conselhos"}</Link>
        <Link to="/ajustes" className="sidebar-item" title="Ajustes">⚙️ {!sidebarCollapsed && "Ajustes"}</Link>
      </nav>
    </aside>
  );
}
