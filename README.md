# PizzaShop Billing System

A web-based billing system for managing pizza shop categories, items, and billing operations.

## Technology Stack

- **Frontend**: React 18  
- **Backend**: Go (Golang)  
- **Database**: Microsoft SQL Server  

---

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16.0.0 or higher)  
- [Go](https://go.dev/dl/) (v1.19 or higher)  
- [Microsoft SQL Server](https://www.microsoft.com/en-us/sql-server/) (2018 or higher)  

---

## Database Setup

1. Open SSMS or use your preferred SQL tool and run:

   ```sql
   CREATE DATABASE PizzaShopDB;
   GO

   USE PizzaShopDB;
   GO
   ```
2. Run the schema creation script

---

## Backend Setup

1. Navigate to the backend directory:
```
cd backend
```

2. Install Go dependencies:
```
go mod tidy
```

4. Create an environment configuration file:
```
cp .env.example .env
```

6. Edit the .env file with your database details:
```
DB_SERVER=localhost
DB_NAME=PizzaShopDB
USE_WINDOWS_AUTH=true
SERVER_PORT=8080
```

8. Start the backend server:
```
go run main.go
```

---

## Frontend Setup

1. Navigate to the frontend directory:
```
cd frontend
```

3. Install Node.js dependencies:
```
npm install
```

4. Start the development server:
```
npm start
```
