# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.



FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base

# 2.
WORKDIR /app

# 3.
EXPOSE 5000

# 4.
ENV ASPNETCORE_URLS=http://+:5000



# 1.
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

# 2.
WORKDIR /src

# 3.
COPY ["JobTracker.API/JobTracker.API.csproj", "JobTracker.API/"]
COPY ["JobTracker.Business/JobTracker.Business.csproj", "JobTracker.Business/"]
COPY ["JobTracker.DataAccess/JobTracker.DataAccess.csproj", "JobTracker.DataAccess/"]
COPY ["JobTracker.Models/JobTracker.Models.csproj", "JobTracker.Models/"]

# 4.
RUN dotnet restore "JobTracker.API/JobTracker.API.csproj"

# 5.
COPY . .

# 6.
WORKDIR "/src/JobTracker.API"

# 7.
RUN dotnet build "JobTracker.API.csproj" -c Release -o /app/build



FROM build AS publish
RUN dotnet publish "JobTracker.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "JobTracker.API.dll"]
