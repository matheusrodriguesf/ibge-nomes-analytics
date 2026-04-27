import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SelectDistritoItem } from '../models/select-distrito-item';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocalidadeService {
  private readonly baseUrl = '/api/localidades/estados';
  private readonly http = inject(HttpClient);


  getAllEstados(): Promise<SelectDistritoItem[]> {
    return firstValueFrom(this.http.get<SelectDistritoItem[]>(`${this.baseUrl}`));
  }

  getDistritosByEstado(estadoId: number): Promise<SelectDistritoItem[]> {
    return firstValueFrom(this.http.get<SelectDistritoItem[]>(`${this.baseUrl}/${estadoId}/distritos`));
  }
}
