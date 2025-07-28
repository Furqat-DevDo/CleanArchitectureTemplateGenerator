# Deployment Guide

## 🚀 Overview

This guide covers deploying the Clean Architecture Template Generator to various environments, from development to production.

## 📋 Deployment Options

- [Docker Deployment](#docker-deployment)
- [Azure Deployment](#azure-deployment)
- [AWS Deployment](#aws-deployment)
- [IIS Deployment](#iis-deployment)
- [Linux Deployment](#linux-deployment)

## 🐳 Docker Deployment

### Prerequisites
- Docker Desktop or Docker Engine
- Docker Compose (optional)

### Backend Dockerfile
```dockerfile
# src/backend/CleanArchitectureTemplateGenerator/Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["CleanArchitectureTemplateGenerator/CleanArchitectureTemplateGenerator.csproj", "CleanArchitectureTemplateGenerator/"]
COPY ["CleanArchitectureTemplateGenerator.Core/CleanArchitectureTemplateGenerator.Core.csproj", "CleanArchitectureTemplateGenerator.Core/"]
RUN dotnet restore "CleanArchitectureTemplateGenerator/CleanArchitectureTemplateGenerator.csproj"
COPY . .
WORKDIR "/src/CleanArchitectureTemplateGenerator"
RUN dotnet build "CleanArchitectureTemplateGenerator.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "CleanArchitectureTemplateGenerator.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CleanArchitectureTemplateGenerator.dll"]
```

### Frontend Dockerfile
```dockerfile
# src/frontend/clean-architecture-generator/Dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build --prod

FROM nginx:alpine
COPY --from=build /app/dist/clean-architecture-generator /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration
```nginx
# src/frontend/clean-architecture-generator/nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Handle Angular routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # API proxy
        location /api/ {
            proxy_pass http://backend:80/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # SignalR proxy
        location /hub/ {
            proxy_pass http://backend:80/hub/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build:
      context: ./src/backend
      dockerfile: CleanArchitectureTemplateGenerator/Dockerfile
    ports:
      - "5000:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ASPNETCORE_URLS=http://+:80
    volumes:
      - ./temp:/app/temp
    networks:
      - app-network

  frontend:
    build:
      context: ./src/frontend/clean-architecture-generator
      dockerfile: Dockerfile
    ports:
      - "4200:80"
    depends_on:
      - backend
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  temp-storage:
```

### Running with Docker Compose
```bash
# Build and start all services
docker-compose up --build

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ☁️ Azure Deployment

### Azure Container Instances

#### Deploy Backend
```bash
# Create resource group
az group create --name rg-cleanarch-generator --location eastus

# Create container instance
az container create \
  --resource-group rg-cleanarch-generator \
  --name cleanarch-backend \
  --image youracr.azurecr.io/cleanarch-backend:latest \
  --dns-name-label cleanarch-backend \
  --ports 80 443 \
  --environment-variables ASPNETCORE_ENVIRONMENT=Production
```

#### Deploy Frontend
```bash
# Create container instance for frontend
az container create \
  --resource-group rg-cleanarch-generator \
  --name cleanarch-frontend \
  --image youracr.azurecr.io/cleanarch-frontend:latest \
  --dns-name-label cleanarch-frontend \
  --ports 80 \
  --environment-variables API_URL=https://cleanarch-backend.eastus.azurecontainer.io
```

### Azure App Service

#### Backend Deployment
```bash
# Create App Service plan
az appservice plan create \
  --name asp-cleanarch-generator \
  --resource-group rg-cleanarch-generator \
  --sku B1 \
  --is-linux

# Create web app
az webapp create \
  --resource-group rg-cleanarch-generator \
  --plan asp-cleanarch-generator \
  --name cleanarch-backend-api \
  --deployment-container-image-name youracr.azurecr.io/cleanarch-backend:latest

# Configure app settings
az webapp config appsettings set \
  --resource-group rg-cleanarch-generator \
  --name cleanarch-backend-api \
  --settings ASPNETCORE_ENVIRONMENT=Production
```

#### Frontend Deployment
```bash
# Create static web app
az staticwebapp create \
  --name cleanarch-frontend \
  --resource-group rg-cleanarch-generator \
  --source https://github.com/yourusername/CleanArchitectureTemplateGenerator \
  --branch main \
  --app-location "/src/frontend/clean-architecture-generator" \
  --output-location "dist/clean-architecture-generator"
```

## 🌐 AWS Deployment

### AWS ECS with Fargate

#### Task Definition
```json
{
  "family": "cleanarch-generator",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "youraccount.dkr.ecr.region.amazonaws.com/cleanarch-backend:latest",
      "portMappings": [
        {
          "containerPort": 80,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "ASPNETCORE_ENVIRONMENT",
          "value": "Production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/cleanarch-generator",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### ECS Service
```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name cleanarch-cluster

# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster cleanarch-cluster \
  --service-name cleanarch-service \
  --task-definition cleanarch-generator:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
```

### AWS S3 + CloudFront (Frontend)

```bash
# Create S3 bucket
aws s3 mb s3://cleanarch-frontend-bucket

# Upload built files
aws s3 sync ./dist/clean-architecture-generator s3://cleanarch-frontend-bucket --delete

# Create CloudFront distribution
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

## 🖥️ IIS Deployment

### Prerequisites
- Windows Server with IIS
- .NET 8 Hosting Bundle
- URL Rewrite Module

### Backend Deployment

1. **Publish the application**
   ```bash
   dotnet publish -c Release -o ./publish
   ```

2. **Create IIS Application**
   - Open IIS Manager
   - Create new Application Pool (.NET CLR Version: No Managed Code)
   - Create new Website/Application
   - Point to published folder

3. **Configure web.config**
   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <configuration>
     <location path="." inheritInChildApplications="false">
       <system.webServer>
         <handlers>
           <add name="aspNetCore" path="*" verb="*" modules="AspNetCoreModuleV2" resourceType="Unspecified" />
         </handlers>
         <aspNetCore processPath="dotnet" 
                     arguments=".\CleanArchitectureTemplateGenerator.dll" 
                     stdoutLogEnabled="false" 
                     stdoutLogFile=".\logs\stdout" 
                     hostingModel="inprocess" />
       </system.webServer>
     </location>
   </configuration>
   ```

### Frontend Deployment

1. **Build for production**
   ```bash
   ng build --configuration production
   ```

2. **Configure IIS**
   - Create new website in IIS
   - Point to dist folder
   - Install URL Rewrite Module

3. **Add web.config for Angular routing**
   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <configuration>
     <system.webServer>
       <rewrite>
         <rules>
           <rule name="Angular Routes" stopProcessing="true">
             <match url=".*" />
             <conditions logicalGrouping="MatchAll">
               <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
               <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
             </conditions>
             <action type="Rewrite" url="/index.html" />
           </rule>
         </rules>
       </rewrite>
     </system.webServer>
   </configuration>
   ```

## 🐧 Linux Deployment

### Ubuntu/Debian

#### Install Prerequisites
```bash
# Install .NET 8
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt-get update
sudo apt-get install -y dotnet-sdk-8.0

# Install Nginx
sudo apt-get install nginx

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Deploy Backend
```bash
# Publish application
dotnet publish -c Release -o /var/www/cleanarch-backend

# Create systemd service
sudo nano /etc/systemd/system/cleanarch-backend.service
```

```ini
[Unit]
Description=Clean Architecture Generator Backend
After=network.target

[Service]
Type=notify
ExecStart=/usr/bin/dotnet /var/www/cleanarch-backend/CleanArchitectureTemplateGenerator.dll
Restart=always
RestartSec=10
KillSignal=SIGINT
SyslogIdentifier=cleanarch-backend
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://localhost:5000

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable cleanarch-backend.service
sudo systemctl start cleanarch-backend.service
```

#### Configure Nginx
```nginx
# /etc/nginx/sites-available/cleanarch-generator
server {
    listen 80;
    server_name your-domain.com;
    
    # Frontend
    location / {
        root /var/www/cleanarch-frontend;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # SignalR Hub
    location /hub/ {
        proxy_pass http://localhost:5000/hub/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/cleanarch-generator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 Production Configuration

### Environment Variables
```bash
# Backend
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=https://+:443;http://+:80
ConnectionStrings__DefaultConnection=your-connection-string
Logging__LogLevel__Default=Warning

# Frontend
NODE_ENV=production
API_URL=https://api.yourdomain.com
```

### Security Headers
```csharp
// Program.cs
app.Use(async (context, next) =>
{
    context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Add("X-Frame-Options", "DENY");
    context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Add("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    await next();
});
```

### SSL/TLS Configuration
```bash
# Let's Encrypt with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## 📊 Monitoring and Logging

### Application Insights (Azure)
```csharp
// Program.cs
builder.Services.AddApplicationInsightsTelemetry();
```

### Structured Logging
```csharp
// appsettings.Production.json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "Serilog": {
    "MinimumLevel": "Information",
    "WriteTo": [
      {
        "Name": "File",
        "Args": {
          "path": "/var/log/cleanarch-generator/log-.txt",
          "rollingInterval": "Day"
        }
      }
    ]
  }
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: '8.0.x'
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Build Backend
      run: |
        cd src/backend/CleanArchitectureTemplateGenerator
        dotnet publish -c Release -o ./publish
    
    - name: Build Frontend
      run: |
        cd src/frontend/clean-architecture-generator
        npm ci
        npm run build --prod
    
    - name: Deploy to Azure
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'cleanarch-generator'
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: './src/backend/CleanArchitectureTemplateGenerator/publish'
```

---

For more information on specific deployment scenarios, consult the cloud provider documentation or contact the development team.
