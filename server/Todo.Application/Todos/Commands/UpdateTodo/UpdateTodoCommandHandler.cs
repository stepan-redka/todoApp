using MediatR;
using Todo.Domain.Repositories;

namespace Todo.Application.Todos.Commands.UpdateTodo;

public class UpdateTodoCommandHandler : IRequestHandler<UpdateTodoCommand>
{
    private readonly ITodoRepository _todoRepository;

    public UpdateTodoCommandHandler(ITodoRepository todoRepository)
    {
        _todoRepository = todoRepository;
    }

    public async Task Handle(UpdateTodoCommand request, CancellationToken cancellationToken)
    {
        var todo = await _todoRepository.GetByIdAsync(request.Id, request.UserId, cancellationToken);
        
        if (todo == null)
        {
            throw new KeyNotFoundException($"Todo with ID {request.Id} was not found.");
        }

        todo.Title = request.Title;
        todo.Description = request.Description;
        todo.Status = request.Status;
        todo.Priority = request.Priority;
        todo.Deadline = request.Deadline;
        todo.StartDate = request.StartDate;
        todo.UpdatedAt = DateTime.UtcNow;

        await _todoRepository.UpdateAsync(todo, cancellationToken);
    }
}