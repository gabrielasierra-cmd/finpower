export type Categoria = {
  id: number;
  nome: string;
  cor: string;
};

export const categorias: Categoria[] = [
  { id: 1, nome: "Lazer", cor: "#FF9800" },
  { id: 2, nome: "Emergência", cor: "#F44336" },
  { id: 3, nome: "Contas Fixas", cor: "#3F51B5" },
  { id: 4, nome: "Poupança", cor: "#4CAF50" },
  { id: 5, nome: "Extras", cor: "#9C27B0" },
  { id: 6, nome: "Viagens", cor: "#03A9F4" },
];
