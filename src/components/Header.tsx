import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function IconLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="4" fill="#fff" />
      <path d="M7 8h10M7 12h10M7 16h6" stroke="#064e3b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M3 3h2l.4 2M7 13h10l3-7H6.4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="20" r="1" fill="#fff" />
      <circle cx="18" cy="20" r="1" fill="#fff" />
    </svg>
  );
}

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="nav-left">
        <Link to="/" className="brand-link">
          <span className="brand-logo"><IconLogo /></span>
          <span className="nav-brand">FinPower</span>
        </Link>
      </div>

      <div className="nav-right">
        <nav className="nav-links" aria-label="main navigation">
          <Link to="/">Home</Link>
          <Link to="/categorias">Categorias</Link>
          <Link to="/relatorios">Relatórios</Link>
        </nav>

        <div className="nav-actions">
          <Link to="/cart" className="cart-link" aria-label="Carrinho">
            <span className="cart-icon"><IconCart /></span>
            <span className="cart-count">1</span>
          </Link>

          {user ? (
            <div className="user-area">
              <span className="user-email">{user.email}</span>
              <button className="btn" onClick={logout} style={{ marginLeft: 8 }}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="nav-login">
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
