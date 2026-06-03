using MediatR;
using Todo.Domain.Entities;
using Todo.Domain.Repositories;

namespace Todo.Application.Todos.Queries.GetTodos;

public class GetTodoQueryHandler : IRequestHandler<GetTodosQuery, IReadOnlyList<TodoItem>>
{
    private readonly ITodoRepository _todoRepository;

    public GetTodoQueryHandler(ITodoRepository todoRepository)
    {
        _todoRepository = todoRepository;
    }

    public async Task<IReadOnlyList<TodoItem>> Handle(GetTodosQuery request, CancellationToken cancellationToken)
    {
        return await _todoRepository.GetAllAsync(request.UserId, cancellationToken);
    }
}