package controllers

import (
    "net/http"
    "strconv"
    "backend/models"
    "backend/services"
    
    "github.com/gin-gonic/gin"
)

type CustomerController struct {
    customerService *services.CustomerService
}

func NewCustomerController() *CustomerController {
    return &CustomerController{
        customerService: services.NewCustomerService(),
    }
}

func (c *CustomerController) GetCustomers(ctx *gin.Context) {
    customers, err := c.customerService.GetAllCustomers()
    if err != nil {
        ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    ctx.JSON(http.StatusOK, gin.H{"data": customers})
}

func (c *CustomerController) CreateCustomer(ctx *gin.Context) {
    var customer models.Customer
    if err := ctx.ShouldBindJSON(&customer); err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    if err := c.customerService.CreateCustomer(&customer); err != nil {
        ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    ctx.JSON(http.StatusCreated, gin.H{"data": customer})
}

func (c *CustomerController) UpdateCustomer(ctx *gin.Context) {
    id, err := strconv.Atoi(ctx.Param("id"))
    if err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid customer ID"})
        return
    }
    
    var customer models.Customer
    if err := ctx.ShouldBindJSON(&customer); err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    customer.CustomerID = id
    if err := c.customerService.UpdateCustomer(&customer); err != nil {
        ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    ctx.JSON(http.StatusOK, gin.H{"data": customer})
}

func (c *CustomerController) DeleteCustomer(ctx *gin.Context) {
    id, err := strconv.Atoi(ctx.Param("id"))
    if err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid customer ID"})
        return
    }
    
    if err := c.customerService.DeleteCustomer(id); err != nil {
        ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    ctx.JSON(http.StatusOK, gin.H{"message": "Customer deleted successfully"})
}

func (c *CustomerController) GetCustomer(ctx *gin.Context) {
    id, err := strconv.Atoi(ctx.Param("id"))
    if err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid customer ID"})
        return
    }
    
    customer, err := c.customerService.GetCustomerByID(id)
    if err != nil {
        ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    ctx.JSON(http.StatusOK, gin.H{"data": customer})
}