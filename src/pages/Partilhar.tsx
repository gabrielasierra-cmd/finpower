import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function Partilhar() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth());
  const [link, setLink] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [postcards, setPostcards] = useState<any[]>([]);
  const [selectedPostcards, setSelectedPostcards] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let mounted = true;
    api.getPostcards().then(p => { if (mounted) setPostcards(p); }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  async function handleShare() {
    setLoading(true);
    try {
      const trans = await api.getTransacoes();
      const cats = await api.getCategorias();
      const snapshot = {
        title: `Despensa - ${new Date(year, month).toLocaleString('pt-PT', { month: 'long', year: 'numeric' })}`,
        year,
        month,
        createdAt: new Date().toISOString(),
        categorias: cats,
        transacoes: Array.from(
          trans
            .filter(t => {
              if (!t.data) return false;
              const [yy, mm] = t.data.split('-').map(Number);
              return yy === year && mm - 1 === month;
            })
            // dedupe by id to prevent repeated entries
            .reduce((map, t) => (map.has(t.id) ? map : map.set(t.id, t)), new Map<number, any>())
            .values()
        ),
        postcards: postcards.filter(p => selectedPostcards[p.id])
      };

  const res = await api.createShare(snapshot);
      // build absolute URL
      const base = typeof window !== 'undefined' ? window.location.origin : '';
  setToken(res.token);
  setLink(base + res.url);
    } catch (err) {
      console.error(err);
      setLink(null);
    } finally { setLoading(false); }
  }

  return (
    <main className="container">
      <div className="page-header">
        <h1>Partilhar Relatório</h1>
        <p className="muted">Gera um link público para partilhar o relatório da tua despensa.</p>
      </div>

      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: '1fr 350px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div className="card" style={{ padding: 24, background: '#fff', borderRadius: 16, boxShadow: '0 2px 4px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0' }}>
            <h3 style={{ marginBottom: 16, fontSize: '1.1rem', color: '#111827' }}>Configuração</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: 6 }}>Mês</label>
                <select 
                  value={month} 
                  onChange={(e) => setMonth(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.95rem', background: '#fff' }}
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <option key={i} value={i}>{new Date(2020, i).toLocaleString('pt-PT', { month: 'long' })}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#374151', marginBottom: 6 }}>Ano</label>
                <input 
                  type="number" 
                  value={year} 
                  onChange={(e) => setYear(Number(e.target.value))} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: '0.95rem' }} 
                />
              </div>
              <button className="btn primary" onClick={handleShare} disabled={loading} style={{ height: 42, padding: '0 20px' }}>
                {loading ? 'A gerar...' : 'Gerar Link'}
              </button>
            </div>
          </div>

          {link && (
            <div style={{ background: '#ecfdf5', padding: 24, borderRadius: 16, border: '1px solid #a7f3d0' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#065f46', fontSize: '1.1rem' }}>Link Criado com Sucesso!</h3>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input 
                  readOnly 
                  value={link} 
                  style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #6ee7b7', background: '#fff', color: '#064e3b' }}
                />
                <button className="btn" onClick={() => navigator.clipboard.writeText(link)} style={{ background: '#fff', border: '1px solid #6ee7b7', color: '#065f46' }}>Copiar</button>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <a className="btn primary" href={link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>Abrir Relatório ↗</a>
                <button className="btn" onClick={async () => {
                  if (!token) return;
                  setLoading(true);
                  try {
                    const r = await api.regenerateShare(token);
                    const base2 = typeof window !== 'undefined' ? window.location.origin : '';
                    setToken(r.token);
                    setLink(base2 + r.url);
                  } catch (e) {
                    console.error(e);
                  } finally { setLoading(false); }
                }} disabled={loading}>{loading ? 'A regenerar...' : 'Regenerar Link'}</button>
              </div>
            </div>
          )}

        </div>

        <div style={{ background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 2px 4px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0' }}>
          <h3 style={{ marginBottom: 8, fontSize: '1.1rem', color: '#111827' }}>Incluir Conselhos</h3>
          <p className="muted" style={{ marginBottom: 16, fontSize: '0.9rem' }}>Seleciona os conselhos que queres incluir no relatório partilhado.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '500px', overflowY: 'auto' }}>
            {postcards.length === 0 ? (
              <div style={{ padding: 16, textAlign: 'center', color: '#9ca3af', border: '1px dashed #e5e7eb', borderRadius: 8 }}>
                Sem conselhos disponíveis.
              </div>
            ) : postcards.map(p => (
              <label key={p.id} style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 12, 
                padding: 12, 
                background: selectedPostcards[p.id] ? '#f0fdf4' : '#f9fafb', 
                borderRadius: 8, 
                cursor: 'pointer',
                border: selectedPostcards[p.id] ? '1px solid #86efac' : '1px solid #f3f4f6',
                transition: 'all 0.2s'
              }}>
                <input 
                  type="checkbox" 
                  checked={!!selectedPostcards[p.id]} 
                  onChange={() => setSelectedPostcards(s => ({ ...s, [p.id]: !s[p.id] }))} 
                  style={{ marginTop: 4 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#1f2937', marginBottom: 2 }}>{p.title}</div>
                  <div style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.4 }}>{p.text}</div>
                  <div style={{ marginTop: 6 }}>
                    <span style={{ fontSize: '0.7rem', background: '#e5e7eb', padding: '2px 6px', borderRadius: 4, color: '#4b5563' }}>{p.tag}</span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
