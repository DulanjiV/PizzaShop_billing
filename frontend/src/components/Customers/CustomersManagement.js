import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Alert
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { customersAPI } from '../../services/api';

const CustomersManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    email: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await customersAPI.getAll();
      setCustomers(response.data.data || []);
    } catch (error) {
      setError('Failed to load customers');
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingCustomer) {
        await customersAPI.update(editingCustomer.customer_id, formData);
        setSuccess('Customer updated successfully');
      } else {
        await customersAPI.create(formData);
        setSuccess('Customer created successfully');
      }
      setOpen(false);
      setEditingCustomer(null);
      setFormData({ customer_name: '', phone: '', email: '', address: '' });
      loadCustomers();
    } catch (error) {
      setError('Failed to save customer');
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      customer_name: customer.customer_name,
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || ''
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await customersAPI.delete(id);
        setSuccess('Customer deleted successfully');
        loadCustomers();
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to delete customer');
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCustomer(null);
    setFormData({ customer_name: '', phone: '', email: '', address: '' });
  };

  const isValidEmail = (email) => {
    return email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isFormValid = () => {
    return formData.customer_name.trim() !== '' && formData.phone !== '' && isValidEmail(formData.email);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Customers Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => setOpen(true)}
        sx={{ mb: 2 }}
      >
        Add New Customer
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.customer_id}>
                <TableCell>{customer.customer_name}</TableCell>
                <TableCell>{customer.phone || '-'}</TableCell>
                <TableCell>{customer.email || '-'}</TableCell>
                <TableCell>{customer.address || '-'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(customer)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(customer.customer_id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Customer Name"
            value={formData.customer_name}
            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
            margin="normal"
            inputProps={{ maxLength: 100 }}
            required
          />
          <TextField
            fullWidth
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ''); // Remove all non-digit characters
              if (value.length <= 10) {
                setFormData({ ...formData, phone: value });
              }
            }}
            margin="normal"
            required
            inputProps={{
              pattern: '[0-9]*',
              maxLength: 10
            }}
            error={formData.phone.length > 0 && formData.phone.length < 10}
            helperText={formData.phone.length > 0 && formData.phone.length < 10 ? 'Phone number must be 10 digits' : ''}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            margin="normal"
            inputProps={{ maxLength: 100 }}
            error={!isValidEmail(formData.email)}
            helperText={!isValidEmail(formData.email) ? 'Please enter a valid email' : ''}
          />
          <TextField
            fullWidth
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            margin="normal"
            inputProps={{ maxLength: 500 }}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!isFormValid()}>
            {editingCustomer ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomersManagement;