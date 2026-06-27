using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace JobTracker.API.Middleware
{
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlingMiddleware> _logger;


/*
 من الذي يعطينا هذه القيم؟
نحن لا نقوم بعمل 
new ErrorHandlingMiddleware()
 بأنفسنا في الكود.
 (.NET Runtime):النظام
هو المسؤول عن إنشاء هذا الكلاس.
عندما يرى النظام أن الكلاس يحتاج لـ
RequestDelegate
 و
ILogger<ErrorHandlingMiddleware>
 فإنه يقوم بالبحث في الـ
Service Container
 عن هذه الخدمات.
ويقوم بـ حقنهم
(Injection)
داخل الكلاس.
*/      public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
        {
            _next   = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception caught by ErrorHandlingMiddleware");
                await HandleExceptionAsync(context, ex);
            }
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var (statusCode, message) = exception switch
            {
                UnauthorizedAccessException => (HttpStatusCode.Unauthorized,       exception.Message),
                InvalidOperationException   => (HttpStatusCode.BadRequest,         exception.Message),
                KeyNotFoundException        => (HttpStatusCode.NotFound,           exception.Message),
                ArgumentException           => (HttpStatusCode.UnprocessableEntity, exception.Message),
                _                           => (HttpStatusCode.InternalServerError, "An unexpected error occurred. Please try again later.")
            };

            context.Response.ContentType = "application/json";
            context.Response.StatusCode  = (int)statusCode;

            var body = JsonSerializer.Serialize(new
            {
                status  = (int)statusCode,
                error   = statusCode.ToString(),
                message = message
            });

            await context.Response.WriteAsync(body);
        }
    }
}
