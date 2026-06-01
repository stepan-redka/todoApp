using Dapper;
using Microsoft.Data.SqlClient;
using Todo.Domain.Entities;
using Todo.Domain.Repositories;

namespace Todo.Infrastructure;

public class TodoRepository : ITodoRepository
{
    private readonly string _connectionString;

    public TodoRepository(string connectionString)
    {
        _connectionString = connectionString;
    }

    private SqlConnection GetConnection() => new SqlConnection(_connectionString);

    public async Task<TodoItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        using var connection = GetConnection();
        const string sql = "SELECT * FROM Todos WHERE Id = @Id";
        return await connection.QueryFirstOrDefaultAsync<TodoItem>(sql, new { Id = id });
    }

    public async Task<IReadOnlyList<TodoItem>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        using var connection = GetConnection();
        const string sql = "SELECT * FROM Todos";
        var result = await connection.QueryAsync<TodoItem>(sql);
        return result.ToList().AsReadOnly();
    }

    public async Task AddAsync(TodoItem item, CancellationToken cancellationToken = default)
    {
        using var connection = GetConnection();
        const string sql = @"
            INSERT INTO Todos (Id, Title, Description, Status, Priority, Deadline, CreatedAt, UpdatedAt)
            VALUES (@Id, @Title, @Description, @Status, @Priority, @Deadline, @CreatedAt, @UpdatedAt)";
        await connection.ExecuteAsync(sql, item);
    }

    public async Task UpdateAsync(TodoItem item, CancellationToken cancellationToken = default)
    {
        using var connection = GetConnection();
        const string sql = @"
            UPDATE Todos
            SET Title = @Title,
                Description = @Description,
                Status = @Status,
                Priority = @Priority,
                Deadline = @Deadline,
                UpdatedAt = @UpdatedAt
            WHERE Id = @Id";
        await connection.ExecuteAsync(sql, item);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        using var connection = GetConnection();
        const string sql = "DELETE FROM Todos WHERE Id = @Id";
        await connection.ExecuteAsync(sql, new { Id = id });
    }
}