using MediatR;
using FluentValidation;
using Todo.Infrastructure;
using Todo.Application.Common.Behaviours;
using Todo.Domain.Repositories;
using Todo.Infrastructure.Data;
using Todo.Application.Todos.Commands.CreateTodo;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft", Serilog.Events.LogEventLevel.Warning)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/todo-log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register DB connection & repo
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

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

app.UseSerilogRequestLogging();

// Register custom global exception handling middleware at the very start of the HTTP pipeline
app.UseMiddleware<Todo.Api.Middleware.ExceptionHandlingMiddleware>();

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

try
{
    Log.Information("Starting web application");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}