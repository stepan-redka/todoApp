using MediatR;
using FluentValidation;
using Todo.Application.Common.Behaviours;
using Todo.Domain.Repositories;
using Todo.Infrastructure;
using Todo.Infrastructure.Data;
using Todo.Application.Todos.Commands.CreateTodo;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// Register Swagger OpenAPI support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Fetch the SQL Connection String
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

// Register our Database Seeder and concrete Repository
builder.Services.AddSingleton(new DbInitializer(connectionString));
builder.Services.AddScoped<ITodoRepository>(sp => new TodoRepository(connectionString));

// Register MediatR
builder.Services.AddValidatorsFromAssembly(typeof(CreateTodoCommand).Assembly);                                                                                              
                                                                                                                                                                                 
// 2. Register MediatR and add our custom Validation Behavior to its pipeline                                                                                                
builder.Services.AddMediatR(cfg =>                                                                                                                                           
{                                                                                                                                                                            
    cfg.RegisterServicesFromAssembly(typeof(CreateTodoCommand).Assembly);                                                                                                    
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehaviour<,>));                                                                                            
});                
var app = builder.Build();

// Register custom global exception handling middleware at the very start of the HTTP pipeline                                                                           
app.UseMiddleware<Todo.Api.Middleware.ExceptionHandlingMiddleware>();                                                                                                        
                                                                                                                                                                                 
// Run Database Initializer on boot                                                                                                                                          
using (var scope = app.Services.CreateScope())                                                                                                                               
{                                                                                                                                                                            
    var dbInitializer = scope.ServiceProvider.GetRequiredService<DbInitializer>();                                                                                           
    dbInitializer.Initialize();                                                                                                                                              
}               

// Run Database Initializer on boot
using (var scope = app.Services.CreateScope())
{
    var dbInitializer = scope.ServiceProvider.GetRequiredService<DbInitializer>();
    dbInitializer.Initialize();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Map Controller Routes automatically based on [Route] attributes
app.MapControllers();

app.Run();