package main

import (
    "log"
    "backend/config"
    "backend/controllers"
    "backend/database"
    
    "github.com/gin-contrib/cors"
    "github.com/gin-gonic/gin"
)

func main() {
    // Load configuration
    cfg := config.LoadConfig()
    
    // Initialize database
    if err := database.InitDB(cfg); err != nil {
        log.Fatal("Failed to initialize database:", err)
    }
    
    // Initialize Gin router
    router := gin.Default()
    
    // Configure CORS
    router.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:3000"},
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"*"},
        AllowCredentials: true,
    }))
    
    // Initialize controllers
    itemController := controllers.NewItemController()
    invoiceController := controllers.NewInvoiceController()
    categoryController := controllers.NewCategoryController()
    customerController := controllers.NewCustomerController()
    
    // Setup routes
    api := router.Group("/api/v1")
    
    // Item routes
    items := api.Group("/items")
    {
        items.GET("", itemController.GetItems)
        items.POST("", itemController.CreateItem)
        items.PUT("/:id", itemController.UpdateItem)
        items.DELETE("/:id", itemController.DeleteItem)
    }
    
    // Category routes
    categories := api.Group("/categories")
    {
        categories.GET("", categoryController.GetCategories)
        categories.POST("", categoryController.CreateCategory)
        categories.PUT("/:id", categoryController.UpdateCategory)
        categories.DELETE("/:id", categoryController.DeleteCategory)
        categories.GET("/:id", categoryController.GetCategory)
    }
    
    // Invoice routes
    invoices := api.Group("/invoices")
    {
        invoices.GET("", invoiceController.GetInvoices)
        invoices.POST("", invoiceController.CreateInvoice)
        invoices.GET("/:id", invoiceController.GetInvoice)
    }
    
    // Customer routes
    customers := api.Group("/customers")
    {
        customers.GET("", customerController.GetCustomers)
        customers.POST("", customerController.CreateCustomer)
        customers.PUT("/:id", customerController.UpdateCustomer)
        customers.DELETE("/:id", customerController.DeleteCustomer)
        customers.GET("/:id", customerController.GetCustomer)
    }
    
    // Start server
    log.Printf("Server starting on port %s", cfg.ServerPort)
    log.Fatal(router.Run(":" + cfg.ServerPort))
}