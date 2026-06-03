using MediatR;
using Todo.Domain.Entities;

namespace Todo.Application.Todos.Commands.DeleteTodo;

public record DeleteTodoCommand(Guid Id) : IRequest;