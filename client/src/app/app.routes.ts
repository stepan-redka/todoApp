import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { Todos } from './features/todos/todos';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'dashboard', component: Dashboard },
    { path: 'todos', component: Todos },

    // Default path redirects to /login for now
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    // Wildcard fallback
    { path: '**', redirectTo: '/login' }
];