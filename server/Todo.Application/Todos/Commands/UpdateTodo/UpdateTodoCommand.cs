using MediatR;
using Todo.Domain.Enums;

namespace Todo.Application.Todos.Commands.UpdateTodo;

public record UpdateTodoCommand(
    Guid Id,
    string Title,
    string? Description,
    TodoStatus Status,
    TodoPriority Priority,
    DateTime? Deadline,
    DateTime? StartDate = null,
    string UserId = ""
) : IRequest;