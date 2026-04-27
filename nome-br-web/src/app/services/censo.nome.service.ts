import { HttpClient, HttpParams } from '@angular/common/http';
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

  getRankingNome(localidade?: number | null, sexo?: 'M' | 'F' | null): Promise<ResultadoNomeRanking[]> {
    let params = new HttpParams();

    if (localidade) {
      params = params.set('localidade', localidade);
    }

    if (sexo) {
      params = params.set('sexo', sexo);
    }

    return firstValueFrom(
      this.http.get<ResultadoNomeRanking[]>(`${this.baseUrl}/ranking-nomes`, {
        params: params.keys().length ? params : undefined,
      })
    );
  }

  getFrequenciaNome(
    nome: string,
    localidade?: number | null,
    sexo?: 'M' | 'F' | null,
  ): Promise<ResultadoNomeFrequencia[]> {
    let params = new HttpParams();

    if (localidade) {
      params = params.set('localidade', localidade);
    }

    if (sexo) {
      params = params.set('sexo', sexo);
    }

    return firstValueFrom(
      this.http.get<ResultadoNomeFrequencia[]>(`${this.baseUrl}/frequencia-nomes/${nome}`, {
        params: params.keys().length ? params : undefined,
      })
    );
  }

}
