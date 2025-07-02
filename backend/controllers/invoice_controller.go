package controllers

import (
    "net/http"
    "strconv"
    "backend/models"
    "backend/services"
    
    "github.com/gin-gonic/gin"
)

type InvoiceController struct {
    invoiceService *services.InvoiceService
}

func NewInvoiceController() *InvoiceController {
    return &InvoiceController{
        invoiceService: services.NewInvoiceService(),
    }
}

func (c *InvoiceController) CreateInvoice(ctx *gin.Context) {
    var req models.CreateInvoiceRequest
    if err := ctx.ShouldBindJSON(&req); err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    invoice, err := c.invoiceService.CreateInvoice(&req)
    if err != nil {
        ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    ctx.JSON(http.StatusCreated, gin.H{"data": invoice})
}

func (c *InvoiceController) GetInvoices(ctx *gin.Context) {
    invoices, err := c.invoiceService.GetAllInvoices()
    if err != nil {
        ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    ctx.JSON(http.StatusOK, gin.H{"data": invoices})
}

func (c *InvoiceController) GetInvoice(ctx *gin.Context) {
    id, err := strconv.Atoi(ctx.Param("id"))
    if err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid invoice ID"})
        return
    }
    
    invoice, err := c.invoiceService.GetInvoiceByID(id)
    if err != nil {
        ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    ctx.JSON(http.StatusOK, gin.H{"data": invoice})
}

func (c *InvoiceController) GetCustomers(ctx *gin.Context) {
    customers, err := c.invoiceService.GetAllCustomers()
    if err != nil {
        ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    ctx.JSON(http.StatusOK, gin.H{"data": customers})
}

func (c *InvoiceController) CreateCustomer(ctx *gin.Context) {
    var customer models.Customer
    if err := ctx.ShouldBindJSON(&customer); err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    if err := c.invoiceService.CreateCustomer(&customer); err != nil {
        ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    ctx.JSON(http.StatusCreated, gin.H{"data": customer})
}