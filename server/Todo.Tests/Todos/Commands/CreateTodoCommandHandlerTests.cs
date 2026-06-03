using Moq;
using Xunit;
using Todo.Application.Todos.Commands.CreateTodo;
using Todo.Domain.Entities;
using Todo.Domain.Enums;
using Todo.Domain.Repositories;

namespace Todo.Tests.Todos.Commands;

public class CreateTodoCommandHandlerTests
{
    [Fact]
    public async Task Handle_ShouldCreateTodoAndReturnGuid_WhenRequestIsValid()
    {
        // Arrange
        var mockRepository = new Mock<ITodoRepository>();
        var handler = new CreateTodoCommandHandler(mockRepository.Object);
        var command = new CreateTodoCommand("Scaffold testing", "Unit tests with Moq", TodoStatus.Todo, TodoPriority.High, null, "user-123");

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.NotEqual(Guid.Empty, result);
        mockRepository.Verify(repo => repo.AddAsync(
            It.Is<TodoItem>(item => 
                item.Title == "Scaffold testing" && 
                item.Description == "Unit tests with Moq" && 
                item.Priority == TodoPriority.High && 
                item.UserId == "user-123" && 
                item.Status == TodoStatus.Todo &&
                item.Id == result), 
            It.IsAny<CancellationToken>()), 
            Times.Once);
    }
}
