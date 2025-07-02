package services

import (
    "database/sql"
    "fmt"
    "backend/models"
    "backend/database"
    "time"
)

type InvoiceService struct {
    db *sql.DB
}

func NewInvoiceService() *InvoiceService {
    return &InvoiceService{
        db: database.GetDB(),
    }
}

func (s *InvoiceService) CreateInvoice(req *models.CreateInvoiceRequest) (*models.Invoice, error) {
    tx, err := s.db.Begin()
    if err != nil {
        return nil, err
    }
    defer tx.Rollback()
    
    // Generate invoice number
    invoiceNumber := fmt.Sprintf("INV-%d", time.Now().Unix())
    
    // Calculate totals
    var subTotal float64
    for _, item := range req.Items {
        var unitPrice float64
        err := tx.QueryRow("SELECT BasePrice FROM Items WHERE ItemID = ?", item.ItemID).Scan(&unitPrice)
        if err != nil {
            return nil, err
        }
        subTotal += unitPrice * float64(item.Quantity)
    }
    
    taxAmount := subTotal * (req.TaxRate / 100)
    totalAmount := subTotal + taxAmount
    
    // Create invoice
    var invoiceID int
    query := `
        INSERT INTO Invoices (InvoiceNumber, CustomerID, SubTotal, TaxRate, TaxAmount, TotalAmount)
        OUTPUT INSERTED.InvoiceID
        VALUES (?, ?, ?, ?, ?, ?)
    `
    
    err = tx.QueryRow(query, invoiceNumber, req.CustomerID, subTotal, req.TaxRate, taxAmount, totalAmount).Scan(&invoiceID)
    if err != nil {
        return nil, err
    }
    
    // Create invoice items
    for _, item := range req.Items {
        var unitPrice float64
        err := tx.QueryRow("SELECT BasePrice FROM Items WHERE ItemID = ?", item.ItemID).Scan(&unitPrice)
        if err != nil {
            return nil, err
        }
        
        totalPrice := unitPrice * float64(item.Quantity)
        
        _, err = tx.Exec(`
            INSERT INTO InvoiceItems (InvoiceID, ItemID, Quantity, UnitPrice, TotalPrice)
            VALUES (?, ?, ?, ?, ?)
        `, invoiceID, item.ItemID, item.Quantity, unitPrice, totalPrice)
        
        if err != nil {
            return nil, err
        }
    }
    
    err = tx.Commit()
    if err != nil {
        return nil, err
    }
    
    // Return created invoice
    return s.GetInvoiceByID(invoiceID)
}

func (s *InvoiceService) GetAllInvoices() ([]models.Invoice, error) {
    query := `
        SELECT i.InvoiceID, i.InvoiceNumber, i.CustomerID, i.InvoiceDate, 
               i.SubTotal, i.TaxRate, i.TaxAmount, i.TotalAmount,
               c.CustomerName, c.Phone, c.Email, c.Address
        FROM Invoices i
        LEFT JOIN Customers c ON i.CustomerID = c.CustomerID
    `
    
    rows, err := s.db.Query(query)
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    
    var invoices []models.Invoice
    for rows.Next() {
        var invoice models.Invoice
        var customer models.Customer
        
        err := rows.Scan(
            &invoice.InvoiceID, &invoice.InvoiceNumber, &invoice.CustomerID, &invoice.InvoiceDate,
            &invoice.SubTotal, &invoice.TaxRate, &invoice.TaxAmount, &invoice.TotalAmount,
            &customer.CustomerName, &customer.Phone, &customer.Email, &customer.Address,
        )
        if err != nil {
            return nil, err
        }
        
        customer.CustomerID = invoice.CustomerID
        invoice.Customer = &customer
        invoices = append(invoices, invoice)
    }
    
    return invoices, nil
}

func (s *InvoiceService) GetInvoiceByID(invoiceID int) (*models.Invoice, error) {
    // Get invoice details
    query := `
        SELECT i.InvoiceID, i.InvoiceNumber, i.CustomerID, i.InvoiceDate, 
               i.SubTotal, i.TaxRate, i.TaxAmount, i.TotalAmount,
               c.CustomerName, c.Phone, c.Email, c.Address
        FROM Invoices i
        LEFT JOIN Customers c ON i.CustomerID = c.CustomerID
        WHERE i.InvoiceID = ?
    `
    
    var invoice models.Invoice
    var customer models.Customer
    
    err := s.db.QueryRow(query, invoiceID).Scan(
        &invoice.InvoiceID, &invoice.InvoiceNumber, &invoice.CustomerID, &invoice.InvoiceDate,
        &invoice.SubTotal, &invoice.TaxRate, &invoice.TaxAmount, &invoice.TotalAmount,
        &customer.CustomerName, &customer.Phone, &customer.Email, &customer.Address,
    )
    if err != nil {
        return nil, err
    }
    
    customer.CustomerID = invoice.CustomerID
    invoice.Customer = &customer
    
    // Get invoice items
    itemsQuery := `
        SELECT ii.InvoiceItemID, ii.InvoiceID, ii.ItemID, ii.Quantity, ii.UnitPrice, ii.TotalPrice,
               i.ItemName, i.Description
        FROM InvoiceItems ii
        LEFT JOIN Items i ON ii.ItemID = i.ItemID
        WHERE ii.InvoiceID = ?
    `
    
    rows, err := s.db.Query(itemsQuery, invoiceID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    
    var items []models.InvoiceItem
    for rows.Next() {
        var item models.InvoiceItem
        var itemDetails models.Item
        
        err := rows.Scan(
            &item.InvoiceItemID, &item.InvoiceID, &item.ItemID, &item.Quantity,
            &item.UnitPrice, &item.TotalPrice,
            &itemDetails.ItemName, &itemDetails.Description,
        )
        if err != nil {
            return nil, err
        }
        
        itemDetails.ItemID = item.ItemID
        item.Item = &itemDetails
        items = append(items, item)
    }
    
    invoice.Items = items
    return &invoice, nil
}

func (s *InvoiceService) GetAllCustomers() ([]models.Customer, error) {
    query := `SELECT CustomerID, CustomerName, Phone, Email, Address FROM Customers ORDER BY CustomerName`
    
    rows, err := s.db.Query(query)
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    
    var customers []models.Customer
    for rows.Next() {
        var customer models.Customer
        err := rows.Scan(&customer.CustomerID, &customer.CustomerName, &customer.Phone, &customer.Email, &customer.Address)
        if err != nil {
            return nil, err
        }
        customers = append(customers, customer)
    }
    
    return customers, nil
}

func (s *InvoiceService) CreateCustomer(customer *models.Customer) error {
    query := `
        INSERT INTO Customers (CustomerName, Phone, Email, Address)
        OUTPUT INSERTED.CustomerID
        VALUES (?, ?, ?, ?)
    `
    
    err := s.db.QueryRow(query, customer.CustomerName, customer.Phone, customer.Email, customer.Address).Scan(&customer.CustomerID)
    return err
}