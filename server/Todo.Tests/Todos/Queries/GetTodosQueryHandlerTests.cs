using Moq;
using Xunit;
using Todo.Application.Todos.Queries.GetTodos;
using Todo.Domain.Entities;
using Todo.Domain.Repositories;

namespace Todo.Tests.Todos.Queries;

public class GetTodosQueryHandlerTests
{
    [Fact]
    public async Task Handle_ShouldReturnUserSpecificTodos_WhenTodosExist()
    {
        // Arrange
        var userId = "user-abc";
        var mockTodos = new List<TodoItem>
        {
            new TodoItem { Id = Guid.NewGuid(), Title = "Task 1", UserId = userId },
            new TodoItem { Id = Guid.NewGuid(), Title = "Task 2", UserId = userId }
        };

        var mockRepository = new Mock<ITodoRepository>();
        mockRepository
            .Setup(repo => repo.GetAllAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(mockTodos);

        var handler = new GetTodoQueryHandler(mockRepository.Object);
        var query = new GetTodosQuery(userId);

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
        Assert.All(result, item => Assert.Equal(userId, item.UserId));
        mockRepository.Verify(repo => repo.GetAllAsync(userId, It.IsAny<CancellationToken>()), Times.Once);
    }
}
