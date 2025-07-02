package controllers

import (
    "net/http"
    "strconv"
    "backend/models"
    "backend/services"
    
    "github.com/gin-gonic/gin"
)

type CategoryController struct {
    categoryService *services.CategoryService
}

func NewCategoryController() *CategoryController {
    return &CategoryController{
        categoryService: services.NewCategoryService(),
    }
}

func (c *CategoryController) GetCategories(ctx *gin.Context) {
    categories, err := c.categoryService.GetAllCategories()
    if err != nil {
        ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    ctx.JSON(http.StatusOK, gin.H{"data": categories})
}

func (c *CategoryController) CreateCategory(ctx *gin.Context) {
    var category models.Category
    if err := ctx.ShouldBindJSON(&category); err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    if err := c.categoryService.CreateCategory(&category); err != nil {
        ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    ctx.JSON(http.StatusCreated, gin.H{"data": category})
}

func (c *CategoryController) UpdateCategory(ctx *gin.Context) {
    id, err := strconv.Atoi(ctx.Param("id"))
    if err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
        return
    }
    
    var category models.Category
    if err := ctx.ShouldBindJSON(&category); err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    category.CategoryID = id
    if err := c.categoryService.UpdateCategory(&category); err != nil {
        ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    ctx.JSON(http.StatusOK, gin.H{"data": category})
}

func (c *CategoryController) DeleteCategory(ctx *gin.Context) {
    id, err := strconv.Atoi(ctx.Param("id"))
    if err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
        return
    }
    
    if err := c.categoryService.DeleteCategory(id); err != nil {
        ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    ctx.JSON(http.StatusOK, gin.H{"message": "Category deleted successfully"})
}

func (c *CategoryController) GetCategory(ctx *gin.Context) {
    id, err := strconv.Atoi(ctx.Param("id"))
    if err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
        return
    }
    
    category, err := c.categoryService.GetCategoryByID(id)
    if err != nil {
        ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    ctx.JSON(http.StatusOK, gin.H{"data": category})
}