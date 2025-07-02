package controllers

import (
    "net/http"
    "strconv"
    "backend/models"
    "backend/services"
    
    "github.com/gin-gonic/gin"
)

type ItemController struct {
    itemService *services.ItemService
}

func NewItemController() *ItemController {
    return &ItemController{
        itemService: services.NewItemService(),
    }
}

func (c *ItemController) GetItems(ctx *gin.Context) {
    items, err := c.itemService.GetAllItems()
    if err != nil {
        ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    ctx.JSON(http.StatusOK, gin.H{"data": items})
}

func (c *ItemController) CreateItem(ctx *gin.Context) {
    var item models.Item
    if err := ctx.ShouldBindJSON(&item); err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    if err := c.itemService.CreateItem(&item); err != nil {
        ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    ctx.JSON(http.StatusCreated, gin.H{"data": item})
}

func (c *ItemController) UpdateItem(ctx *gin.Context) {
    id, err := strconv.Atoi(ctx.Param("id"))
    if err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid item ID"})
        return
    }
    
    var item models.Item
    if err := ctx.ShouldBindJSON(&item); err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    item.ItemID = id
    if err := c.itemService.UpdateItem(&item); err != nil {
        ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    ctx.JSON(http.StatusOK, gin.H{"data": item})
}

func (c *ItemController) DeleteItem(ctx *gin.Context) {
    id, err := strconv.Atoi(ctx.Param("id"))
    if err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid item ID"})
        return
    }
    
    if err := c.itemService.DeleteItem(id); err != nil {
        ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    ctx.JSON(http.StatusOK, gin.H{"message": "Item deleted successfully"})
}

func (c *ItemController) GetCategories(ctx *gin.Context) {
    categories, err := c.itemService.GetAllCategories()
    if err != nil {
        ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    ctx.JSON(http.StatusOK, gin.H{"data": categories})
}