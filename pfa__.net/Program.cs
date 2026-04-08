using Microsoft.EntityFrameworkCore;
using pfa__.net.Data;
using pfa__.net.Helpers;
using pfa__.net.Repositories;
using pfa__.net.Services;
using pfa__.net.Jobs;
using Hangfire;
using Hangfire.InMemory;

var builder = WebApplication.CreateBuilder(args);

// Connection String
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
           .EnableDetailedErrors()
           .EnableSensitiveDataLogging());

// ---------------- Repositories ----------------
builder.Services.AddScoped<IPieceRepository, PieceRepository>();
builder.Services.AddScoped<IEquipementRepository, EquipementRepository>();
builder.Services.AddScoped<IConditionRepository, ConditionRepository>();
builder.Services.AddScoped<IRegleRepository, RegleRepository>();

// ---------------- Services ----------------
builder.Services.AddScoped<SpeechService>();
builder.Services.AddScoped<CommandVocaleService>();
builder.Services.AddScoped<EquipementService>();
builder.Services.AddScoped<TextService>();

// ---------------- Hangfire ----------------
builder.Services.AddHangfire(config =>
    config.UseInMemoryStorage());

builder.Services.AddHangfireServer();

// Job
builder.Services.AddScoped<RegleJob>();

// ---------------- Controllers ----------------
builder.Services.AddControllers();

// ---------------- CORS ----------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// ---------------- Middleware ----------------

app.UseCors("AllowAngular");
// JWT Middleware
app.UseMiddleware<JwtMiddleware>();

app.UseExceptionHandler("/error");

// Hangfire Dashboard
app.UseHangfireDashboard("/hangfire");



// Controllers
app.MapControllers();

// ---------------- Jobs ----------------

// Exécuter les règles chaque minute
RecurringJob.AddOrUpdate<RegleJob>(
    "verifier-regles",
    job => job.ExecuterRegles(),
    "* * * * *"
);

app.Run();