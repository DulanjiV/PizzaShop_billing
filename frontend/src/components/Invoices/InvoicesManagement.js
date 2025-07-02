import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Alert, Grid,
  Card, CardContent
} from '@mui/material';
import { Add, Visibility, Print } from '@mui/icons-material';
import { invoicesAPI, customersAPI, itemsAPI } from '../../services/api';

const InvoicesManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [formData, setFormData] = useState({
    customer_id: '',
    tax_rate: 10,
    items: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadInvoices();
    loadCustomers();
    loadItems();
  }, []);

  const loadInvoices = async () => {
    try {
      const response = await invoicesAPI.getAll();
      setInvoices(response.data.data || []);
    } catch (error) {
      setError('Failed to load invoices');
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await customersAPI.getAll();
      setCustomers(response.data.data || []);
    } catch (error) {
      setError('Failed to load customers');
    }
  };

  const loadItems = async () => {
    try {
      const response = await itemsAPI.getAll();
      setItems(response.data.data || []);
    } catch (error) {
      setError('Failed to load items');
    }
  };

  const isFormValid = () => {
    // Check if customer is selected
    if (!formData.customer_id) {
      return false;
    }

    // Check if at least one item is added
    if (formData.items.length === 0) {
      return false;
    }

    // Check if all items have valid data
    const hasValidItems = formData.items.every(item =>
      item.item_id && item.quantity && item.quantity > 0
    );

    return hasValidItems; // FIXED: Added return statement
  };

  const handleSubmit = async () => {
    try {
      if (!formData.customer_id) {
        setError('Please select a customer');
        return;
      }

      if (formData.items.length === 0) {
        setError('Please add at least one item to the invoice');
        return;
      }

      // Check if all items are properly filled
      const invalidItems = formData.items.some(item => !item.item_id || !item.quantity || item.quantity <= 0);
      if (invalidItems) {
        setError('Please fill all item details and ensure quantities are greater than 0');
        return;
      }

      await invoicesAPI.create(formData);
      setSuccess('Invoice created successfully');
      setOpen(false);
      setFormData({ customer_id: '', tax_rate: 10, items: [] });
      loadInvoices();
    } catch (error) {
      setError('Failed to create invoice');
    }
  };

  const handleViewInvoice = async (invoiceId) => {
    try {
      const response = await invoicesAPI.getById(invoiceId);
      setSelectedInvoice(response.data.data);
      setViewOpen(true);
    } catch (error) {
      setError('Failed to load invoice details');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const addInvoiceItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item_id: '', quantity: 1 }]
    });
  };

  const updateInvoiceItem = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    setFormData({ ...formData, items: updatedItems });
  };

  const removeInvoiceItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Invoice Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => setOpen(true)}
        sx={{ mb: 2 }}
      >
        Create New Invoice
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>View</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.invoice_id}>
                <TableCell>{invoice.invoice_number}</TableCell>
                <TableCell>{invoice.customer?.customer_name}</TableCell>
                <TableCell>{new Date(invoice.invoice_date).toLocaleDateString()}</TableCell>
                <TableCell>LKR {invoice.total_amount.toFixed(2)}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleViewInvoice(invoice.invoice_id)}>
                    <Visibility />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Invoice Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Invoice</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Customer</InputLabel>
            <Select
              value={formData.customer_id}
              onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
            >
              {customers.map((customer) => (
                <MenuItem key={customer.customer_id} value={customer.customer_id}>
                  {customer.customer_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Tax Rate (%)"
            type="number"
            value={formData.tax_rate}
            onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) })}
            margin="normal"
          />

          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            Invoice Items
          </Typography>

          {formData.items.map((item, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
              <Grid item xs={9}>
                <FormControl fullWidth sx={{ minWidth: 300 }}>
                  <InputLabel>Item</InputLabel>
                  <Select
                    value={item.item_id}
                    onChange={(e) => updateInvoiceItem(index, 'item_id', e.target.value)}
                  >
                    {items.map((menuItem) => (
                      <MenuItem key={menuItem.item_id} value={menuItem.item_id}>
                        {menuItem.item_name} - LKR {menuItem.base_price}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={2}>
                <TextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateInvoiceItem(index, 'quantity', parseInt(e.target.value))}
                  sx={{ maxWidth: 100 }}
                />
              </Grid>
              <Grid item xs={3}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => removeInvoiceItem(index)}
                  fullWidth
                >
                  Remove
                </Button>
              </Grid>
            </Grid>
          ))}

          <Button variant="outlined" onClick={addInvoiceItem} sx={{ mt: 1 }}>
            Add Item
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!isFormValid()}>
            Create Invoice
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Invoice Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle className="print-hide">
          Invoice Details
          <IconButton onClick={handlePrint} sx={{ float: 'right' }}>
            <Print />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Card className="invoice-print">
              <CardContent>
                <div className="invoice-header">
                  <Typography variant="h4" gutterBottom>
                    Pizza Shop Billing System
                  </Typography>
                  <Typography variant="h6">
                    Invoice #{selectedInvoice.invoice_number}
                  </Typography>
                </div>

                <div className="invoice-details">
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Typography variant="h6" gutterBottom>Bill To:</Typography>
                      <Typography variant="body1">
                        <strong>{selectedInvoice.customer?.customer_name}</strong>
                      </Typography>
                      {selectedInvoice.customer?.phone && (
                        <Typography variant="body2">
                          Phone: {selectedInvoice.customer.phone}
                        </Typography>
                      )}
                      {selectedInvoice.customer?.email && (
                        <Typography variant="body2">
                          Email: {selectedInvoice.customer.email}
                        </Typography>
                      )}
                      {selectedInvoice.customer?.address && (
                        <Typography variant="body2">
                          Address: {selectedInvoice.customer.address}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                      <Typography variant="body1">
                        <strong>Invoice Date:</strong><br />
                        {new Date(selectedInvoice.invoice_date).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 2 }}>
                        <strong>Invoice Number:</strong><br />
                        {selectedInvoice.invoice_number}
                      </Typography>
                    </Grid>
                  </Grid>
                </div>

                <TableContainer sx={{ mt: 3 }} className="invoice-table">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Item Description</strong></TableCell>
                        <TableCell align="center"><strong>Quantity</strong></TableCell>
                        <TableCell align="right"><strong>Unit Price (LKR)</strong></TableCell>
                        <TableCell align="right"><strong>Total (LKR)</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedInvoice.items?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2">
                              <strong>{item.item?.item_name}</strong>
                            </Typography>
                            {item.item?.description && (
                              <Typography variant="caption" color="textSecondary">
                                {item.item.description}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">{item.quantity}</TableCell>
                          <TableCell align="right">{item.unit_price.toFixed(2)}</TableCell>
                          <TableCell align="right">{item.total_price.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box className="invoice-totals" sx={{ mt: 3, borderTop: '1px solid #ddd', pt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={8}></Grid>
                    <Grid item xs={4}>
                      <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Subtotal:</span>
                        <span>LKR {selectedInvoice.sub_total.toFixed(2)}</span>
                      </Typography>
                      <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Tax ({selectedInvoice.tax_rate}%):</span>
                        <span>LKR {selectedInvoice.tax_amount.toFixed(2)}</span>
                      </Typography>
                      <Typography variant="h6" sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: '2px solid #000' }}>
                        <span><strong>Total Amount:</strong></span>
                        <span><strong>LKR {selectedInvoice.total_amount.toFixed(2)}</strong></span>
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                <Box sx={{ mt: 8, textAlign: 'center', borderTop: '1px solid #ddd', pt: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Thank you!
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Generated on {new Date().toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </DialogContent>
        <DialogActions className="print-hide">
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvoicesManagement;