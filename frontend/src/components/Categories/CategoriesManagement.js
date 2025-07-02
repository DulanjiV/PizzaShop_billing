import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Alert
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { categoriesAPI } from '../../services/api';

const CategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    category_name: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

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
      if (editingCategory) {
        await categoriesAPI.update(editingCategory.category_id, formData);
        setSuccess('Category updated successfully');
      } else {
        await categoriesAPI.create(formData);
        setSuccess('Category created successfully');
      }
      setOpen(false);
      setEditingCategory(null);
      setFormData({ category_name: '', description: '' });
      loadCategories();
    } catch (error) {
      setError('Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      category_name: category.category_name,
      description: category.description
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoriesAPI.delete(id);
        setSuccess('Category deleted successfully');
        loadCategories();
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to delete category');
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCategory(null);
    setFormData({ category_name: '', description: '' });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Categories Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => setOpen(true)}
        sx={{ mb: 2 }}
      >
        Add New Category
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Category Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.category_id}>
                <TableCell>{category.category_name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(category)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(category.category_id)}>
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
          {editingCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Category Name"
            value={formData.category_name}
            onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
            margin="normal"
            inputProps={{ maxLength: 100 }}
            required
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
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.category_name}>
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoriesManagement;