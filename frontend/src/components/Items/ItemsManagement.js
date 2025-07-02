import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Alert
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { itemsAPI, categoriesAPI } from '../../services/api';

const ItemsManagement = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    item_name: '',
    category_id: '',
    base_price: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadItems();
    loadCategories();
  }, []);

  const loadItems = async () => {
    try {
      const response = await itemsAPI.getAll();
      setItems(response.data.data || []);
    } catch (error) {
      setError('Failed to load items');
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data.data || []);
    } catch (error) {
      setError('Failed to load categories');
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.item_name.trim()) {
        setError('Item name is required');
        return;
      }
      if (!formData.category_id) {
        setError('Category is required');
        return;
      }
      if (!formData.base_price || parseFloat(formData.base_price) <= 0) {
        setError('Valid price is required');
        return;
      }

      // Convert data types for the API
      const submitData = {
        item_name: formData.item_name.trim(),
        category_id: parseInt(formData.category_id),
        base_price: parseFloat(formData.base_price),
        description: formData.description.trim()
      };

      if (editingItem) {
        await itemsAPI.update(editingItem.item_id, submitData);
        setSuccess('Item updated successfully');
      } else {
        await itemsAPI.create(submitData);
        setSuccess('Item created successfully');
      }
      setOpen(false);
      setEditingItem(null);
      setFormData({ item_name: '', category_id: '', base_price: '', description: '' });
      loadItems();
    } catch (error) {
      console.error('Submit error:', error);
      setError(error.response?.data?.error || 'Failed to save item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      item_name: item.item_name,
      category_id: item.category_id.toString(),
      base_price: item.base_price.toString(),
      description: item.description || ''
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await itemsAPI.delete(id);
        setSuccess('Item deleted successfully');
        loadItems();
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to delete item');
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingItem(null);
    setFormData({ item_name: '', category_id: '', base_price: '', description: '' });
    setError('');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Items Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => setOpen(true)}
        sx={{ mb: 2 }}
      >
        Add New Item
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.item_id}>
                <TableCell>{item.item_name}</TableCell>
                <TableCell>{item.category?.category_name}</TableCell>
                <TableCell>LKR {item.base_price.toFixed(2)}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(item)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(item.item_id)}>
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
          {editingItem ? 'Edit Item' : 'Add New Item'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Item Name"
            value={formData.item_name}
            onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
            margin="normal"
            inputProps={{ maxLength: 100 }}
            required
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            >
              {categories.map((category) => (
                <MenuItem key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Price"
            type="number"
            value={formData.base_price}
            onChange={(e) => {
              const value = e.target.value;
              // Allow empty value for clearing
              if (value === '') {
                setFormData({ ...formData, base_price: value });
                return;
              }
              
              // Check if value has more than 2 decimal places
              const regex = /^\d*\.?\d{0,2}$/;
              if (regex.test(value)) {
                setFormData({ ...formData, base_price: value });
              }
            }}
            margin="normal"
            required
            inputProps={{ step: "0.01", min: "0" }}
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            inputProps={{ maxLength: 500 }}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.item_name.trim() || !formData.category_id || !formData.base_price}
          >
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ItemsManagement;