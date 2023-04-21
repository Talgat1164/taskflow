import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../login/login.component.scss']
})
export class RegisterComponent {
  errorMessage: string | null = null; 
  
  form = this.fb.group({
    email: ['', Validators.required],
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService, 
    private router: Router, 
  ) {}

  onSubmit(): void { 
    const email = this.form.get('email')?.value?.trim();
    const username = this.form.get('username')?.value?.trim();
    const password = this.form.get('password')?.value?.trim();

    if (email && username && password) {
      const registerRequest = { email, username, password };
      this.authService.register(registerRequest).subscribe({
        next: (currentUser) => {
          console.log('currentUser', currentUser);
          this.authService.setToken(currentUser);
          this.authService.setCurrentUser(currentUser);
          this.errorMessage = null;
          this.router.navigateByUrl('/');
        },
        error: (err: HttpErrorResponse) => {
          console.log('err', err.error);
          this.errorMessage = err.error.join(', ');
        },
      });
    }
  }
}

