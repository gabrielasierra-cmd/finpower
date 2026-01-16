import { useEffect, useState } from "react";
import { api } from "../services/api";

type Cat = { id: number; nome: string; cor: string };

export default function Categorias() {
  const [cats, setCats] = useState<Cat[]>([]);

  useEffect(() => {
    let mounted = true;
    Promise.all([api.getCategorias(), api.getRelatorioGastos()]).then(([c, r]) => {
      if (!mounted) return;
      // merge totals into categories by name
      const byName = new Map(r.map((x) => [x.nome, x]));
      const merged = c.map((cat: Cat) => ({
        ...cat,
        total: (byName.get(cat.nome)?.total ?? 0),
      }));
      // sort by total desc
      merged.sort((a, b) => (b.total ?? 0) - (a.total ?? 0));
      setCats(merged);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const fmt = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' });

  return (
    <main className="container">
      <div className="page-header">
        <h1>Categorias</h1>
        <p className="muted">Categorias ordenadas por gasto (maior primeiro). Cores representam cada categoria.</p>
      </div>

      <section className="category-grid" aria-label="Categorias">
        {cats.map((c) => (
          <article key={c.id} className="category-card" role="group" aria-roledescription="categoria">
            <div className="category-meta">
              <span className="category-badge" style={{ background: c.cor }} aria-hidden />
              <div>
                <div className="category-name">{c.nome}</div>
                <div className="category-total">{fmt.format((c as any).total ?? 0)}</div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
