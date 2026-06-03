import { createReducer, on } from '@ngrx/store';
import { TodoItem } from '../todo.model';
import { TodoActions } from './todo.actions';

// 1. Define the shape of in-memory Todo Database                                                                               
export interface TodoState {
    todos: TodoItem[];
    loading: boolean;
    error: string | null;
}

// 2. Set the initial state when the app first loads                                                                                
export const initialState: TodoState = {
    todos: [],
    loading: false,
    error: null
};

// 3. Define how actions modify state                                                                                           
export const todoReducer = createReducer(
    initialState,

    on(TodoActions.loadTodos, (state) => ({
        ...state,
        loading: true,
        error: null
    })),
    on(TodoActions.loadTodosSuccess, (state, { todos }) => ({
        ...state,
        todos: todos,   // Store the fetched items                                                                                      
        loading: false
    })),
    on(TodoActions.loadTodosFailure, (state, { error }) => ({
        ...state,
        error: error,
        loading: false
    })),


    on(TodoActions.createTodo, (state) => ({
        ...state,
        loading: true
    })),
    on(TodoActions.createTodoSuccess, (state) => ({
        ...state,
        loading: false
    })),
    on(TodoActions.createTodoFailure, (state, { error }) => ({
        ...state,
        error: error,
        loading: false
    })),


    on(TodoActions.deleteTodo, (state) => ({
        ...state,
        loading: true
    })),
    on(TodoActions.deleteTodoSuccess, (state) => ({
        ...state,
        loading: false
    })),
    on(TodoActions.deleteTodoFailure, (state, { error }) => ({
        ...state,
        error: error,
        loading: false
    }))
);