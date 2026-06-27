# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.


# 1. افتح كمبيوتر افتراضي جديد ونزّل بيئة تشغيل الـ .NET 
#الخفيفة (بدون أدوات بناء) 
#وسمّها base
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base

# 2. أنشئ مجلداً داخلياً باسم app 
#وادخل فيه ليكون هو الغرفة الرئيسية للعمل
WORKDIR /app

# 3. افتح نافذة صغيرة (بورت) برقم 5000 في جدار الحاوية لكي تمر البيانات من خلالها
EXPOSE 5000

# 4. قانون داخلي يجبر سيرفر الـ .NET 
#على بث واستقبال البيانات عبر البورت 5000 المفتوح
ENV ASPNETCORE_URLS=http://+:5000



# 1. افتح كمبيوتر افتراضي جديد يحمل حقيبة أدوات التطوير والترجمة الضخمة (SDK 9.0) وسمّها build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

# 2. أنشئ مجلداً داخلياً باسم src (المصدر) وادخل فيه ليكون أرض المصنع
WORKDIR /src

# 3. انسخ ملفات الإعدادات وعقود المكتبات (.csproj) لكل المشاريع الفرعية لوحدها أولاً
COPY ["JobTracker.API/JobTracker.API.csproj", "JobTracker.API/"]
COPY ["JobTracker.Business/JobTracker.Business.csproj", "JobTracker.Business/"]
COPY ["JobTracker.DataAccess/JobTracker.DataAccess.csproj", "JobTracker.DataAccess/"]
COPY ["JobTracker.Models/JobTracker.Models.csproj", "JobTracker.Models/"]

# 4. اتصل بالإنترنت وحمّل كل المكتبات الخارجية المطلوبة للمشروع (مثل npm install) لتخزينها في الكاش
RUN dotnet restore "JobTracker.API/JobTracker.API.csproj"

# 5. الآن انسخ الكود الفعلي بالكامل (ملفات الـ C#) من جهازك الحقيقي إلى الحاوية
COPY . .

# 6. ادخل داخل مجلد مشروع الـ API الرئيسي لأن البناء والترجمة ينطلقان من عنده
WORKDIR "/src/JobTracker.API"

# 7. ترجم واكبس الكود بنمط الإنتاج السريع السري (Release) وضعه في مجلد اسمه /app/build
RUN dotnet build "JobTracker.API.csproj" -c Release -o /app/build



FROM build AS publish
RUN dotnet publish "JobTracker.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "JobTracker.API.dll"]
