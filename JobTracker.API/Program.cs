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



/*

"كل Add...
 في Program.cs 
هي عملية تجهيز أداة
نحن نضع أداة الـ 
Authentication
في الحقيبة الآن، لكي نتمكن لاحقاً من إخبار الموظف 
(Middleware)
 بكيفية استخدامها عند مرور أي طلب 
(Request).


2. الميثود AddAuthentication
هذه الميثود هي "المدخل الرئيسي". هي لا تحدد كيف نفحص (هل بالبصمة أم بالبطاقة؟)، بل تقول فقط "سيكون هناك فحص".

 بعدها لنحدد "القواعد الافتراضية"
  (Defaults).

لذلك نحن نفتح الأقواس { }

*/
builder.Services.AddAuthentication(options =>
{
    //هو "الميكروفون" الذي يسأل: "مين أنت؟" ويحاول قراءة التوكن.  
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    //هو "رجل الأمن" الذي يطرد الشخص الذي ليس معه بطاقة (التوكن) ويعطيه مخالفة رقم 401
    options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    //هذا الكائن هو "المحقق" الذي يقرأ التوكن ويتحقق من صحته 
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

//الـ CORS 
//هو قائمة سماح (Allow-list).
//نحن نخبر السيرفر بأسماء الروابط الصديقة، والسيرفر يخبر المتصفح بها. 
//إذا جاء طلب من رابط غير موجود في القائمة، يقوم المتصفح بـ 'إعدام' الطلب قبل أن يصل للكود الخاص بك.

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

//فهذا الجزء هو الذي يحدد كيف ستظهر هذه المعلومات في صفحة الـ
//Swagger كواجهة رسمية لمشروعك.

//هذا الكود لا يغير طريقة عمل البرمجة، بل يغير 'البراندينج' الخاص بمشروعك.
//هو الذي يجعل صفحة الـسواكر تبدو كمنتج احترافي لشركة برمجة، وليس مجرد كود تجريبي.

    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title       = "Job Tracker API",
        Version     = "v1",
        Description = "A production-ready Job Tracking REST API"
    });

    // Add JWT bearer authentication to Swagger UI
    var securityScheme = new OpenApiSecurityScheme
    {
        //هذا هو اسم "المجلد" أو "الخانة" التي سيوضع فيها التوكن.
        Name         = "Authorization",
        Description  = "Enter: Bearer {your JWT token}",
        //أين نضع هذا المفتاح؟
        In           = ParameterLocation.Header,
        //ما هو نوع بروتوكول الأمان؟
        Type         = SecuritySchemeType.Http,
        Scheme       = "bearer",
        BearerFormat = "JWT",
        //الربط بنفس نظام الحماية الذي عرفناه للسيرفر الأساسي
        Reference    = new OpenApiReference
        {
            Type = ReferenceType.SecurityScheme,
            Id   = JwtBearerDefaults.AuthenticationScheme
            //JwtBearerDefaults.AuthenticationScheme = bearer
        }
    };

    //احفظ عندك نظاماً اسمه 'Bearer'،
    // ومواصفاته التقنية موجودة داخل المتغير securityScheme
    options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, securityScheme);
    //بمجرد كتابة هذا السطر، ستظهر أيقونة القفل الصغير بجانب كل دالة في السواجر
    //هو الذي يخبر السواجر  
    //بأن يطلب التوكن من المستخدم
    // Authorize ويضعها في الخانة المخصصة
    // في نافذة الـ  وأرسله مع الطلب تلقائياً
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
 // أولاً (CORS)  اسمح بالمرور : kurall
app.UseCors("AllowReactClient");

// ── 11. Authentication & Authorization ────────────────────────────────────────
//  أولاً، ثم  (Auth)
// ثانياً. افحص الهوية

app.UseAuthentication();
app.UseAuthorization();

// ── 12. Controllers ────────────────────────────────────────────────────────────
app.MapControllers();

app.Run();
