using System.Text;
using CloudServiceStore.Application;
using CloudServiceStore.Application.Common.Interfaces;
using CloudServiceStore.Infrastructure;
using CloudServiceStore.WebApi.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

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

// Nạp cache SiteSetting (Singleton) 1 lần lúc khởi động để có dữ liệu ngay từ request đầu tiên.
using (var scope = app.Services.CreateScope())
{
    var siteSettingsCache = scope.ServiceProvider.GetRequiredService<ISiteSettingsCache>();
    await siteSettingsCache.RefreshAsync();
}

// Không redirect sang HTTPS khi Development: frontend Next.js (Server Component fetch + form public)
// gọi thẳng http://localhost:5137 theo đúng .env.local/.env.example - redirect sang cổng HTTPS dùng
// dev cert tự ký sẽ khiến fetch phía Node (undici) báo lỗi DEPTH_ZERO_SELF_SIGNED_CERT.
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors(FrontendCorsPolicy);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
