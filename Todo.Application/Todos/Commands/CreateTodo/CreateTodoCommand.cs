using MediatR;

namespace Todo.Application.Todos.Commands.CreateTodo;

// 'IRequest<Guid>' tells MediatR: "When you execute this command, you will get back a Guid (the ID of the new item)."
public record CreateTodoCommand(
    string Title,
    string? Description,
    DateTime? Deadline
    ) : IRequest<Guid>;