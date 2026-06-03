import { Component, OnInit, Signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectAllTodos } from '../../state/todo.selectors';
import { TodoActions } from '../../state/todo.actions';
import { TodoItem } from '../../core/models/todo.model';

@Component({
    selector: 'app-dashboard',
    imports: [RouterLink],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
    protected readonly todos: Signal<TodoItem[]>;

    constructor(private store: Store) {
        this.todos = this.store.selectSignal(selectAllTodos);
    }

    ngOnInit(): void {
        // Dispatch load action on boot to make sure stats are up-to-date                         
        this.store.dispatch(TodoActions.loadTodos());
    }

    // Statistics Calculators                                                                   
    protected getTotalCount(): number {
        return this.todos().length;
    }

    protected getInProgressCount(): number {
        return this.todos().filter(t => t.status === 1).length;
    }

    protected getCompletedCount(): number {
        return this.todos().filter(t => t.status === 2).length;
    }
}                