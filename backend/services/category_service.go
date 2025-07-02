package services

import (
    "database/sql"
    "fmt"
    "backend/models"
    "backend/database"
)

type CategoryService struct {
    db *sql.DB
}

func NewCategoryService() *CategoryService {
    return &CategoryService{
        db: database.GetDB(),
    }
}

func (s *CategoryService) GetAllCategories() ([]models.Category, error) {
    query := `SELECT CategoryID, CategoryName, Description FROM Categories ORDER BY CategoryName`
    
    rows, err := s.db.Query(query)
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    
    var categories []models.Category
    for rows.Next() {
        var category models.Category
        err := rows.Scan(&category.CategoryID, &category.CategoryName, &category.Description)
        if err != nil {
            return nil, err
        }
        categories = append(categories, category)
    }
    
    return categories, nil
}

func (s *CategoryService) CreateCategory(category *models.Category) error {
    query := `
        INSERT INTO Categories (CategoryName, Description)
        OUTPUT INSERTED.CategoryID
        VALUES (?, ?)
    `
    
    err := s.db.QueryRow(query, category.CategoryName, category.Description).Scan(&category.CategoryID)
    return err
}

func (s *CategoryService) UpdateCategory(category *models.Category) error {
    query := `
        UPDATE Categories 
        SET CategoryName = ?, Description = ?
        WHERE CategoryID = ?
    `
    
    _, err := s.db.Exec(query, category.CategoryName, category.Description, category.CategoryID)
    return err
}

func (s *CategoryService) DeleteCategory(categoryID int) error {
    // Check if category has items
    var count int
    checkQuery := `SELECT COUNT(*) FROM Items WHERE CategoryID = ?`
    err := s.db.QueryRow(checkQuery, categoryID).Scan(&count)
    if err != nil {
        return err
    }
    
    if count > 0 {
        return fmt.Errorf("cannot delete category: it has %d active items", count)
    }
    
    query := `DELETE FROM Categories WHERE CategoryID = ?`
    _, err = s.db.Exec(query, categoryID)
    return err
}

func (s *CategoryService) GetCategoryByID(categoryID int) (*models.Category, error) {
    query := `SELECT CategoryID, CategoryName, Description FROM Categories WHERE CategoryID = ?`
    
    var category models.Category
    err := s.db.QueryRow(query, categoryID).Scan(
        &category.CategoryID, &category.CategoryName, &category.Description,
    )
    if err != nil {
        return nil, err
    }
    
    return &category, nil
}