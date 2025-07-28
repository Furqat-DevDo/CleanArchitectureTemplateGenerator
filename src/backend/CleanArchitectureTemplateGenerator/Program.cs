using CleanArchitectureTemplateGenerator.Core.Services;
using CleanArchitectureTemplateGenerator.Services;
using CleanArchitectureTemplateGenerator.Hubs;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Clean Architecture Template Generator API",
        Version = "v1",
        Description = "API for generating Clean Architecture projects from metadata"
    });
});

// Add SignalR
builder.Services.AddSignalR();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Register services
builder.Services.AddScoped<IProjectGeneratorService, ProjectGeneratorService>();
builder.Services.AddScoped<IZipService, ZipService>();
builder.Services.AddSingleton<BackgroundGenerationService>();
builder.Services.AddHostedService<BackgroundGenerationService>(provider =>
    provider.GetRequiredService<BackgroundGenerationService>());

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Clean Architecture Generator API v1");
    c.RoutePrefix = string.Empty; // Serve Swagger UI at root
});

// Only use HTTPS redirection in production with proper configuration
if (app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
}
app.UseCors("AllowAngular");
app.UseAuthorization();
app.MapControllers();
app.MapHub<GenerationProgressHub>("/hub/generation-progress");

app.Run();