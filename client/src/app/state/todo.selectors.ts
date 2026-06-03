import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TodoState } from './todo.reducer';

// 1. Grab the entire Todo database slice from the global Redux store                                                               
// The label 'todo' must match the key we use when registering the reducer in Program.cs/AppConfig.                                 
export const selectTodoState = createFeatureSelector<TodoState>('todo');

// 2. Query only the 'todos' array                                                                                                  
export const selectAllTodos = createSelector(
    selectTodoState,
    (state) => state.todos
);

// 3. Query only the 'loading' status (useful to show/hide loading spinners in the UI)                                              
export const selectTodoLoading = createSelector(
    selectTodoState,
    (state) => state.loading
);

// 4. Query only the 'error' message (useful to display validation errors)
export const selectTodoError = createSelector(
    selectTodoState,
    (state) => state.error
);