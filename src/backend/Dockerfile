# Backend Dockerfile (.NET Web API)
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /app

COPY src/CloudServiceStore/CloudServiceStore.Domain/CloudServiceStore.Domain.csproj src/CloudServiceStore/CloudServiceStore.Domain/
COPY src/CloudServiceStore/CloudServiceStore.Application/CloudServiceStore.Application.csproj src/CloudServiceStore/CloudServiceStore.Application/
COPY src/CloudServiceStore/CloudServiceStore.Infrastructure/CloudServiceStore.Infrastructure.csproj src/CloudServiceStore/CloudServiceStore.Infrastructure/
COPY src/CloudServiceStore/CloudServiceStore.WebApi/CloudServiceStore.WebApi.csproj src/CloudServiceStore/CloudServiceStore.WebApi/

RUN dotnet restore src/CloudServiceStore/CloudServiceStore.WebApi/CloudServiceStore.WebApi.csproj

COPY src/CloudServiceStore/ src/CloudServiceStore/
WORKDIR /app/src/CloudServiceStore/CloudServiceStore.WebApi
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

ENTRYPOINT ["dotnet", "CloudServiceStore.WebApi.dll"]
