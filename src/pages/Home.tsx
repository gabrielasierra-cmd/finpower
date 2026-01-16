import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { Transacao } from "../data/transacoes";
import { Link } from "react-router-dom";
import { useSettings } from "../contexts/SettingsContext";

export default function Home() {
  const [relatorio, setRelatorio] = useState<
    { nome: string; total: number; cor: string }[]
  >([]);

  const [transacoes, setTransacoes] = useState<Transacao[]>([]);

  const { formatCurrency } = useSettings();

  useEffect(() => {
    async function load() {
      const r = await api.getRelatorioGastos();
      const t = await api.getTransacoes();
      setRelatorio(r);
      setTransacoes(t.slice(0, 5));
    }
    load();
  }, []);

  const maxRel = Math.max(1, ...relatorio.map((r) => r.total));

  return (
    <div className="app-container">

      {/* HEADER */}
      <div className="home-header">
        <h1 className="home-title">Bem-vinda ao FinPower!</h1>
        <p className="home-subtitle">
          Aqui tens uma visão clara e organizada das tuas finanças.
        </p>
      </div>

      {/* RESUMO */}
      <h2 className="section-title">Resumo Financeiro</h2>
      <div className="summary-chart">
        {relatorio.map((c) => (
          <div className="chart-row" key={c.nome}>
            <div className="chart-label">{c.nome}</div>
            <div className="chart-bar" aria-hidden>
              <div
                className="chart-fill"
                style={{ width: `${(c.total / maxRel) * 100}%`, background: c.cor }}
              />
            </div>
            <div className="chart-value">{formatCurrency(c.total)}</div>
          </div>
        ))}
      </div>

      {/* TRANSACOES */}
      <h2 className="section-title">Transações Recentes</h2>
      <div className="transactions-wrap">
        <div className="transaction-list">
          {transacoes.map((t) => (
            <div key={t.id} className="transaction-item">
              <span className="transaction-name">{t.descricao}</span>
              <span className="transaction-value">{formatCurrency(t.valor)}</span>
            </div>
          ))}
        </div>

        {/* Donut chart for recent transactions (simple, CSS conic-gradient) */}
        <div className="transaction-chart" aria-hidden>
          {transacoes.length > 0 ? (
            (() => {
              const total = transacoes.reduce((s, x) => s + x.valor, 0);
              const palette = ["#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#8338ec"];
              let acc = 0;
              const stops = transacoes.map((t, i) => {
                const perc = (t.valor / total) * 100;
                const start = acc;
                acc += perc;
                const end = acc;
                return `${palette[i % palette.length]} ${start}% ${end}%`;
              });
              const bg = `conic-gradient(${stops.join(', ')})`;
              return (
                <div className="donut-wrapper">
                  <div className="donut" style={{ background: bg }} />
                  <div className="donut-center">{formatCurrency(total)}</div>
                  <div className="donut-legend">
                    {transacoes.map((t, i) => (
                      <div key={t.id} className="legend-item">
                        <span className="legend-color" style={{ background: palette[i % palette.length] }} />
                        <span className="legend-label">{t.descricao}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="donut-empty">Sem transações</div>
          )}
        </div>
      </div>

      

    </div>
  );
}
