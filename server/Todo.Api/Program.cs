using MediatR;
using FluentValidation;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Todo.Infrastructure;
using Todo.Application.Common.Behaviours;
using Todo.Domain.Repositories;
using Todo.Infrastructure.Data;
using Todo.Application.Todos.Commands.CreateTodo;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register DB connection & repo
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

// Add Authorization & Identity Endpoints
builder.Services.AddAuthorization();
builder.Services.AddIdentityApiEndpoints<IdentityUser>()
    .AddEntityFrameworkStores<AppDbContext>();

builder.Services.AddSingleton(new DbInitializer(connectionString));
builder.Services.AddScoped<ITodoRepository>(sp => new TodoRepository(connectionString));

// Register MediatR and add custom Validation Behavior to its pipeline
builder.Services.AddValidatorsFromAssembly(typeof(CreateTodoCommand).Assembly);

builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(CreateTodoCommand).Assembly);
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehaviour<,>));
});

// Configure CORS to allow local Angular client to connect
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularClient", policy =>
    policy.WithOrigins("http://localhost:4200")
    .AllowAnyMethod()
    .AllowAnyHeader());
});

var app = builder.Build();



app.UseCors("AllowAngularClient");

// Register custom global exception handling middleware at the very start of the HTTP pipeline
app.UseMiddleware<Todo.Api.Middleware.ExceptionHandlingMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

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
app.MapIdentityApi<IdentityUser>();

// Map Controller Routes automatically based on [Route] attributes
app.MapControllers();

app.Run();