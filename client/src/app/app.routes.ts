import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard';

export const routes: Routes = [
    { path: 'dashboard', component: Dashboard },
    { path: 'todos', redirectTo: '/dashboard' },

    // Default path redirects to /dashboard
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    // Wildcard fallback
    { path: '**', redirectTo: '/dashboard' }
];