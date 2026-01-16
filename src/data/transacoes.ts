export type Transacao = {
  id: number;
  descricao: string;
  valor: number;
  categoriaId: number;
  data?: string;
};

export const transacoes: Transacao[] = [
  { id: 1, descricao: "Cinema", valor: 30.0, categoriaId: 1, data: "2025-12-01" },
  { id: 2, descricao: "Seguro do carro", valor: 150.0, categoriaId: 3, data: "2025-12-02" },
  { id: 3, descricao: "Bilhete de avião", valor: 450.0, categoriaId: 6, data: "2025-12-03" },
  { id: 4, descricao: "Conta de eletricidade", valor: 80.0, categoriaId: 3, data: "2025-12-04" },
  { id: 5, descricao: "Jantar", valor: 60.0, categoriaId: 5, data: "2025-12-05" },
  { id: 6, descricao: "Bombeiro (emergência)", valor: 200.0, categoriaId: 2, data: "2025-12-06" },
  { id: 7, descricao: "Renda", valor: 500, categoriaId: 3, data: "2025-11-01" },
  { id: 8, descricao: "Poupança mensal", valor: 100, categoriaId: 4, data: "2025-11-05" },
];
