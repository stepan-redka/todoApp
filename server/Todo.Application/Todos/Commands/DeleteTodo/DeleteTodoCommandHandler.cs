using MediatR;
using Todo.Domain.Repositories;

namespace Todo.Application.Todos.Commands.DeleteTodo;

public class DeleteTodoCommandHandler : IRequestHandler<DeleteTodoCommand>
{
    private readonly ITodoRepository _todoRepository;

    public DeleteTodoCommandHandler(ITodoRepository todoRepository)
    {
        _todoRepository = todoRepository;
    }

    public async Task Handle(DeleteTodoCommand request, CancellationToken cancellationToken)
    {
        var todo = await _todoRepository.GetByIdAsync(request.Id, request.UserId, cancellationToken);
        
        if (todo == null)
        {
            throw new KeyNotFoundException($"Todo with ID {request.Id} was not found.");
        }

        await _todoRepository.DeleteAsync(request.Id, request.UserId, cancellationToken);
    }
}