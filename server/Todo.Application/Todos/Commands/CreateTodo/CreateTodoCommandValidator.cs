using FluentValidation;

namespace Todo.Application.Todos.Commands.CreateTodo;

public class CreateTodoCommandValidator : AbstractValidator<CreateTodoCommand>
{
    public CreateTodoCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(100).WithMessage("Title must not exceed 100 characters");
        
        RuleFor(x => x.Description)
            .MaximumLength(700).WithMessage("Description must not exceed 700 characters");
        
        RuleFor(x => x.Priority)
            .IsInEnum().WithMessage("Priority must be one of the following: Low, Medium, High");
        
        RuleFor(x => x.Deadline)
            .GreaterThanOrEqualTo(DateTime.UtcNow.Date.AddDays(-1))
            .When(x => x.Deadline.HasValue)
            .WithMessage("Deadline must be today or a future date");
    }
}