using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using JobTracker.API.Middleware;
using JobTracker.Business.Interfaces;
using JobTracker.Business.Services;
using JobTracker.DataAccess;
using JobTracker.DataAccess.Interfaces;
using JobTracker.DataAccess.Repositories;

var builder = WebApplication.CreateBuilder(args);

// ── 1. Database ──────────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions => sqlOptions.EnableRetryOnFailure()));

// ── 2. Repositories (DataAccess) ─────────────────────────────────────────────
builder.Services.AddScoped<IUserRepository,    UserRepository>();
builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
builder.Services.AddScoped<ITaskRepository,    TaskRepository>();

// ── 3. Services (Business) ───────────────────────────────────────────────────
builder.Services.AddScoped<IAuthService,    AuthService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<ITaskService,    TaskService>();

// ── 4. JWT Authentication ─────────────────────────────────────────────────────
var jwtKey     = builder.Configuration["Jwt:Key"]
                 ?? throw new InvalidOperationException("JWT Key is not configured.");
var jwtIssuer  = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];


builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer           = true,
        ValidateAudience         = true,
        ValidateLifetime         = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer              = jwtIssuer,
        ValidAudience            = jwtAudience,
        IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

builder.Services.AddAuthorization();

// ── 5. CORS ──────────────────────────────────────────────────────────────────

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactClient", policy =>
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// ── 6. Controllers ───────────────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(options => 
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });



builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title       = "Job Tracker API",
        Version     = "v1",
        Description = "A production-ready Job Tracking REST API"
    });

    // Add JWT bearer authentication to Swagger UI
    var securityScheme = new OpenApiSecurityScheme
    {
        Name         = "Authorization",
        Description  = "Enter: Bearer {your JWT token}",
        In           = ParameterLocation.Header,
        Type         = SecuritySchemeType.Http,
        Scheme       = "bearer",
        BearerFormat = "JWT",
        Reference    = new OpenApiReference
        {
            Type = ReferenceType.SecurityScheme,
            Id   = JwtBearerDefaults.AuthenticationScheme
            //JwtBearerDefaults.AuthenticationScheme = bearer
        }
    };

    options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, securityScheme);
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { securityScheme, Array.Empty<string>() }
    });
});

// ────────────────────────────────────────────────────────────────────────────
var app = builder.Build();

// ── Auto-Migrate Database on Startup ──────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.Migrate();
        Console.WriteLine("Database migration applied successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"An error occurred while migrating the database: {ex.Message}");
    }
}


// ── 8. Global Error Handling Middleware ──────────────────────────────────────
app.UseMiddleware<ErrorHandlingMiddleware>();

// ── 9. Swagger (Enabled in all environments for demo purposes) ──────────────────
app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Job Tracker API v1"));

app.UseHttpsRedirection();

// ── 10. CORS (must be before Auth) ────────────────────────────────────────────
app.UseCors("AllowReactClient");

// ── 11. Authentication & Authorization ────────────────────────────────────────

app.UseAuthentication();
app.UseAuthorization();

// ── 12. Controllers ────────────────────────────────────────────────────────────
app.MapControllers();

app.Run();
