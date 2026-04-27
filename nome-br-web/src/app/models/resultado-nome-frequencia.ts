export interface FrequenciaNome {
    periodo: string;
    frequencia: number;
}


export interface ResultadoNomeFrequencia {
    nome: string;
    sexo?: string | null;
    localidade: string;
    resultados: FrequenciaNome[];
}
