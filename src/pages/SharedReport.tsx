import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function SharedReport() {
  const { token } = useParams<{ token: string }>();
  const [snapshot, setSnapshot] = useState<any | null>(null);

  const navigate = useNavigate();
  useEffect(() => {
    if (!token) return;
    let mounted = true;
    api.getShare(token)
      .then(s => { if (mounted) setSnapshot(s); })
      .catch(() => {
        // if share not found, redirect user to Relatórios (focus export)
        if (mounted) navigate('/relatorios?focus=export');
      });
    return () => { mounted = false; };
  }, [token, navigate]);

  if (!snapshot) return <main className="container"><h1>Cargando...</h1></main>;

  const totalByCat = (catId: number) => (snapshot.transacoes || []).filter((t: any) => t.categoriaId === catId).reduce((s: number, x: any) => s + x.valor, 0);

  return (
    <main className="container">
      <div className="page-header">
        <h1>{snapshot.title || 'Relatório Compartido'}</h1>
        <p className="muted">Gerado em {new Date(snapshot.createdAt).toLocaleString()}</p>
      </div>

      <section>
        <h3>Totais por categoria</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 8 }}>
          {(snapshot.categorias || []).map((c: any) => (
            <div key={c.id} style={{ padding: 10, borderRadius: 8, background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 12, height: 12, background: c.cor, display: 'inline-block', borderRadius: 3 }} />
                <strong>{c.nome}</strong>
              </div>
              <div style={{ marginTop: 8 }}>{new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(totalByCat(c.id))}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 16 }}>
        <h3>Transações ({(snapshot.transacoes || []).length})</h3>
        <div style={{ marginTop: 8 }}>
          {(snapshot.transacoes || []).map((t: any) => (
            <div key={t.id} style={{ padding: 8, borderRadius: 8, background: '#fff', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{t.descricao}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{t.data}</div>
              </div>
              <div style={{ fontWeight: 700 }}>{new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(t.valor)}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
