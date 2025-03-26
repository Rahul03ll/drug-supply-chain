import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  TextField,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Divider,
  CircularProgress,
  IconButton,
  Collapse,
  Card,
  CardContent
} from '@mui/material';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as LocalShippingIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { useSupplyChain } from '../context/SupplyChainContext';

// Row component for inventory items
function InventoryRow({ item }) {
  const [open, setOpen] = useState(false);

  // Calculate if stock is low (less than 10 units)
  const isLowStock = item.quantity < 10;
  // Calculate if item is near expiry (within 30 days)
  const daysToExpiry = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  const isNearExpiry = daysToExpiry < 30;

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          <Typography variant="subtitle2">{item.name}</Typography>
          {isLowStock && (
            <Chip
              icon={<WarningIcon />}
              label="Low Stock"
              size="small"
              color="warning"
              sx={{ mt: 1 }}
            />
          )}
          {isNearExpiry && (
            <Chip
              icon={<WarningIcon />}
              label="Near Expiry"
              size="small"
              color="error"
              sx={{ mt: 1, ml: 1 }}
            />
          )}
        </TableCell>
        <TableCell>{item.serialNumber}</TableCell>
        <TableCell>
          <Chip
            label={item.quantity}
            color={isLowStock ? "warning" : "primary"}
          />
        </TableCell>
        <TableCell>
          <Chip
            label={`${daysToExpiry} days`}
            color={isNearExpiry ? "error" : "success"}
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Product History
              </Typography>
              <Stepper orientation="vertical" sx={{ ml: 2 }}>
                {item.path.map((step, index) => (
                  <Step key={index} active={true}>
                    <StepLabel
                      icon={
                        step.stage === 'Manufacturing' ? <InventoryIcon /> :
                        step.stage === 'Distribution' ? <LocalShippingIcon /> :
                        step.stage === 'Delivered to Retailer' ? <CheckCircleIcon /> :
                        <ShoppingCartIcon />
                      }
                    >
                      <Typography variant="body2">{step.stage}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Location: {step.location} | Date: {step.date} | Temp: {step.temperature}
                      </Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function RetailerDashboard() {
  const { inventory, recordSale } = useSupplyChain();
  const [saleForm, setSaleForm] = useState({
    drugId: '',
    quantity: '',
    customerName: '',
    customerID: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSaleForm(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSale = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const selectedDrug = inventory.find(item => item.id === parseInt(saleForm.drugId));
      
      if (!selectedDrug) {
        throw new Error('Selected drug not found in inventory');
      }

      if (parseInt(saleForm.quantity) > selectedDrug.quantity) {
        throw new Error(`Insufficient quantity in inventory. Available: ${selectedDrug.quantity}`);
      }

      const sale = {
        id: Date.now(),
        ...saleForm,
        drugId: parseInt(saleForm.drugId),
        drugName: selectedDrug.name,
        date: new Date().toISOString().split('T')[0]
      };

      recordSale(sale);
      setSaleForm({
        drugId: '',
        quantity: '',
        customerName: '',
        customerID: ''
      });
      setAlert({
        show: true,
        message: 'Sale recorded successfully',
        severity: 'success'
      });
    } catch (error) {
      setAlert({
        show: true,
        message: error.message,
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter out items with zero quantity
  const availableInventory = inventory.filter(item => item.quantity > 0);
  
  // Calculate inventory statistics
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.quantity < 10).length;
  const nearExpiryItems = inventory.filter(item => {
    const daysToExpiry = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return daysToExpiry < 30;
  }).length;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Retailer Dashboard
      </Typography>

      {alert.show && (
        <Alert
          severity={alert.severity}
          sx={{ mb: 2 }}
          onClose={() => setAlert({ ...alert, show: false })}
        >
          {alert.message}
        </Alert>
      )}

      {/* Inventory Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Products
              </Typography>
              <Typography variant="h4">
                {totalItems}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Low Stock Items
              </Typography>
              <Typography variant="h4" color="warning.main">
                {lowStockItems}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Near Expiry Items
              </Typography>
              <Typography variant="h4" color="error.main">
                {nearExpiryItems}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Current Inventory
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>Drug Name</TableCell>
                    <TableCell>Serial Number</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Days to Expiry</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventory.map((item) => (
                    <InventoryRow key={item.id} item={item} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Record Sale
            </Typography>
            <Box component="form" onSubmit={handleSale}>
              <TextField
                select
                fullWidth
                label="Select Drug"
                name="drugId"
                value={saleForm.drugId}
                onChange={handleInputChange}
                margin="normal"
                required
                disabled={isLoading}
              >
                {availableInventory.map((drug) => (
                  <MenuItem key={drug.id} value={drug.id}>
                    {drug.name} - {drug.serialNumber} (Available: {drug.quantity})
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={saleForm.quantity}
                onChange={handleInputChange}
                margin="normal"
                required
                disabled={isLoading}
                InputProps={{ inputProps: { min: 1 } }}
              />
              <TextField
                fullWidth
                label="Customer Name"
                name="customerName"
                value={saleForm.customerName}
                onChange={handleInputChange}
                margin="normal"
                required
                disabled={isLoading}
              />
              <TextField
                fullWidth
                label="Customer ID"
                name="customerID"
                value={saleForm.customerID}
                onChange={handleInputChange}
                margin="normal"
                required
                disabled={isLoading}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Record Sale'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default RetailerDashboard; 