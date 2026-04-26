export interface RankingNomeItem {
  nome: string;
  frequencia: number;
  ranking: number;
}

export interface ResultadoNomeRanking {
  localidade: string;
  resultado: RankingNomeItem[];
}
