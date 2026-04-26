import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ResultadoNomeRanking } from '../models/resultado-nome-ranking';
import { firstValueFrom } from 'rxjs';
import { ResultadoNomeFrequencia } from '../models/resultado-nome-frequencia';

@Injectable({
  providedIn: 'root',
})
export class CensoNomeService {
  private readonly baseUrl = '/api/censos';
  private readonly http = inject(HttpClient);

  getRankingNome(): Promise<ResultadoNomeRanking[]> {
    return firstValueFrom(this.http.get<ResultadoNomeRanking[]>(`${this.baseUrl}/ranking-nomes`));
  }

  getFrequenciaNome(nome: string): Promise<ResultadoNomeFrequencia[]> {
    return firstValueFrom(this.http.get<ResultadoNomeFrequencia[]>(`${this.baseUrl}/frequencia-nomes/${nome}`));
  }

}
