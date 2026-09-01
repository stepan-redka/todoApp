# Full-Stack Todo & Timeline Application

A modern, full-stack task management application featuring a **Kanban Board** and an **Interactive Gantt Timeline**. Built with **Angular 21** (NgRx & Signals) on the frontend and an **ASP.NET Core 8 Web API** (Clean Architecture, CQRS with MediatR, Dapper) backed by **Microsoft SQL Server**.

---

## 📑 Table of Contents

- [Features](#-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
  - [1. Start SQL Server (Docker)](#1-start-sql-server-docker)
  - [2. Start the Backend API](#2-start-the-backend-api)
  - [3. Start the Angular Client](#3-start-the-angular-client)
- [API Documentation](#-api-documentation)
- [Running Tests](#-running-tests)
- [Configuration](#-configuration)

---

## ✨ Features

- **📋 Kanban Board**: Manage tasks across three workflow columns (*To Do*, *In Progress*, *Done*) with quick status transition controls.
- **📅 Interactive Gantt Timeline**: Visualize task schedules and progress with dynamic range navigation (previous/next/today) and multi-level zoom (7 days, 14 days, 30 days).
- **🔍 Real-Time Search & Filtering**: Filter tasks by priority (*Low*, *Medium*, *High*), overdue status, and live search across titles and descriptions.
- **🎨 Dark / Light Mode**: Seamless theme toggling with preference persistence stored in `localStorage`.
- **🛡️ Data Validation**: Multi-layer validation with client-side character limits/date constraints and server-side **FluentValidation** pipeline behaviors.
- **⚡ High Performance**: Lightweight data access layer using **Dapper** with automated database and schema initialization.
- **📝 Structured Logging**: Configured with **Serilog** for both formatted console output and daily rolling log files.

---

## 🏗️ Architecture & Tech Stack

### Frontend (`/client`)
- **Framework**: [Angular 21](https://angular.dev/) (Standalone Components, Signals)
- **State Management**: [@ngrx/store](https://ngrx.io/) & [@ngrx/effects](https://ngrx.io/) (CQRS-style client state management)
- **Styling**: Pure CSS with CSS custom variables (theming engine)
- **Testing**: [Vitest](https://vitest.dev/)

### Backend (`/server`)
- **Framework**: [ASP.NET Core 8 Web API](https://learn.microsoft.com/en-us/aspnet/core/)
- **Pattern**: Clean Architecture & CQRS (Command Query Responsibility Segregation)
- **Mediator**: [MediatR](https://github.com/jbogard/MediatR) with custom Validation Pipeline Behavior
- **Validation**: [FluentValidation](https://docs.fluentvalidation.net/)
- **Data Access**: [Dapper](https://github.com/DapperLib/Dapper) (Micro-ORM) + `Microsoft.Data.SqlClient`
- **Database**: [Microsoft SQL Server 2022](https://www.microsoft.com/en-us/sql-server/)
- **Logging**: [Serilog](https://serilog.net/) (Console & Rolling File Sinks)
- **API Documentation**: Swagger / OpenAPI ([Swashbuckle](https://github.com/domaindrivendev/Swashbuckle.AspNetCore))
- **Testing**: [xUnit](https://xunit.net/) & [Moq](https://github.com/devlooped/moq)

---

## 📁 Project Structure

```text
todoApp/
├── docker-compose.yml              # SQL Server 2022 container configuration
├── global.json                     # .NET SDK pinning (8.0.0)
│
├── client/                         # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/               # Models and HTTP services
│   │   │   ├── features/           # Dashboard (Kanban + Gantt timeline)
│   │   │   └── state/              # NgRx actions, reducers, effects, selectors
│   │   └── styles.css              # Global styles & theme variables
│   ├── package.json
│   └── tsconfig.json
│
└── server/                         # .NET 8 Backend Solution
    ├── todoApp.sln
    ├── Todo.Api/                   # Controllers, middleware, Serilog, and DI setup
    ├── Todo.Application/           # CQRS commands, queries, handlers, and validators
    ├── Todo.Domain/                # Domain entities, enums, and repository interfaces
    ├── Todo.Infrastructure/        # Dapper repository implementation and DbInitializer
    └── Todo.Tests/                 # Unit tests for MediatR command & query handlers
```

---

## 📦 Prerequisites

Before running the application, make sure you have the following installed:

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (v18.x or v20.x recommended) and `npm`
- [Docker](https://www.docker.com/) and Docker Compose (to run SQL Server)

---

## 🚀 Getting Started

### 1. Start SQL Server (Docker)

Launch the Microsoft SQL Server container using Docker Compose:

```bash
docker compose up -d
```

This starts a SQL Server 2022 instance on port `1433` with the default password configured in `docker-compose.yml`.

> [!NOTE]
> Database creation and table migration are performed automatically by `DbInitializer` on the backend application startup.

### 2. Start the Backend API

Navigate to the `server/Todo.Api` folder and run the API:

```bash
cd server/Todo.Api
dotnet run
```

The API will start at:
- **HTTP**: `http://localhost:5043`
- **HTTPS**: `https://localhost:7082`
- **Swagger UI**: `http://localhost:5043/swagger` (or `https://localhost:7082/swagger`)

### 3. Start the Angular Client

In a separate terminal, navigate to the `client` folder, install dependencies, and start the development server:

```bash
cd client
npm install
npm start
```

Open your browser and navigate to `http://localhost:4200/`.

---

## 📡 API Documentation

When the backend API is running in development mode, interactive Swagger documentation is available at `http://localhost:5043/swagger`.

### Endpoints Overview

| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/todos` | Fetch all todos for the current user | *None* |
| `POST` | `/api/todos` | Create a new todo item | `{ title, description?, status, priority, deadline?, startDate? }` |
| `PUT` | `/api/todos/{id}` | Update an existing todo item | `{ title, description?, status, priority, deadline?, startDate? }` |
| `DELETE` | `/api/todos/{id}` | Delete a todo item by ID | *None* |

### Data Enums

- **Status**: `0 = Todo`, `1 = InProgress`, `2 = Done`
- **Priority**: `0 = Low`, `1 = Medium`, `2 = High`

---

## 🧪 Running Tests

### Backend Unit Tests (xUnit)
Run all MediatR command and query unit tests:

```bash
cd server
dotnet test
```

### Frontend Unit Tests (Vitest)
Run the Angular unit test suite:

```bash
cd client
npm test
```

---

## ⚙️ Configuration

### Backend (`server/Todo.Api/appsettings.Development.json`)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=TodoDb;User Id=sa;Password=SuperStrongPassword123!;TrustServerCertificate=True;"
  }
}
```

### CORS
CORS is pre-configured in `server/Todo.Api/Program.cs` to accept requests from the Angular client at `http://localhost:4200`.

### Client API URL (`client/src/app/core/services/todo.service.ts`)
The client targets `http://localhost:5043/api/todos` by default.
