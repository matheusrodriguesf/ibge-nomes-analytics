import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppFooter } from './shared/components/app-footer/app-footer';
import { TopMenu } from './shared/components/top-menu/top-menu';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopMenu, AppFooter],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
