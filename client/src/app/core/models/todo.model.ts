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
  id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: TodoPriority;
  deadline?: string;
  createdAt: string;
  updatedAt?: string;
}
