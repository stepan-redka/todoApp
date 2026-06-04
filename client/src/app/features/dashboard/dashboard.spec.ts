import { TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TodoItem, TodoStatus, TodoPriority } from '../../core/models/todo.model';
import { selectAllTodos } from '../../state/todo.selectors';
import { vi, describe, beforeEach, it, expect } from 'vitest';

describe('Dashboard Component', () => {
    let component: Dashboard;
    let store: MockStore;
    
    // Sample mockup todos
    const mockTodos: TodoItem[] = [
        {
            id: '1',
            title: 'Task A',
            description: 'Fix the search bug',
            status: TodoStatus.Todo,
            priority: TodoPriority.High,
            createdAt: '2026-06-01T10:00:00Z',
            startDate: '2026-06-01T00:00:00Z',
            deadline: '2026-06-10T00:00:00Z'
        },
        {
            id: '2',
            title: 'Task B',
            description: 'Refactor styles',
            status: TodoStatus.InProgress,
            priority: TodoPriority.Medium,
            createdAt: '2026-06-01T10:00:00Z',
            startDate: '2026-06-02T00:00:00Z',
            deadline: '2026-06-03T00:00:00Z' // Past deadline (Overdue)
        },
        {
            id: '3',
            title: 'Task C',
            description: 'Deploy app',
            status: TodoStatus.Done,
            priority: TodoPriority.Low,
            createdAt: '2026-06-01T10:00:00Z'
        }
    ];

    const mockRouter = {
        navigate: vi.fn()
    };

    const mockAuthService = {
        logout: vi.fn()
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Dashboard],
            providers: [
                provideMockStore(),
                { provide: Router, useValue: mockRouter },
                { provide: AuthService, useValue: mockAuthService }
            ]
        }).compileComponents();

        store = TestBed.inject(MockStore);
        // Mock the selector selectAllTodos to return our mock list of todos
        store.overrideSelector(selectAllTodos, mockTodos);
        
        const fixture = TestBed.createComponent(Dashboard);
        component = fixture.componentInstance;
        // Trigger ngOnInit to load signals
        fixture.detectChanges();
    });

    it('should compile successfully', () => {
        expect(component).toBeTruthy();
    });

    it('should split tasks into correct status columns', () => {
        const todoTasks = component['todoTasks']();
        const inProgressTasks = component['inProgressTasks']();
        const doneTasks = component['doneTasks']();

        expect(todoTasks.length).toBe(1);
        expect(todoTasks[0].title).toBe('Task A');

        expect(inProgressTasks.length).toBe(1);
        expect(inProgressTasks[0].title).toBe('Task B');

        expect(doneTasks.length).toBe(1);
        expect(doneTasks[0].title).toBe('Task C');
    });

    it('should filter tasks by Priority search selector', () => {
        // Set Priority filter to High (2)
        component['priorityFilter'].set(TodoPriority.High);
        
        const filtered = component['filteredTodos']();
        expect(filtered.length).toBe(1);
        expect(filtered[0].title).toBe('Task A');
    });

    it('should filter tasks dynamically by search text query', () => {
        // Search for 'refactor'
        component['searchQuery'].set('refactor');

        const filtered = component['filteredTodos']();
        expect(filtered.length).toBe(1);
        expect(filtered[0].title).toBe('Task B');
    });

    it('should identify overdue tasks properly', () => {
        // Task B is InProgress and has deadline of June 3rd (which is in the past)
        // Task A is Todo and has deadline of June 10 (future)
        // Task C is Done (cannot be overdue)
        component['showOnlyOverdue'].set(true);

        const filtered = component['filteredTodos']();
        expect(filtered.length).toBe(1);
        expect(filtered[0].title).toBe('Task B');
    });

    it('should fail client-side form validation if title exceeds 100 characters', () => {
        component['editingTodoId'] = null;
        component['newTitle'] = 'a'.repeat(101); // Exceeds 100 character constraint
        component['newDescription'] = 'Notes';
        component['newDeadline'] = '';

        component['onFormSubmit']();

        expect(component['errorMessage']).toBe('Title must not exceed 100 characters.');
    });

    it('should fail client-side validation if description exceeds 700 characters', () => {
        component['editingTodoId'] = null;
        component['newTitle'] = 'Clean Code';
        component['newDescription'] = 'b'.repeat(701); // Exceeds 700 character constraint
        component['newDeadline'] = '';

        component['onFormSubmit']();

        expect(component['errorMessage']).toBe('Description must not exceed 700 characters.');
    });

    it('should fail client-side validation if deadline is set to a past date', () => {
        component['editingTodoId'] = null;
        component['newTitle'] = 'Clean Code';
        component['newDescription'] = 'Notes';
        
        // Setting deadline to yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yString = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
        component['newDeadline'] = yString;

        component['onFormSubmit']();

        expect(component['errorMessage']).toBe('Deadline must be today or a future date.');
    });

    it('should successfully dispatch Create Todo on form submit if all fields are valid', () => {
        const spyDispatch = vi.spyOn(store, 'dispatch');

        component['editingTodoId'] = null;
        component['newTitle'] = 'Valid Task';
        component['newDescription'] = 'Valid notes';
        component['newDeadline'] = '';

        component['onFormSubmit']();

        // Expect no error message
        expect(component['errorMessage']).toBe('');
        // Expect NgRx action to be dispatched
        expect(spyDispatch).toHaveBeenCalled();
    });
});
