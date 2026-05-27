using Todo.Domain.Enums;
namespace Todo.Domain.Entities;

public class TodoItem
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string?  Description { get; set; }
    public TodoStatus Status { get; set; }
    public DateTime? Deadline { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
}