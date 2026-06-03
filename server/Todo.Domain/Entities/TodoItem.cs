using Todo.Domain.Enums;
namespace Todo.Domain.Entities;

public class TodoItem
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string?  Description { get; set; }
    public TodoStatus Status { get; set; }
    public TodoPriority Priority { get; set; }
    public DateTime? Deadline { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string UserId { get; set; } = string.Empty;
    
}