package services

import (
    "database/sql"
    "fmt"
    "backend/models"
    "backend/database"
)

type CustomerService struct {
    db *sql.DB
}

func NewCustomerService() *CustomerService {
    return &CustomerService{
        db: database.GetDB(),
    }
}

func (s *CustomerService) GetAllCustomers() ([]models.Customer, error) {
    query := `SELECT CustomerID, CustomerName, Phone, Email, Address FROM Customers ORDER BY CustomerName`
    
    rows, err := s.db.Query(query)
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    
    var customers []models.Customer
    for rows.Next() {
        var customer models.Customer
        var phone, email, address sql.NullString
        
        err := rows.Scan(&customer.CustomerID, &customer.CustomerName, &phone, &email, &address)
        if err != nil {
            return nil, err
        }
        
        customer.Phone = phone.String
        customer.Email = email.String
        customer.Address = address.String
        customers = append(customers, customer)
    }
    
    return customers, nil
}

func (s *CustomerService) CreateCustomer(customer *models.Customer) error {
    query := `
        INSERT INTO Customers (CustomerName, Phone, Email, Address)
        OUTPUT INSERTED.CustomerID
        VALUES (?, ?, ?, ?)
    `
    
    err := s.db.QueryRow(query, customer.CustomerName, customer.Phone, customer.Email, customer.Address).Scan(&customer.CustomerID)
    return err
}

func (s *CustomerService) UpdateCustomer(customer *models.Customer) error {
    query := `
        UPDATE Customers 
        SET CustomerName = ?, Phone = ?, Email = ?, Address = ?
        WHERE CustomerID = ?
    `
    
    _, err := s.db.Exec(query, customer.CustomerName, customer.Phone, customer.Email, customer.Address, customer.CustomerID)
    return err
}

func (s *CustomerService) DeleteCustomer(customerID int) error {
    // Check if customer has invoices
    var count int
    checkQuery := `SELECT COUNT(*) FROM Invoices WHERE CustomerID = ?`
    err := s.db.QueryRow(checkQuery, customerID).Scan(&count)
    if err != nil {
        return err
    }
    
    if count > 0 {
        return fmt.Errorf("cannot delete customer: they have %d invoices", count)
    }
    
    query := `DELETE FROM Customers WHERE CustomerID = ?`
    _, err = s.db.Exec(query, customerID)
    return err
}

func (s *CustomerService) GetCustomerByID(customerID int) (*models.Customer, error) {
    query := `SELECT CustomerID, CustomerName, Phone, Email, Address FROM Customers WHERE CustomerID = ?`
    
    var customer models.Customer
    var phone, email, address sql.NullString
    
    err := s.db.QueryRow(query, customerID).Scan(
        &customer.CustomerID, &customer.CustomerName, &phone, &email, &address,
    )
    if err != nil {
        return nil, err
    }
    
    customer.Phone = phone.String
    customer.Email = email.String
    customer.Address = address.String
    
    return &customer, nil
}