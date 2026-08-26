using System.Text;
using CloudServiceStore.Application;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Infrastructure;
using CloudServiceStore.WebApi.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Chốt cứng 1 đường dẫn tuyệt đối duy nhất cho thư mục upload ngay từ đầu (ghi đè "Storage:UploadsPath"
// nếu appsettings/env chưa cấu hình) - LocalFileStorageService.cs (ghi file) và UseStaticFiles bên dưới
// (đọc file) đều phải trỏ đúng 1 chỗ; nếu để mỗi bên tự đoán theo quy ước (ContentRootPath vs
// AppContext.BaseDirectory) có thể lệch nhau tuỳ cách khởi động (dotnet run vs Docker WORKDIR).
var uploadsPath = builder.Configuration["Storage:UploadsPath"];
if (string.IsNullOrWhiteSpace(uploadsPath))
{
    uploadsPath = Path.Combine(builder.Environment.ContentRootPath, "wwwroot", "uploads");
    builder.Configuration["Storage:UploadsPath"] = uploadsPath;
}
Directory.CreateDirectory(uploadsPath);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập theo định dạng: Bearer {access_token}"
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// Cho phép frontend Next.js (chạy ở localhost:3000 lúc dev) gọi API — chỉ dùng thật sự cho các
// request ẩn danh gọi thẳng từ trình duyệt (Phase 6.4); các request admin đã đăng nhập đi qua
// Route Handler proxy phía Next.js nên không cần CORS.
const string FrontendCorsPolicy = "Frontend";
builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        policy.WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var jwtSection = builder.Configuration.GetSection("Jwt");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Giữ nguyên tên claim gốc lúc phát hành token (vd "sub") thay vì để .NET tự map sang
        // ClaimTypes.* theo hành vi legacy — tránh nhầm lẫn khi đọc claim ở AuthController.GetUserId().
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtSection["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwtSection["Audience"],
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSection["SecretKey"] ?? string.Empty)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });
builder.Services.AddAuthorization();

builder.Services.AddExceptionHandler<AppExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler();

// Tự động Migrate CSDL và Nạp cache SiteSetting khi khởi động
using (var scope = app.Services.CreateScope())
{
    try
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<CloudServiceStore.Infrastructure.Persistence.AppDbContext>();
        await dbContext.Database.MigrateAsync();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[Migration Warning] {ex.Message}");
        try
        {
            var dbContext = scope.ServiceProvider.GetRequiredService<CloudServiceStore.Infrastructure.Persistence.AppDbContext>();
            await dbContext.Database.EnsureCreatedAsync();
        }
        catch (Exception innerEx)
        {
            Console.WriteLine($"[EnsureCreated Warning] {innerEx.Message}");
        }
    }

    try
    {
        var siteSettingsCache = scope.ServiceProvider.GetRequiredService<ISiteSettingsCache>();
        await siteSettingsCache.RefreshAsync();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[SiteSettingsCache Warning] {ex.Message}");
    }
}

// Nginx handles SSL termination on port 443 and proxies HTTP to backend port 5000.
// HttpsRedirection is not needed in containerized backend behind reverse proxy.

// Phục vụ ảnh đã upload - PhysicalFileProvider trỏ đúng uploadsPath đã chốt ở trên (không dùng wwwroot
// mặc định của UseStaticFiles() để tránh lệch đường dẫn). <img src> load thẳng GET không qua
// CORS/preflight nên không cần thêm gì vào FrontendCorsPolicy.
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads",
});

app.UseCors(FrontendCorsPolicy);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
