import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    imports: [FormsModule],
    templateUrl: './login.html',
    styleUrl: './login.css'
})
export class Login {
    protected username = '';
    protected password = '';
    protected errorMessage = '';

    constructor(private router: Router) { }

    protected onSubmit(): void {
        if (this.username.trim() && this.password.trim()) {
            // Mock Authentication: accepts any inputs and routes to dashboard                      
            this.router.navigate(['/dashboard']);
        } else {
            this.errorMessage = 'Please enter a username and password.';
        }
    }
}