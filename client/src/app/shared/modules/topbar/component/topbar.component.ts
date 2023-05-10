import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ThemeService } from '../../../../theme.service';
import { TranslateService } from '@ngx-translate/core'; // Correct import

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService,
    public translate: TranslateService
  ) {
    translate.addLangs(['en', 'ru', 'kk']);
    translate.setDefaultLang('en');
  }

  switchLang(lang: string) {
    this.translate.use(lang);
  }

  public toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }
}
