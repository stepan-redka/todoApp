import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TodoItem, TodoStatus, TodoPriority } from '../models/todo.model';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private readonly apiUrl = 'http://localhost:5043/api/todos';

  constructor(private http: HttpClient) {}

  getAllTodos(): Observable<TodoItem[]> {
    return this.http.get<TodoItem[]>(this.apiUrl);
  }

  createTodo(command: { title: string; description?: string; priority: TodoPriority; deadline?: string }): Observable<string> {
    return this.http.post<string>(this.apiUrl, command);
  }

  updateTodo(id: string, input: { title: string; description?: string; status: TodoStatus; priority: TodoPriority; deadline?: string }): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, input);
  }

  deleteTodo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
