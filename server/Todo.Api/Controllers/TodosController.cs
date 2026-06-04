using MediatR;
using Microsoft.AspNetCore.Mvc;
using Todo.Application.Todos.Commands.CreateTodo;
using Todo.Application.Todos.Commands.UpdateTodo;
using Todo.Application.Todos.Commands.DeleteTodo;
using Todo.Application.Todos.Queries.GetTodos;
using Todo.Domain.Enums;

namespace Todo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TodosController : ControllerBase
{
    private readonly IMediator _mediator;
    private const string DefaultUserId = "default-user";

    public TodosController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetTodosQuery(DefaultUserId));
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTodoCommand command)
    {
        var commandWithUser = command with { UserId = DefaultUserId };
        
        var id = await _mediator.Send(commandWithUser);
        return Ok(id);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTodoInput input)
    {
        var command = new UpdateTodoCommand(id, input.Title, input.Description, input.Status, input.Priority, input.Deadline, input.StartDate, DefaultUserId);
        
        try
        {
            await _mediator.Send(command);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var command = new DeleteTodoCommand(id, DefaultUserId);
        
        try
        {
            await _mediator.Send(command);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    public record UpdateTodoInput(string Title, string? Description, TodoStatus Status, TodoPriority Priority, DateTime? Deadline, DateTime? StartDate = null);
}
