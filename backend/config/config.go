package config

import (
    "os"
    "github.com/joho/godotenv"
)

type Config struct {
    DBServer        string
    DBPort          string
    DBUser          string
    DBPassword      string
    DBName          string
    ServerPort      string
    UseWindowsAuth  bool
}

func LoadConfig() *Config {
    godotenv.Load()

    useWindowsAuth := getEnv("USE_WINDOWS_AUTH", "false") == "true"
    
    return &Config{
        DBServer:       getEnv("DB_SERVER", "localhost"),
        DBPort:         getEnv("DB_PORT", "1433"),
        DBUser:         getEnv("DB_USER", ""),
        DBPassword:     getEnv("DB_PASSWORD", ""),
        DBName:         getEnv("DB_NAME", "PizzaShopDB"),
        ServerPort:     getEnv("SERVER_PORT", "8080"),
        UseWindowsAuth: useWindowsAuth,
    }
}

func getEnv(key, defaultValue string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return defaultValue
}