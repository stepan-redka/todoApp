using Moq;
using Xunit;
using Todo.Application.Todos.Commands.DeleteTodo;
using Todo.Domain.Entities;
using Todo.Domain.Repositories;

namespace Todo.Tests.Todos.Commands;

public class DeleteTodoCommandHandlerTests
{
    [Fact]
    public async Task Handle_ShouldDeleteTodo_WhenUserIsOwner()
    {
        // Arrange
        var todoId = Guid.NewGuid();
        var userId = "user-123";
        var mockTodo = new TodoItem { Id = todoId, Title = "Delete Me", UserId = userId };

        var mockRepository = new Mock<ITodoRepository>();
        mockRepository
            .Setup(repo => repo.GetByIdAsync(todoId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mockTodo);

        var handler = new DeleteTodoCommandHandler(mockRepository.Object);
        var command = new DeleteTodoCommand(todoId, userId);

        // Act
        await handler.Handle(command, CancellationToken.None);

        // Assert
        mockRepository.Verify(repo => repo.DeleteAsync(todoId, userId, It.IsAny<CancellationToken>()), Times.Once);
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

        var handler = new DeleteTodoCommandHandler(mockRepository.Object);
        var command = new DeleteTodoCommand(todoId, "hacker-id");

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() => handler.Handle(command, CancellationToken.None));
        mockRepository.Verify(repo => repo.DeleteAsync(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
