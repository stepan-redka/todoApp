import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { TodoService } from '../core/services/todo.service';
import { TodoActions } from './todo.actions';

@Injectable()
export class TodoEffects {
    // Inject our dependencies (Actions listener stream and the Todo database service)                                                
    private readonly actions$ = inject(Actions);
    private readonly todoService = inject(TodoService);

    // 1. Effect: Listen for 'Load Todos', fetch them from C# API, and dispatch result                                                
    loadTodos$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TodoActions.loadTodos), // Intercepts the load trigger                                                                 
            mergeMap(() =>
                this.todoService.getAllTodos().pipe(
                    map((todos) => TodoActions.loadTodosSuccess({ todos })), // Success! Dispatch success                                     
                    catchError((error) => of(TodoActions.loadTodosFailure({ error: error.message }))) // Failure! Dispatch error              
                )
            )
        )
    );

    // 2. Effect: Listen for 'Create Todo', POST it to API, and dispatch result                                                       
    createTodo$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TodoActions.createTodo),
            mergeMap((action) =>
                this.todoService.createTodo({
                    title: action.title,
                    description: action.description,
                    status: action.status,
                    priority: action.priority,
                    deadline: action.deadline,
                    startDate: action.startDate
                }).pipe(
                    map(() => TodoActions.createTodoSuccess()), // Success!                                                                   
                    catchError((error) => of(TodoActions.createTodoFailure({ error: error.message }))) // Failure!                            
                )
            )
        )
    );

    // 2b. Auto-Reload: When a task is successfully created, automatically trigger 'Load Todos' to update the UI                      
    reloadAfterCreate$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TodoActions.createTodoSuccess),
            map(() => TodoActions.loadTodos())
        )
    );

    // 3. Effect: Listen for 'Delete Todo', DELETE it from API, and dispatch result                                                   
    deleteTodo$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TodoActions.deleteTodo),
            mergeMap((action) =>
                this.todoService.deleteTodo(action.id).pipe(
                    map(() => TodoActions.deleteTodoSuccess()), // Success!                                                                   
                    catchError((error) => of(TodoActions.deleteTodoFailure({ error: error.message }))) // Failure!                            
                )
            )
        )
    );

    // When a task is successfully deleted, automatically trigger 'Load Todos' to update the UI
    reloadAfterDelete$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TodoActions.deleteTodoSuccess),
            map(() => TodoActions.loadTodos())
        )
    );


    updateTodo$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TodoActions.updateTodo),
            mergeMap((action) =>
                this.todoService.updateTodo(action.id, {
                    title: action.title,
                    description: action.description,
                    status: action.status,
                    priority: action.priority,
                    deadline: action.deadline,
                    startDate: action.startDate
                }).pipe(
                    map(() => TodoActions.updateTodoSuccess()),
                    catchError((error) => of(TodoActions.updateTodoFailure({ error: error.message })))
                )
            )
        )
    );

    // 4b. Auto-Reload after a successful update
    reloadAfterUpdate$ = createEffect(() =>
        this.actions$.pipe(
            ofType(TodoActions.updateTodoSuccess),
            map(() => TodoActions.loadTodos())
        )
    );
}   