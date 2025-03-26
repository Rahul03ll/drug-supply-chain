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
  MenuItem
} from '@mui/material';

function DistributorDashboard() {
  const [shipments, setShipments] = useState([]);
  const [shipmentForm, setShipmentForm] = useState({
    drugId: '',
    quantity: '',
    destination: '',
    temperature: '',
    shipmentDate: '',
    expectedDelivery: ''
  });

  // Mock data for available drugs
  const availableDrugs = [
    { id: '1', name: 'Drug A' },
    { id: '2', name: 'Drug B' },
    { id: '3', name: 'Drug C' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShipmentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here we'll add the blockchain interaction
    setShipments(prev => [...prev, {
      ...shipmentForm,
      id: Date.now(),
      status: 'In Transit',
      drug: availableDrugs.find(drug => drug.id === shipmentForm.drugId)?.name
    }]);
    setShipmentForm({
      drugId: '',
      quantity: '',
      destination: '',
      temperature: '',
      shipmentDate: '',
      expectedDelivery: ''
    });
  };

  const updateShipmentStatus = (shipmentId, newStatus) => {
    setShipments(prev =>
      prev.map(shipment =>
        shipment.id === shipmentId
          ? { ...shipment, status: newStatus }
          : shipment
      )
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Distributor Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }} elevation={3}>
            <Typography variant="h6" gutterBottom>
              Create New Shipment
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                select
                fullWidth
                label="Select Drug"
                name="drugId"
                value={shipmentForm.drugId}
                onChange={handleInputChange}
                margin="normal"
                required
              >
                {availableDrugs.map((drug) => (
                  <MenuItem key={drug.id} value={drug.id}>
                    {drug.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={shipmentForm.quantity}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Destination"
                name="destination"
                value={shipmentForm.destination}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Temperature (°C)"
                name="temperature"
                type="number"
                value={shipmentForm.temperature}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Shipment Date"
                name="shipmentDate"
                type="date"
                value={shipmentForm.shipmentDate}
                onChange={handleInputChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                fullWidth
                label="Expected Delivery"
                name="expectedDelivery"
                type="date"
                value={shipmentForm.expectedDelivery}
                onChange={handleInputChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                required
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                fullWidth
              >
                Create Shipment
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }} elevation={3}>
            <Typography variant="h6" gutterBottom>
              Active Shipments
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Drug</TableCell>
                    <TableCell>Destination</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell>{shipment.drug}</TableCell>
                      <TableCell>{shipment.destination}</TableCell>
                      <TableCell>{shipment.status}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => updateShipmentStatus(shipment.id, 'Delivered')}
                          disabled={shipment.status === 'Delivered'}
                        >
                          Mark Delivered
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default DistributorDashboard; 