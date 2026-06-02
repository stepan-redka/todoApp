using System.Text.Json;                                                                                                                                                      
    using FluentValidation;                                                                                                                                                      
                                                                                                                                                                                 
    namespace Todo.Api.Middleware;                                                                                                                                               
                                                                                                                                                                                 
    public class ExceptionHandlingMiddleware                                                                                                                                     
    {                                                                                                                                                                            
        private readonly RequestDelegate _next;                                                                                                                                  
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;                                                                                                           
                                                                                                                                                                                 
        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)                                                                    
        {                                                                                                                                                                        
            _next = next;                                                                                                                                                        
            _logger = logger;                                                                                                                                                    
        }                                                                                                                                                                        
                                                                                                                                                                                 
        public async Task InvokeAsync(HttpContext context)                                                                                                                       
        {                                                                                                                                                                        
            try                                                                                                                                                                  
            {                                                                                                                                                                    
                // Pass the request down the pipeline (to controllers and MediatR)                                                                                               
                await _next(context);                                                                                                                                            
            }                                                                                                                                                                    
            catch (Exception ex)                                                                                                                                                 
            {                                                                                                                                                                    
                // If ANY exception is thrown, catch it here and log it                                                                                                          
                _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);                                                                                  
                await HandleExceptionAsync(context, ex);                                                                                                                         
            }                                                                                                                                                                    
        }                                                                                                                                                                        
                                                                                                                                                                                 
        private static async Task HandleExceptionAsync(HttpContext context, Exception exception)                                                                                 
        {                                                                                                                                                                        
            context.Response.ContentType = "application/json";                                                                                                                   
                                                                                                                                                                                 
            // If the exception was thrown by our FluentValidation bouncer                                                                                                       
            if (exception is ValidationException validationException)                                                                                                            
            {                                                                                                                                                                    
                context.Response.StatusCode = StatusCodes.Status400BadRequest;                                                                                                   
                                                                                                                                                                                 
                // Group the validation errors by the property name (e.g. "Title")                                                                                               
                var errors = validationException.Errors                                                                                                                          
                    .GroupBy(e => e.PropertyName)                                                                                                                                
                    .ToDictionary(                                                                                                                                               
                        g => g.Key,                                                                                                                                              
                        g => g.Select(e => e.ErrorMessage).ToArray()                                                                                                             
                    );                                                                                                                                                           
                                                                                                                                                                                 
                var response = new { errors };                                                                                                                                   
                await context.Response.WriteAsync(JsonSerializer.Serialize(response));                                                                                           
            }                                                                                                                                                                    
            else // For any other unexpected error (like database connection issues)                                                                                             
            {                                                                                                                                                                    
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;                                                                                          
                var response = new { error = "An unexpected error occurred on the server." };                                                                                    
                await context.Response.WriteAsync(JsonSerializer.Serialize(response));                                                                                           
            }                                                                                                                                                                    
        }                                                                                                                                                                        
    }                                         