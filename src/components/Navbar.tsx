import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">FinPower</Link>

        <nav className="navbar-menu">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/categorias" className="nav-link">Categorias</Link>
          <Link to="/relatorios" className="nav-link">Relatórios</Link>
          <Link to="/partilhar" className="nav-link">Partilhar</Link>
        </nav>
      </div>
    </header>
  );
}
