import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Categorias from "./pages/Categorias";
import Relatorios from "./pages/Relatorios";
import Partilhar from "./pages/Partilhar";
import Postcards from "./pages/Postcards";
import Ajustes from "./pages/Ajustes";
import Login from "./pages/Login";
import SharedReport from "./pages/SharedReport";
import { useSettings } from "./contexts/SettingsContext";

export default function App() {
  const { sidebarCollapsed, theme } = useSettings();
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <main style={{
        marginLeft: sidebarCollapsed ? "64px" : "240px",
        transition: "margin-left 0.2s",
        padding: "2rem",
        width: "100%",
        background: theme === 'dark' ? '#121212' : "#fff1f2",
        color: theme === 'dark' ? '#e0e0e0' : 'inherit'
      }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/partilhar" element={<Partilhar />} />
          <Route path="/consejos" element={<Postcards />} />
          <Route path="/ajustes" element={<Ajustes />} />
          <Route path="/shared/:token" element={<SharedReport />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
}
