package models

import "time"

type Category struct {
    CategoryID   int       `json:"category_id"`
    CategoryName string    `json:"category_name"`
    Description  string    `json:"description"`
}

type Item struct {
    ItemID      int     `json:"item_id"`
    ItemName    string  `json:"item_name"`     
    CategoryID  int     `json:"category_id"`     
    BasePrice   float64 `json:"base_price"`    
    Description string  `json:"description"`  
    Category    *Category `json:"category,omitempty"`
}

type Customer struct {
    CustomerID   int    `json:"customer_id"`
    CustomerName string `json:"customer_name"`
    Phone        string `json:"phone"`
    Email        string `json:"email"`
    Address      string `json:"address"`
}

type Invoice struct {
    InvoiceID     int           `json:"invoice_id"`
    InvoiceNumber string        `json:"invoice_number"`
    CustomerID    int           `json:"customer_id"`
    InvoiceDate   time.Time     `json:"invoice_date"`
    SubTotal      float64       `json:"sub_total"`
    TaxRate       float64       `json:"tax_rate"`
    TaxAmount     float64       `json:"tax_amount"`
    TotalAmount   float64       `json:"total_amount"`
    Customer      *Customer     `json:"customer,omitempty"`
    Items         []InvoiceItem `json:"items,omitempty"`
}

type InvoiceItem struct {
    InvoiceItemID int     `json:"invoice_item_id"`
    InvoiceID     int     `json:"invoice_id"`
    ItemID        int     `json:"item_id"`
    Quantity      int     `json:"quantity"`
    UnitPrice     float64 `json:"unit_price"`
    TotalPrice    float64 `json:"total_price"`
    Item          *Item   `json:"item,omitempty"`
}

type CreateInvoiceRequest struct {
    CustomerID int                    `json:"customer_id"`
    TaxRate    float64                `json:"tax_rate"`
    Items      []CreateInvoiceItemRequest `json:"items"`
}

type CreateInvoiceItemRequest struct {
    ItemID   int `json:"item_id"`
    Quantity int `json:"quantity"`
}