import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress
} from '@mui/material';
import { getContract, CONTRACT_ADDRESSES } from '../utils/contracts';
import DrugRegistryABI from '../contracts/DrugRegistry.json';

function ManufacturerDashboard() {
  const [drugForm, setDrugForm] = useState({
    name: '',
    description: '',
    serialNumber: '',
    batchNumber: '',
    manufacturingDate: '',
    expiryDate: '',
    requiresTemperatureControl: true,
    minTemperature: '',
    maxTemperature: ''
  });

  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchDrugs();
    setupEventListeners();
  }, []);

  const setupEventListeners = async () => {
    try {
      const drugRegistry = await getContract(CONTRACT_ADDRESSES.drugRegistry, DrugRegistryABI);
      drugRegistry.on("DrugRegistered", (drugId, name, manufacturer) => {
        setSuccess(`Drug ${name} registered successfully!`);
        fetchDrugs();
      });
    } catch (err) {
      console.error("Error setting up event listeners:", err);
    }
  };

  const fetchDrugs = async () => {
    try {
      const drugRegistry = await getContract(CONTRACT_ADDRESSES.drugRegistry, DrugRegistryABI);
      const totalDrugs = await drugRegistry.getTotalDrugs();
      const drugsList = [];
      
      for (let i = 1; i <= totalDrugs; i++) {
        const drug = await drugRegistry.drugs(i);
        if (drug.registeredBy === window.ethereum.selectedAddress) {
          drugsList.push(drug);
        }
      }
      
      setDrugs(drugsList);
    } catch (err) {
      setError("Error fetching drugs: " + err.message);
    }
  };

  const validateForm = () => {
    if (!drugForm.name || !drugForm.description) {
      throw new Error("Name and description are required");
    }
    if (new Date(drugForm.manufacturingDate) >= new Date(drugForm.expiryDate)) {
      throw new Error("Manufacturing date must be before expiry date");
    }
    if (!drugForm.minTemperature || !drugForm.maxTemperature) {
      throw new Error("Temperature range is required");
    }
    if (Number(drugForm.minTemperature) >= Number(drugForm.maxTemperature)) {
      throw new Error("Minimum temperature must be less than maximum temperature");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDrugForm(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      validateForm();
      
      const drugRegistry = await getContract(CONTRACT_ADDRESSES.drugRegistry, DrugRegistryABI);
      const tx = await drugRegistry.registerDrug(
        drugForm.name,
        drugForm.description,
        drugForm.serialNumber,
        new Date(drugForm.manufacturingDate).getTime() / 1000,
        new Date(drugForm.expiryDate).getTime() / 1000,
        drugForm.requiresTemperatureControl,
        Number(drugForm.minTemperature),
        Number(drugForm.maxTemperature)
      );
      
      await tx.wait();
      
      setDrugForm({
        name: '',
        description: '',
        serialNumber: '',
        batchNumber: '',
        manufacturingDate: '',
        expiryDate: '',
        requiresTemperatureControl: true,
        minTemperature: '',
        maxTemperature: ''
      });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Manufacturer Dashboard
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Register New Drug
              </Typography>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Drug Name"
                      name="name"
                      value={drugForm.name}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={drugForm.description}
                      onChange={handleInputChange}
                      multiline
                      rows={3}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Serial Number"
                      name="serialNumber"
                      value={drugForm.serialNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Batch Number"
                      name="batchNumber"
                      value={drugForm.batchNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Manufacturing Date"
                      name="manufacturingDate"
                      value={drugForm.manufacturingDate}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Expiry Date"
                      name="expiryDate"
                      value={drugForm.expiryDate}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Min Temperature (°C)"
                      name="minTemperature"
                      value={drugForm.minTemperature}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Max Temperature (°C)"
                      name="maxTemperature"
                      value={drugForm.maxTemperature}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : "Register Drug"}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Registered Drugs
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Serial Number</TableCell>
                      <TableCell>Expiry Date</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {drugs.map((drug) => (
                      <TableRow key={drug.id}>
                        <TableCell>{drug.name}</TableCell>
                        <TableCell>{drug.serialNumber}</TableCell>
                        <TableCell>
                          {new Date(drug.expiryDate * 1000).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {drug.isActive ? "Active" : "Inactive"}
                        </TableCell>
                      </TableRow>
                    ))}
                    {drugs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No drugs registered yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default ManufacturerDashboard;