import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './auth/services/auth.service';
import { SocketService } from './shared/services/socket.service';
import { ThemeService } from './theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  private themeSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private socketService: SocketService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.themeSubscription = this.themeService.theme$.subscribe((theme) => {
      document.documentElement.classList.remove('light-theme', 'dark-theme');
      document.documentElement.classList.add(theme);
    });

    this.authService.getCurrentUser().subscribe({
      next: (currentUser) => {
        this.socketService.setupSocketConnection(currentUser);
        this.authService.setCurrentUser(currentUser);
      },
      error: (err) => {
        console.log('err', err);
        this.authService.setCurrentUser(null);
      },
    });
  }

  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }

  public toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
