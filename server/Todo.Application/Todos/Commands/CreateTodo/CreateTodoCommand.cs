using MediatR;
using Todo.Domain.Enums;

namespace Todo.Application.Todos.Commands.CreateTodo;

public record CreateTodoCommand(
    string Title,
    string? Description,
    TodoStatus Status,
    TodoPriority Priority,
    DateTime? Deadline,
    DateTime? StartDate = null,
    string UserId = ""
) : IRequest<Guid>;