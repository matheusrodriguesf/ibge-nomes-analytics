import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  { path: 'ranking', loadComponent: () => import('./features/ranking-nome/ranking-nome').then((m) => m.RankingNomeComponent) },
  { path: 'frequencia', loadComponent: () => import('./features/frequencia-nome/frequencia-nome').then((m) => m.FrequenciaNomeComponent) },
  {
    path: '**',
    redirectTo: '',
  },

];
