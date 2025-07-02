package database

import (
    "database/sql"
    "fmt"
    "backend/config"
    _ "github.com/microsoft/go-mssqldb"
)

var DB *sql.DB

func InitDB(cfg *config.Config) error {
    var connString string
    
    if cfg.UseWindowsAuth {
        // Windows Authentication connection string
        connString = fmt.Sprintf("server=%s;database=%s;trusted_connection=yes;encrypt=disable",
            cfg.DBServer, cfg.DBName)
    } else {
        // SQL Server Authentication connection string
        connString = fmt.Sprintf("server=%s;user id=%s;password=%s;port=%s;database=%s;encrypt=disable",
            cfg.DBServer, cfg.DBUser, cfg.DBPassword, cfg.DBPort, cfg.DBName)
    }
    
    var err error
    DB, err = sql.Open("mssql", connString)
    if err != nil {
        return fmt.Errorf("failed to open database: %v", err)
    }
    
    if err = DB.Ping(); err != nil {
        return fmt.Errorf("failed to ping database: %v", err)
    }
    
    fmt.Println("Database connected successfully!")
    return nil
}

func GetDB() *sql.DB {
    return DB
}