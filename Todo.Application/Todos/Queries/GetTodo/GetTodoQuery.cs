using MediatR;
using Todo.Domain.Entities;

namespace Todo.Application.Todos.Queries.GetTodos;

public record GetTodosQuery() : IRequest<IReadOnlyList<TodoItem>>;
