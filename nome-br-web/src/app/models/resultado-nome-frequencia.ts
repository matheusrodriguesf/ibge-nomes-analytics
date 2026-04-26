export interface FrequenciaNome {
    periodo: string;
    frequencia: number;
}


export interface ResultadoNomeFrequencia {
    nome: string;
    localidade: string;
    resultados: FrequenciaNome[];
}
