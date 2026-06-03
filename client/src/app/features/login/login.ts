import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    imports: [FormsModule],
    templateUrl: './login.html',
    styleUrl: './login.css'
})
export class Login {
    protected email = '';
    protected password = '';
    protected errorMessage = '';
    protected successMessage = '';
    protected isLoginMode = true;

    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    protected toggleMode(): void {
        this.isLoginMode = !this.isLoginMode;
        this.errorMessage = '';
        this.successMessage = '';
        this.password = '';
    }

    protected onSubmit(): void {
        this.errorMessage = '';
        this.successMessage = '';

        if (!this.email.trim() || !this.password.trim()) {
            this.errorMessage = 'Please enter both email and password.';
            return;
        }

        const credentials = { email: this.email, password: this.password };

        if (this.isLoginMode) {
            this.authService.login(credentials).subscribe({
                next: () => {
                    this.router.navigate(['/dashboard']);
                },
                error: (err) => {
                    this.errorMessage = err.error?.detail || 'Invalid email or password.';
                }
            });
        } else {
            this.authService.register(credentials).subscribe({
                next: () => {
                    // Success! Automatically log the user in under the hood and redirect to dashboard
                    this.authService.login(credentials).subscribe({
                        next: () => {
                            this.router.navigate(['/dashboard']);
                        },
                        error: () => {
                            // Fallback if login fails right after registration
                            this.errorMessage = 'Account created, but automatic sign in failed. Please sign in manually.';
                            this.isLoginMode = true;
                            this.password = '';
                        }
                    });
                },
                error: (err) => {
                    if (err.error?.errors) {
                        const validationErrors = Object.values(err.error.errors).flat() as string[];
                        this.errorMessage = validationErrors.join(' ');
                    } else {
                        this.errorMessage = err.error?.detail || 'Registration failed. Try again.';
                    }
                }
            });
        }
    }
}