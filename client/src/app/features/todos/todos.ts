import { Component, OnInit, Signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { TodoItem, TodoStatus, TodoPriority } from '../../core/models/todo.model';
import { TodoActions } from '../../state/todo.actions';
import { selectAllTodos } from '../../state/todo.selectors';

@Component({
  selector: 'app-todos',
  imports: [FormsModule, DatePipe, RouterLink],
  templateUrl: './todos.html',
  styleUrl: './todos.css'
})
export class Todos implements OnInit {
  protected newTitle = '';
  protected newDescription = '';
  protected newPriority = TodoPriority.Medium;
  protected newDeadline = '';

  protected readonly todos: Signal<TodoItem[]>;

  constructor(private store: Store) {
    this.todos = this.store.selectSignal(selectAllTodos);
  }

  ngOnInit(): void {
    this.store.dispatch(TodoActions.loadTodos());
  }

  protected onSubmit(): void {
    if (!this.newTitle.trim()) return;

    this.store.dispatch(TodoActions.createTodo({
      title: this.newTitle,
      description: this.newDescription || undefined,
      priority: Number(this.newPriority),
      deadline: this.newDeadline || undefined
    }));

    this.newTitle = '';
    this.newDescription = '';
    this.newPriority = TodoPriority.Medium;
    this.newDeadline = '';
  }

  protected onDelete(id: string): void {
    this.store.dispatch(TodoActions.deleteTodo({ id }));
  }

  protected onStatusChange(todo: TodoItem, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newStatus = Number(target.value) as TodoStatus;

    this.store.dispatch(TodoActions.updateTodo({
      id: todo.id,
      title: todo.title,
      description: todo.description,
      status: newStatus,
      priority: todo.priority,
      deadline: todo.deadline
    }));
  }
}
