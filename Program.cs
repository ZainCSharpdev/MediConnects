using Microsoft.AspNetCore.Diagnostics;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using PharmacyApi.Models;
using PharmacyApi.Repository.Dapper.Implement;
using PharmacyApi.Repository.Dapper.Interface;
using PharmacyApi.Repository.Entity.Implement;
using PharmacyApi.Repository.Entity.Interface;
using PharmacyApi.Services.Medicine;
using PharmacyApi.Services.PythonAnalysis;
using PharmacyApi.Services.Sale;
using PharmacyApi.Services.User;
using Scalar.AspNetCore;
using System.Data;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

//Python API HttpClient
builder.Services.AddHttpClient<AnalyticsService>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["PythonApiSettings:BaseUrl"]);
});

//Dapper
builder.Services.AddScoped<IDbConnection>(sp =>
  new SqlConnection(builder.Configuration.GetConnectionString("Conn")));

//Entity
builder.Services.AddDbContext<PharmacyDbContext>(option =>
option.UseSqlServer(builder.Configuration.GetConnectionString("Conn")));


//Mongodb
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));

builder.Services.AddSingleton<IMongoClient>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<MongoDbSettings>>().Value;
    return new MongoClient(settings.mongoDbConnectionString);
});

builder.Services.AddScoped<IMongoDatabase>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<MongoDbSettings>>().Value;
    var client = sp.GetRequiredService<IMongoClient>();
    return client.GetDatabase(settings.DatabaseName);
});

//MongoDb End


// Dapper repos
builder.Services.AddScoped<IMedicineReadRepo, MedicineReadRepo>();
builder.Services.AddScoped<ISaleReadRepo, SaleReadRepo>();
builder.Services.AddScoped<ISaleDetailReadRepo, SaleDetailReadRepo>();
builder.Services.AddScoped<IUserReadRepo, UserReadRepo>();
builder.Services.AddScoped<ISupplierReadRepo, SupplierReadRepo>();

// EF Core repos
builder.Services.AddScoped<IMedicineWriteRepo, MedicineWriteRepo>();
builder.Services.AddScoped<ISaleWriteRepo, SaleWriteRepo>();
builder.Services.AddScoped<ISaleDetailsWriteRepo, SaleDetailWriteRepo>();
builder.Services.AddScoped<IUserWriteRepo, UserWriteRepo>();

// Services
builder.Services.AddScoped<MedicineService>();
builder.Services.AddScoped<SaleService>();
builder.Services.AddScoped<SaleDetailService>();
builder.Services.AddScoped<AuthService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.WithOrigins("http://localhost:5173", "https://localhost:5173")
       .AllowAnyMethod()
       .AllowAnyHeader();

    });
});


var app = builder.Build();


//Exception handeling
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";

        var errorFeature = context.Features.Get<IExceptionHandlerFeature>();
        if (errorFeature != null)
        {
            var ex = errorFeature.Error;

            var result = JsonSerializer.Serialize(new
            {
                error = "An unexpected error occurred.",
                details = ex.Message // optional: remove in production for security
            });

            await context.Response.WriteAsync(result);
        }
    });
});


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}
app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();
