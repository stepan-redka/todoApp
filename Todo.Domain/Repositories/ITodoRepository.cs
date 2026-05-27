using Todo.Domain.Entities;
namespace Todo.Domain.Repositories;

public interface ITodoRepository                                                                                                                                             
{                                                                                                                                                                            
    Task<TodoItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);                                                                                    
    Task<IReadOnlyList<TodoItem>> GetAllAsync(CancellationToken cancellationToken = default);                                                                                
    Task AddAsync(TodoItem item, CancellationToken cancellationToken = default);                                                                                             
    Task UpdateAsync(TodoItem item, CancellationToken cancellationToken = default);                                                                                          
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);                                                                                                
}         