import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Box,
  Alert,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import { useSupplyChain } from '../context/SupplyChainContext';

function ConsumerDashboard() {
  const { verifyDrug } = useSupplyChain();
  const [searchForm, setSearchForm] = useState({
    serialNumber: '',
    batchNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [drugInfo, setDrugInfo] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'success' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchForm(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setDrugInfo(null);
    setAlert({ show: false, message: '', severity: 'success' });

    try {
      const result = await verifyDrug(searchForm.serialNumber, searchForm.batchNumber);
      
      if (result.success) {
        setDrugInfo(result.drug);
        setAlert({
          show: true,
          message: 'Drug verification successful',
          severity: 'success'
        });
      } else {
        setAlert({
          show: true,
          message: result.message,
          severity: 'error'
        });
      }
    } catch (error) {
      setAlert({
        show: true,
        message: 'An error occurred during verification',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Consumer Dashboard
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

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Verify Drug
            </Typography>
            <Box component="form" onSubmit={handleSearch}>
              <TextField
                fullWidth
                label="Serial Number"
                name="serialNumber"
                value={searchForm.serialNumber}
                onChange={handleInputChange}
                margin="normal"
                required
                disabled={isLoading}
              />
              <TextField
                fullWidth
                label="Batch Number"
                name="batchNumber"
                value={searchForm.batchNumber}
                onChange={handleInputChange}
                margin="normal"
                required
                disabled={isLoading}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Verify Drug'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {drugInfo && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Drug Information
              </Typography>
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Name: {drugInfo.name}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Description: {drugInfo.description}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Serial Number: {drugInfo.serialNumber}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Batch Number: {drugInfo.batchNumber}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Manufacturing Date: {drugInfo.manufacturingDate}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Expiry Date: {drugInfo.expiryDate}
                </Typography>

                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  Current Status: <Chip 
                    label={drugInfo.currentStatus} 
                    color={drugInfo.currentStatus === 'Sold' ? 'error' : 'primary'}
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Last Known Location: {drugInfo.lastKnownLocation}
                </Typography>

                {drugInfo.shipmentDetails && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Shipment Details
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      Destination: {drugInfo.shipmentDetails.destination}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      Status: {drugInfo.shipmentDetails.status}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      Expected Delivery: {drugInfo.shipmentDetails.expectedDelivery}
                    </Typography>
                  </>
                )}

                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Supply Chain History
                </Typography>
                <Stepper orientation="vertical">
                  {drugInfo.path.map((step, index) => (
                    <Step key={index} active={true}>
                      <StepLabel>
                        <Typography variant="body2">{step.stage}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          Location: {step.location} | Date: {step.date} | Temp: {step.temperature}
                        </Typography>
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

export default ConsumerDashboard; 