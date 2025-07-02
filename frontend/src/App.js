import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout/Layout';
import ItemsManagement from './components/Items/ItemsManagement';
import CategoriesManagement from './components/Categories/CategoriesManagement';
import CustomersManagement from './components/Customers/CustomersManagement';
import InvoicesManagement from './components/Invoices/InvoicesManagement';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/items" replace />} />
            <Route path="/items" element={<ItemsManagement />} />
            <Route path="/categories" element={<CategoriesManagement />} />
            <Route path="/customers" element={<CustomersManagement />} />
            <Route path="/invoices" element={<InvoicesManagement />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;