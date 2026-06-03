export enum TodoStatus {
    Todo = 0,
    InProgress = 1,
    Done = 2
}

export enum TodoPriority {
    Low = 0,
    Medium = 1,
    High = 2
}

export interface TodoItem {
    id: string; // Guid maps to string in TS                                                    
    title: string;
    description?: string; // Optional property (like string? in C#)                             
    status: TodoStatus;
    priority: TodoPriority;
    deadline?: string; // DateTime maps to ISO string or Date                                   
    createdAt: string;
    updatedAt?: string;
}                       