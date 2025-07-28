FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["src/backend/CleanArchitectureTemplateGenerator/CleanArchitectureTemplateGenerator.csproj", "src/backend/CleanArchitectureTemplateGenerator/"]
COPY ["src/backend/CleanArchitectureTemplateGenerator.Core/CleanArchitectureTemplateGenerator.Core.csproj", "src/backend/CleanArchitectureTemplateGenerator.Core/"]
RUN dotnet restore "src/backend/CleanArchitectureTemplateGenerator/CleanArchitectureTemplateGenerator.csproj"
COPY . .
WORKDIR "/src/src/backend/CleanArchitectureTemplateGenerator"
RUN dotnet build "./CleanArchitectureTemplateGenerator.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./CleanArchitectureTemplateGenerator.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CleanArchitectureTemplateGenerator.dll"]
