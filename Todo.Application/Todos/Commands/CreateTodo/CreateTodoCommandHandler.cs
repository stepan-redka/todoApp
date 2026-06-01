using MediatR;
using Todo.Domain.Repositories;
using Todo.Domain.Entities;
using Todo.Domain.Enums;

namespace Todo.Application.Todos.Commands.CreateTodo;

public class CreateTodoCommandHandler : IRequestHandler<CreateTodoCommand, Guid>                                                                                             
    {                                                                                                                                                                            
        private readonly ITodoRepository _todoRepository;                                                                                                                        
                                                                                                                                                                                  
        public CreateTodoCommandHandler(ITodoRepository todoRepository)                                                                                                          
        {                             
            _todoRepository = todoRepository;                                                                                                                                    
        }                                                                                                                                                                        
                                                                                                                                                                                  
        public async Task<Guid> Handle(CreateTodoCommand request, CancellationToken cancellationToken)                                                                           
        {                                                                                                                                                                        
            // 1. Instantiate the Domain Entity                                                                                                                                  
            var todoItem = new TodoItem                                                                                                                                          
            {                                                                                                                                                                    
                Id = Guid.NewGuid(),                                                                                                                                             
                Title = request.Title,                                                                                                                                           
                Description = request.Description,                                                                                                                               
                Status = TodoStatus.Todo, // New items start as 'Todo'                                                                                              
                Priority = request.Priority,
                CreatedAt = DateTime.UtcNow,                                                                                                                                     
                Deadline = request.Deadline                                                                                                                                      
            };                                                                                                                                                                   
                                                                                                                                                                                 
            // 2. Persist to DB using the Repository contract                                                                                                                    
            await _todoRepository.AddAsync(todoItem, cancellationToken);                                                                                                         
                                                                                                                                                                                 
            // 3. Return the generated ID                                                                                                                                        
            return todoItem.Id;                                                                                                                                                  
        }                                                                                                                                                                        
    }                                                             