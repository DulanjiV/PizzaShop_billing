package services

import (
    "database/sql"
    "fmt"
    "backend/models"
    "backend/database"
)

type ItemService struct {
    db *sql.DB
}

func NewItemService() *ItemService {
    return &ItemService{
        db: database.GetDB(),
    }
}

func (s *ItemService) GetAllItems() ([]models.Item, error) {
    query := `
        SELECT i.ItemID, i.ItemName, i.CategoryID, i.BasePrice, i.Description, c.CategoryName
        FROM Items i
        LEFT JOIN Categories c ON i.CategoryID = c.CategoryID
        ORDER BY i.ItemName
    `
    // This query retrieves all items along with their category names.
    rows, err := s.db.Query(query)
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    
    var items []models.Item
    for rows.Next() {
        var item models.Item
        var category models.Category
        
        // Scan the row into the item and category fields
        err := rows.Scan(
            &item.ItemID, &item.ItemName, &item.CategoryID, &item.BasePrice,
            &item.Description,
            &category.CategoryName,
        )
        if err != nil {
            return nil, err
        }
        
        category.CategoryID = item.CategoryID
        item.Category = &category
        items = append(items, item) 
    }
    
    return items, nil
}

func (s *ItemService) CreateItem(item *models.Item) error {
    query := `
        INSERT INTO Items (ItemName, CategoryID, BasePrice, Description)
        OUTPUT INSERTED.ItemID
        VALUES (?, ?, ?, ?)
    `
    
    err := s.db.QueryRow(query, item.ItemName, item.CategoryID, item.BasePrice, item.Description).Scan(&item.ItemID)
    return err
}

func (s *ItemService) UpdateItem(item *models.Item) error {
    query := `
        UPDATE Items 
        SET ItemName = ?, CategoryID = ?, BasePrice = ?, Description = ?
        WHERE ItemID = ?
    `
    
    _, err := s.db.Exec(query, item.ItemName, item.CategoryID, item.BasePrice, item.Description, item.ItemID)
    return err
}

func (s *ItemService) DeleteItem(itemID int) error {
    // Check if item is used in any invoices
    var count int
    checkQuery := `SELECT COUNT(*) FROM InvoiceItems WHERE ItemID = ?`
    err := s.db.QueryRow(checkQuery, itemID).Scan(&count)
    if err != nil {
        return err
    }
    
    if count > 0 {
        return fmt.Errorf("cannot delete item: they have %d invoice item", count)
    }
    
    query := `DELETE FROM Items WHERE ItemID = ?`
    _, err = s.db.Exec(query, itemID)
    return err
}

func (s *ItemService) GetAllCategories() ([]models.Category, error) {
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