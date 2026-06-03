using MediatR;

namespace Todo.Application.Todos.Commands.DeleteTodo;

public record DeleteTodoCommand(Guid Id, string UserId = "") : IRequest;