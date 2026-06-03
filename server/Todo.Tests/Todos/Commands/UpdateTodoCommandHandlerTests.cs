using Moq;
using Xunit;
using Todo.Application.Todos.Commands.UpdateTodo;
using Todo.Domain.Entities;
using Todo.Domain.Enums;
using Todo.Domain.Repositories;

namespace Todo.Tests.Todos.Commands;

public class UpdateTodoCommandHandlerTests
{
    [Fact]
    public async Task Handle_ShouldUpdateTodo_WhenUserIsOwner()
    {
        // Arrange
        var todoId = Guid.NewGuid();
        var userId = "user-123";
        var originalTodo = new TodoItem
        {
            Id = todoId,
            Title = "Original Title",
            Description = "Original Desc",
            Status = TodoStatus.Todo,
            Priority = TodoPriority.Low,
            UserId = userId
        };

        var mockRepository = new Mock<ITodoRepository>();
        mockRepository
            .Setup(repo => repo.GetByIdAsync(todoId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(originalTodo);

        var handler = new UpdateTodoCommandHandler(mockRepository.Object);
        var command = new UpdateTodoCommand(todoId, "New Title", "New Desc", TodoStatus.InProgress, TodoPriority.Medium, null, userId);

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        mockRepository.Verify(repo => repo.UpdateAsync(
            It.Is<TodoItem>(item => 
                item.Id == todoId && 
                item.Title == "New Title" && 
                item.Description == "New Desc" && 
                item.Status == TodoStatus.InProgress && 
                item.Priority == TodoPriority.Medium &&
                item.UserId == userId), 
            It.IsAny<CancellationToken>()), 
            Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldThrowKeyNotFoundException_WhenUserIsNotOwner()
    {
        // Arrange
        var todoId = Guid.NewGuid();
        var mockRepository = new Mock<ITodoRepository>();
        mockRepository
            .Setup(repo => repo.GetByIdAsync(todoId, "hacker-id", It.IsAny<CancellationToken>()))
            .ReturnsAsync((TodoItem?)null);

        var handler = new UpdateTodoCommandHandler(mockRepository.Object);
        var command = new UpdateTodoCommand(todoId, "Hacked Title", null, TodoStatus.Done, TodoPriority.High, null, "hacker-id");

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() => handler.Handle(command, CancellationToken.None));
        mockRepository.Verify(repo => repo.UpdateAsync(It.IsAny<TodoItem>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
