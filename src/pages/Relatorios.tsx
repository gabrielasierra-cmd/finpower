import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { Transacao } from "../data/transacoes";
import type { Categoria } from "../data/categorias";
import { useSettings } from "../contexts/SettingsContext";

export default function Relatorios() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [viewYear, setViewYear] = useState<number>(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ descricao: '', valor: '', categoriaId: '' });

  useEffect(() => {
    let mounted = true;
    api.getTransacoes().then((t) => { if (mounted) setTransacoes(t); });
    api.getCategorias().then((c) => { if (mounted) setCategories(c); });
    return () => { mounted = false; };
  }, []);

  // use settings context for formatting
  const { formatCurrency, locale } = useSettings();

  function daysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }
  function startWeekday(year: number, month: number) {
    return new Date(year, month, 1).getDay();
  }
  function changeMonth(delta: number) {
    const date = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(date.getFullYear());
    setViewMonth(date.getMonth());
    setSelectedDay(null);
  }

  // Build map of transactions per day and compute predominant category per day
  const dayMap: Record<number, Transacao[]> = {};
  const predCat: Record<number, number | null> = {};
  transacoes.forEach((t) => {
    if (!t.data) return;
    // parse YYYY-MM-DD explicitly to avoid timezone shifts when using `new Date(string)`
    const parts = t.data.split('-').map(Number);
    if (parts.length >= 3) {
      const [yy, mm, dd] = parts;
      if (yy === viewYear && mm - 1 === viewMonth) {
        const day = dd;
        dayMap[day] = dayMap[day] || [];
        dayMap[day].push(t);
      }
    }
  });
  Object.keys(dayMap).forEach((k) => {
    const day = Number(k);
    const sums: Record<number, number> = {};
    dayMap[day].forEach((tx) => { sums[tx.categoriaId] = (sums[tx.categoriaId] || 0) + tx.valor; });
    // pick category with max sum
    let best: number | null = null;
    let bestVal = -Infinity;
    Object.entries(sums).forEach(([catId, val]) => {
      if (val > bestVal) { bestVal = val; best = Number(catId); }
    });
    predCat[day] = best;
  });

  const totalDays = daysInMonth(viewYear, viewMonth);
  const start = startWeekday(viewYear, viewMonth);
  const cells: (null | number)[] = [];
  for (let i = 0; i < start; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  function exportMonthCSV() {
    const rows: string[][] = [];
    rows.push(["date","descricao","valor","categoria"]);
    transacoes.forEach((t) => {
      if (!t.data) return;
      const parts = t.data.split('-').map(Number);
      if (parts.length >= 3) {
        const [yy, mm] = parts;
        if (yy === viewYear && mm - 1 === viewMonth) {
        const cat = categories.find((c) => c.id === t.categoriaId)?.nome ?? '';
        rows.push([t.data, t.descricao, t.valor.toString(), cat]);
        }
      }
    });
    const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g,'""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${viewYear}-${viewMonth+1}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleAddTx(e: React.FormEvent) {
    e.preventDefault();
    if (!form.descricao || !form.valor || !form.categoriaId) return;
    const valor = Number(form.valor);
    if (isNaN(valor) || valor <= 0) return;
  // build ISO date string YYYY-MM-DD without using toISOString (avoids timezone shifts)
  const dayNum = selectedDay ?? 1;
  const mm = String(viewMonth + 1).padStart(2, '0');
  const dd = String(dayNum).padStart(2, '0');
  const dataIso = `${viewYear}-${mm}-${dd}`;
    setAdding(true);
    try {
  const created = await api.addTransacao({ descricao: form.descricao, valor, categoriaId: Number(form.categoriaId), data: dataIso });
  // update local state but avoid duplicates in case the underlying mock array was mutated
  setTransacoes((prev) => (prev.some((t) => t.id === created.id) ? prev : [...prev, created]));
      // reset form
      setForm({ descricao: '', valor: '', categoriaId: '' });
      setSelectedDay(null);
    } catch (err) {
      console.error(err);
    } finally { setAdding(false); }
  }

  return (
    <main className="container">
      <div className="page-header">
        <h1>Relatórios</h1>
        <p className="muted">Resumo mensal — clique en días para ver transações.</p>
      </div>

      <div className="calendar">
        <div className="calendar-header">
          <div>
            <button className="btn small" onClick={() => changeMonth(-1)} aria-label="Mes anterior">◀</button>
            <button className="btn small" onClick={() => changeMonth(1)} aria-label="Mes siguiente">▶</button>
          </div>
          <div className="calendar-title">{new Date(viewYear, viewMonth).toLocaleString(locale, { month: 'long', year: 'numeric' })}</div>
          <div>
            <button className="btn" onClick={exportMonthCSV}>Exportar CSV</button>
          </div>
        </div>

        <div className="calendar-weekdays">
          {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map((d) => (
            <div key={d} className="calendar-weekday">{d}</div>
          ))}
        </div>

        <div className="calendar-grid">
          {cells.map((cell, idx) =>
            cell ? (
              <div
                key={idx}
                role="button"
                onClick={() => setSelectedDay(cell)}
                className={`calendar-day ${dayMap[cell] ? 'has-data' : ''}`}
                title={dayMap[cell] && dayMap[cell].length ? `${dayMap[cell].length} transações` : 'Sem gastos'}
                style={predCat[cell] ? { boxShadow: `inset 6px 0 0 ${categories.find(c => c.id === predCat[cell])?.cor || '#000'}` } : undefined}
              >
                <div className="date-number">{cell}</div>
                {dayMap[cell] && dayMap[cell].length ? <div className="day-total">{formatCurrency(dayMap[cell].reduce((s, x) => s + x.valor, 0))}</div> : <div className="day-empty">-</div>}
              </div>
            ) : (
              <div key={idx} className="calendar-day empty" />
            )
          )}
        </div>
      </div>

      {/* Modal with transactions for selected day */}
      {selectedDay != null && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={() => setSelectedDay(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
              <h3>Transações — {selectedDay} {new Date(viewYear, viewMonth).toLocaleString(locale, { month: 'long', year: 'numeric' })}</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn small" onClick={() => { setForm({ descricao: '', valor: '', categoriaId: '' }); setAdding(false); }}>Nuevo</button>
                <button className="btn small" onClick={() => setSelectedDay(null)}>Fechar</button>
              </div>
            </div>
            <div className="modal-body">
              {(dayMap[selectedDay] || []).length === 0 ? (
                <div>Sem transações neste dia.</div>
              ) : (
                <ul className="tx-list">
                  {(dayMap[selectedDay] || []).map((t) => (
                    <li key={t.id} className="tx-item">
                      <div className="tx-desc">{t.descricao}</div>
                      <div className="tx-meta">
                        <span className="tx-cat" style={{ background: categories.find(c => c.id === t.categoriaId)?.cor }} />
                        <span className="tx-val">{formatCurrency(t.valor)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Add transaction form */}
              <form onSubmit={handleAddTx} style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                <input placeholder="Descrição" value={form.descricao} onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))} />
                <input placeholder="Valor" value={form.valor} onChange={(e) => setForm(f => ({ ...f, valor: e.target.value }))} />
                <select value={form.categoriaId} onChange={(e) => setForm(f => ({ ...f, categoriaId: e.target.value }))}>
                  <option value="">Selecciona categoría</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn" type="submit" disabled={adding}>{adding ? 'Guardando...' : 'Guardar'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
