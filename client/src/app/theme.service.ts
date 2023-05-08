import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private theme = new BehaviorSubject<string>('light-theme');

  public theme$ = this.theme.asObservable();

  constructor() {}

  public toggleTheme(): void {
    this.theme.getValue() === 'light-theme'
      ? this.theme.next('dark-theme')
      : this.theme.next('light-theme');
  }
}
