import { useSettings } from '../contexts/SettingsContext';

export default function Ajustes() {
  const { theme, setTheme, locale, setLocale, currency, setCurrency } = useSettings();

  return (
    <main className="container">
      <div className="page-header"><h1>Ajustes</h1><p className="muted">Configura a aparência e moeda.</p></div>

      <section style={{ display: 'grid', gap: 12 }}>
        <div className="card">
          <h3>Aparência</h3>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
              <input type="radio" name="theme" checked={theme === 'light'} onChange={() => setTheme('light')} /> ☀️ Claro
            </label>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
              <input type="radio" name="theme" checked={theme === 'dark'} onChange={() => setTheme('dark')} /> 🌙 Escuro
            </label>
          </div>
        </div>

        <div className="card">
          <h3>Idioma</h3>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
              <input type="radio" name="locale" checked={locale === 'pt-PT'} onChange={() => setLocale('pt-PT')} /> 🇵🇹 Português
            </label>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
              <input type="radio" name="locale" checked={locale === 'es-ES'} onChange={() => setLocale('es-ES')} /> 🇪🇸 Español
            </label>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
              <input type="radio" name="locale" checked={locale === 'en-US'} onChange={() => setLocale('en-US')} /> 🇺🇸 English
            </label>
          </div>
        </div>

        <div className="card">
          <h3>Moeda</h3>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="BRL">BRL</option>
            </select>
          </div>
        </div>
      </section>
    </main>
  );
}
