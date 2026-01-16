import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err?.message || "Erro ao autenticar");
    }
  }

  return (
    <main className="container login-page">
      <h1>Entrar</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        </label>
        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
        </label>
        {error && <div style={{ color: "#b91c1c" }}>{error}</div>}
        <button type="submit" className="btn primary">Entrar</button>
      </form>
    </main>
  );
}
