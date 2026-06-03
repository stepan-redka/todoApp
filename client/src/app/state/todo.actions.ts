import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { TodoItem, TodoStatus, TodoPriority } from '../core/models/todo.model';

// define all actions related to Todos in one grouped group                                                                  
export const TodoActions = createActionGroup({
    source: 'Todo API',
    events: {
        'Load Todos': emptyProps(),
        'Load Todos Success': props<{ todos: TodoItem[] }>(),
        'Load Todos Failure': props<{ error: string }>(),

        'Create Todo': props<{ title: string; description?: string; priority: number; deadline?: string }>(),
        'Create Todo Success': emptyProps(),
        'Create Todo Failure': props<{ error: string }>(),

        'Delete Todo': props<{ id: string }>(),
        'Delete Todo Success': emptyProps(),
        'Delete Todo Failure': props<{ error: string }>(),

        'Update Todo': props<{
            id: string; title: string; description?: string; status: TodoStatus; priority: TodoPriority; deadline?:
            string
        }>(),
        'Update Todo Success': emptyProps(),
        'Update Todo Failure': props<{ error: string }>(),
    }
});                                         