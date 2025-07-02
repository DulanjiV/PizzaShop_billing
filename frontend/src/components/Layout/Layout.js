import { AppBar, Toolbar, Typography, Container, Box, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Categories', path: '/categories' },
    { label: 'Items', path: '/items' },
    { label: 'Customers', path: '/customers' },
    { label: 'Invoices', path: '/invoices' },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Pizza Shop Billing System
          </Typography>
          {menuItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              onClick={() => navigate(item.path)}
              sx={{
                backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent'
              }}
            >
              {item.label}
            </Button>
          ))}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;