import { Component, OnInit, Signal, inject, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { selectAllTodos } from '../../state/todo.selectors';
import { TodoActions } from '../../state/todo.actions';
import { TodoItem, TodoStatus, TodoPriority } from '../../core/models/todo.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-dashboard',
    imports: [FormsModule, DatePipe],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
    protected readonly todos: Signal<TodoItem[]>;

    protected readonly priorityFilter = signal<TodoPriority | null>(null);
    protected readonly showOnlyOverdue = signal<boolean>(false);
    protected readonly searchQuery = signal<string>('');

    protected isToday(date: Date): boolean {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    }

    private isTodoOverdue(todo: TodoItem): boolean {
        if (todo.status === TodoStatus.Done) return false;
        if (!todo.deadline) return false;
        const deadlineDate = new Date(todo.deadline);
        deadlineDate.setHours(23, 59, 59, 999);
        return deadlineDate.getTime() < new Date().getTime();
    }


    protected readonly filteredTodos = computed(() => {
        const all = this.todos();
        const pFilter = this.priorityFilter();
        const overdueOnly = this.showOnlyOverdue();
        const search = this.searchQuery().toLowerCase().trim();

        return all.filter(todo => {
            if (pFilter !== null && todo.priority !== pFilter) return false;
            if (overdueOnly && !this.isTodoOverdue(todo)) return false;
            if (search && !todo.title.toLowerCase().includes(search) && !(todo.description && todo.description.toLowerCase().includes(search))) return false;
            return true;
        });
    });

    // Computed signals to automatically filter tasks by column status
    protected readonly todoTasks = computed(() =>
        this.filteredTodos().filter(t => t.status === TodoStatus.Todo)
    );
    protected readonly inProgressTasks = computed(() =>
        this.filteredTodos().filter(t => t.status === TodoStatus.InProgress)
    );
    protected readonly doneTasks = computed(() =>
        this.filteredTodos().filter(t => t.status === TodoStatus.Done)
    );

    protected readonly timelineStartOffset = signal(0);
    protected readonly timelineZoom = signal<number>(7);

    protected readonly timelineDays = computed(() => {
        const days = [];
        const baseDate = new Date();
        baseDate.setDate(baseDate.getDate() + this.timelineStartOffset());
        baseDate.setHours(0, 0, 0, 0);

        for (let i = 0; i < this.timelineZoom(); i++) {
            const d = new Date(baseDate);
            d.setDate(baseDate.getDate() + i);
            days.push(d);
        }
        return days;
    });

    protected readonly timelineRangeLabel = computed(() => {
        const days = this.timelineDays();
        if (days.length === 0) return '';
        const start = days[0];
        const end = days[days.length - 1];

        const opt: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
        return `${start.toLocaleDateString('en-US', opt)} – ${end.toLocaleDateString('en-US', opt)}`;
    });

    protected readonly ganttTasks = computed(() => {
        const days = this.timelineDays();
        if (days.length === 0) return [];

        const startOfTimeline = days[0];
        const endOfTimeline = days[days.length - 1];

        const tStartLimit = new Date(startOfTimeline).setHours(0, 0, 0, 0);
        const tEndLimit = new Date(endOfTimeline).setHours(23, 59, 59, 999);

        return this.filteredTodos()
            .filter(todo => todo.startDate || todo.deadline)
            .map(todo => {
                const rawStart = todo.startDate ? new Date(todo.startDate) : (todo.createdAt ? new Date(todo.createdAt) : new Date());
                const taskStart = new Date(rawStart);
                taskStart.setHours(0, 0, 0, 0);

                const rawEnd = todo.deadline ? new Date(todo.deadline) : new Date(taskStart);
                const taskEnd = new Date(rawEnd);
                taskEnd.setHours(0, 0, 0, 0);

                if (taskStart > taskEnd) {
                    const temp = new Date(taskStart);
                    taskStart.setTime(taskEnd.getTime());
                    taskEnd.setTime(temp.getTime());
                }

                const sTime = taskStart.getTime();
                const eTime = taskEnd.getTime();

                if (eTime < tStartLimit || sTime > tEndLimit) {
                    return null;
                }

                const oneDayMs = 24 * 60 * 60 * 1000;

                let colStart = Math.floor((sTime - tStartLimit) / oneDayMs) + 1;
                let colEnd = Math.floor((eTime - tStartLimit) / oneDayMs) + 2;

                const maxCols = days.length + 1;
                if (colStart < 1) colStart = 1;
                if (colEnd > maxCols) colEnd = maxCols;
                if (colEnd <= colStart) colEnd = colStart + 1;

                return {
                    todo,
                    colStart,
                    colSpan: colEnd - colStart,
                    statusClass: todo.status === TodoStatus.Todo ? 'status-todo' :
                        todo.status === TodoStatus.InProgress ? 'status-inprogress' : 'status-done',
                    priorityLabel: this.getPriorityLabel(todo.priority)
                };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);
    });

    protected navigateTimeline(direction: number): void {
        const offsetAmount = direction * this.timelineZoom();
        this.timelineStartOffset.update(offset => offset + offsetAmount);
    }

    protected resetTimeline(): void {
        this.timelineStartOffset.set(0);
    }

    protected setZoom(days: number): void {
        this.timelineZoom.set(days);
    }

    protected setPriorityFilter(priority: number | null): void {
        this.priorityFilter.set(priority === null ? null : priority as TodoPriority);
    }

    protected toggleOverdueFilter(): void {
        this.showOnlyOverdue.update(val => !val);
    }

    // Theme Control
    protected isLightMode = false;

    // Modal Control State
    protected showCreateModal = false;
    protected modalStatus = TodoStatus.Todo;
    protected editingTodoId: string | null = null;

    // Task Form Fields
    protected newTitle = '';
    protected newDescription = '';
    protected newPriority = TodoPriority.Medium;
    protected newStartDate = '';
    protected newDeadline = '';
    protected errorMessage = '';

    private readonly store = inject(Store);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    constructor() {
        this.todos = this.store.selectSignal(selectAllTodos);
    }

    ngOnInit(): void {
        this.store.dispatch(TodoActions.loadTodos());
        // Load initial theme from localStorage
        this.isLightMode = localStorage.getItem('theme') === 'light';
        if (this.isLightMode) {
            document.documentElement.classList.add('light-theme');
        } else {
            document.documentElement.classList.remove('light-theme');
        }
    }

    protected get todayDateString(): string {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    protected toggleTheme(): void {
        this.isLightMode = !this.isLightMode;
        if (this.isLightMode) {
            document.documentElement.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.remove('light-theme');
            localStorage.setItem('theme', 'dark');
        }
    }

    protected onLogout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    // Modal Actions
    protected openCreateModal(status: number): void {
        this.editingTodoId = null;
        this.modalStatus = status as TodoStatus;
        this.showCreateModal = true;

        // Reset fields
        this.newTitle = '';
        this.newDescription = '';
        this.newPriority = TodoPriority.Medium;
        this.newDeadline = '';
        this.errorMessage = '';

        // Default start date to today
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        this.newStartDate = `${year}-${month}-${day}`;
    }

    protected openEditModal(todo: TodoItem): void {
        this.editingTodoId = todo.id;
        this.modalStatus = todo.status;
        this.showCreateModal = true;

        this.newTitle = todo.title;
        this.newDescription = todo.description || '';
        this.newPriority = todo.priority;
        this.newStartDate = todo.startDate ? todo.startDate.split('T')[0] : '';
        this.newDeadline = todo.deadline ? todo.deadline.split('T')[0] : '';
        this.errorMessage = '';
    }

    protected closeCreateModal(): void {
        this.showCreateModal = false;
        this.editingTodoId = null;
    }

    protected onFormSubmit(): void {
        if (!this.newTitle.trim()) {
            this.errorMessage = 'Title is required.';
            return;
        }

        if (this.newTitle.length > 100) {
            this.errorMessage = 'Title must not exceed 100 characters.';
            return; // Stops execution and prevents the modal from closing!
        }

        // 2. Description length limit
        if (this.newDescription && this.newDescription.length > 700) {
            this.errorMessage = 'Description must not exceed 700 characters.';
            return;
        }

        // 3. Deadline date verification (must be today or in the future)                             
        if (this.newDeadline) {
            const deadlineDate = new Date(this.newDeadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (deadlineDate < today) {
                this.errorMessage = 'Deadline must be today or a future date.';
                return;
            }
        }

        if (this.editingTodoId) {
            this.store.dispatch(TodoActions.updateTodo({
                id: this.editingTodoId,
                title: this.newTitle,
                description: this.newDescription || undefined,
                status: this.modalStatus,
                priority: Number(this.newPriority),
                deadline: this.newDeadline || undefined,
                startDate: this.newStartDate || undefined
            }));
        } else {
            this.store.dispatch(TodoActions.createTodo({
                title: this.newTitle,
                description: this.newDescription || undefined,
                status: this.modalStatus,
                priority: Number(this.newPriority),
                deadline: this.newDeadline || undefined,
                startDate: this.newStartDate || undefined
            }));
        }

        this.closeCreateModal();
    }

    // Task Manipulations
    protected onDelete(id: string): void {
        this.store.dispatch(TodoActions.deleteTodo({ id }));
    }

    protected onStatusChange(todo: TodoItem, newStatus: number): void {
        this.store.dispatch(TodoActions.updateTodo({
            id: todo.id,
            title: todo.title,
            description: todo.description,
            status: newStatus as TodoStatus,
            priority: todo.priority,
            deadline: todo.deadline,
            startDate: todo.startDate
        }));
    }

    // UI Formatting Helpers
    protected getPriorityLabel(priority: TodoPriority): string {
        switch (priority) {
            case TodoPriority.Low: return 'Low';
            case TodoPriority.Medium: return 'Medium';
            case TodoPriority.High: return 'High';
            default: return 'Medium';
        }
    }

    protected getPriorityClass(priority: TodoPriority): string {
        switch (priority) {
            case TodoPriority.Low: return 'priority-low';
            case TodoPriority.Medium: return 'priority-medium';
            case TodoPriority.High: return 'priority-high';
            default: return 'priority-medium';
        }
    }
}