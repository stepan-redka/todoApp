import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { Todos } from './features/todos/todos';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
    { path: 'todos', component: Todos, canActivate: [authGuard] },

    // Default path redirects to /login for now
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    // Wildcard fallback
    { path: '**', redirectTo: '/login' }
];