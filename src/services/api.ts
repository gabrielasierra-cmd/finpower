import { categorias } from "../data/categorias.ts";
import type { Categoria } from "../data/categorias.ts";
import { transacoes } from "../data/transacoes.ts";
import type { Transacao } from "../data/transacoes.ts";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// keep an internal, immutable copy of the transactions to avoid mutating the imported module array
let dbTransacoes = [...transacoes];
// simple in-memory store for shared snapshots
type Share = { token: string; createdAt: string; snapshot: any };
let dbShares: Record<string, Share> = {};
// index to avoid creating duplicate shares for identical snapshots
let dbShareIndex: Record<string, string> = {};
// postcards in-memory
let dbPostcards: any[] = [];

export const api = {
  async login(email: string, password: string) {
    await delay(500);
    if (email === "teste@finpower.com" && password === "123456") {
      return { id: 1, email };
    }
    throw new Error("Credenciais inválidas");
  },

  async getCategorias() {
    await delay(500);
    return categorias;
  },

  async getTransacoes() {
    await delay(500);
    // return a copy to prevent callers from mutating internal storage
    return [...dbTransacoes];
  },

  async getRelatorioGastos() {
    await delay(500);
    return categorias.map((cat: Categoria) => {
      const total = dbTransacoes
        .filter((t: Transacao) => t.categoriaId === cat.id)
        .reduce((sum: number, t: Transacao) => sum + t.valor, 0);

      return {
        nome: cat.nome,
        total,
        cor: cat.cor,
      };
    });
  },

  

  async digitalizar() {
    await delay(500);
    return { mensagem: "Digitalização simulada com sucesso!" };
  },

  async addTransacao(newTx: Omit<Transacao, 'id'>) {
    // simple mock: assign incremental id and keep db immutable
    await delay(200);
    const maxId = dbTransacoes.reduce((m, t) => Math.max(m, t.id), 0);
    // normalize date to YYYY-MM-DD to avoid timezone shifts or datetime strings
    const normalizeDate = (d?: string) => {
      if (!d) return undefined;
      const m = d.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (!m) return d;
      const yyyy = m[1];
      const mm = String(Number(m[2])).padStart(2, '0');
      const dd = String(Number(m[3])).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };
    const created: Transacao = { id: maxId + 1, ...newTx, data: normalizeDate(newTx.data) } as Transacao;
    // create a new array rather than mutating the imported module array
    dbTransacoes = [...dbTransacoes, created];
    return created;
  },

  async createShare(snapshot: any) {
    await delay(150);
    // avoid duplicate shares for identical snapshots: use a simple JSON key
    // try server first
    try {
      const res = await fetch('http://localhost:4000/api/shares', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(snapshot)
      });
      if (!res.ok) throw new Error('server error');
      return await res.json();
    } catch (e) {
      // fallback to in-memory
      await delay(150);
      const key = JSON.stringify(snapshot);
      if (dbShareIndex[key]) {
        const existingToken = dbShareIndex[key];
        const existing = dbShares[existingToken];
        return { token: existingToken, url: `/shared/${existingToken}`, createdAt: existing.createdAt };
      }
      const token = (Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
      const createdAt = new Date().toISOString();
      dbShares[token] = { token, createdAt, snapshot };
      dbShareIndex[key] = token;
      return { token, url: `/shared/${token}`, createdAt };
    }
  },

  async getShare(token: string) {
    // prefer server
    try {
      const res = await fetch(`http://localhost:4000/api/shares/${token}`);
      if (!res.ok) throw new Error('not found');
      return await res.json();
    } catch (e) {
      // fallback to in-memory
      await delay(120);
      const s = dbShares[token];
      if (!s) throw new Error('Share not found');
      return s.snapshot;
    }
  },

  async regenerateShare(oldToken: string) {
    try {
      const res = await fetch(`http://localhost:4000/api/shares/${oldToken}/regenerate`, { method: 'POST' });
      if (!res.ok) throw new Error('server error');
      return await res.json();
    } catch (e) {
      await delay(120);
      const existing = dbShares[oldToken];
      if (!existing) throw new Error('Share not found');
      const newToken = (Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
      const createdAt = new Date().toISOString();
      try {
        const key = JSON.stringify(existing.snapshot);
        if (dbShareIndex[key] === oldToken) delete dbShareIndex[key];
        dbShareIndex[key] = newToken;
      } catch (e) {}
      delete dbShares[oldToken];
      return { token: newToken, url: `/shared/${newToken}`, createdAt };
    }
  },

  async partilhar() {
    await delay(500);
    return { status: "ok", mensagem: "Dados partilhados com sucesso" };
  },
  // postcards: fetch from mock server or return in-memory
  async getPostcards() {
    try {
      const res = await fetch('http://localhost:4000/api/postcards');
      if (!res.ok) throw new Error('server');
      return await res.json();
    } catch (e) {
      await delay(120);
      return [...dbPostcards];
    }
  },

  async addPostcard(p: { title: string; text: string; tag?: string }) {
    try {
      const res = await fetch('http://localhost:4000/api/postcards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) });
      if (!res.ok) throw new Error('server');
      return await res.json();
    } catch (e) {
      await delay(120);
      const id = dbPostcards.reduce((m, x) => Math.max(m, x.id ?? 0), 0) + 1;
      const created = { id, ...p, createdAt: new Date().toISOString() };
      dbPostcards.push(created);
      return created;
    }
  },
  async resetAll() {
    // prefer server
    try {
      const res = await fetch('http://localhost:4000/api/reset', { method: 'POST' });
      if (!res.ok) throw new Error('server');
      return await res.json();
    } catch (e) {
      // fallback to in-memory reset
      dbTransacoes = [...transacoes];
      dbPostcards = [];
      dbShares = {};
      dbShareIndex = {};
      return { ok: true };
    }
  },
};
