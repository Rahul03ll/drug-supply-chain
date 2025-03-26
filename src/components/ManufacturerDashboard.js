import React, { useState } from 'react';
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
  TableRow
} from '@mui/material';

function ManufacturerDashboard() {
  const [drugForm, setDrugForm] = useState({
    name: '',
    description: '',
    serialNumber: '',
    batchNumber: '',
    manufacturingDate: '',
    expiryDate: ''
  });

  const [drugs, setDrugs] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDrugForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here we'll add the blockchain interaction
    setDrugs(prev => [...prev, { ...drugForm, id: Date.now() }]);
    setDrugForm({
      name: '',
      description: '',
      serialNumber: '',
      batchNumber: '',
      manufacturingDate: '',
      expiryDate: ''
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Manufacturer Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }} elevation={3}>
            <Typography variant="h6" gutterBottom>
              Register New Drug
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Drug Name"
                name="name"
                value={drugForm.name}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={drugForm.description}
                onChange={handleInputChange}
                margin="normal"
                multiline
                rows={3}
                required
              />
              <TextField
                fullWidth
                label="Serial Number"
                name="serialNumber"
                value={drugForm.serialNumber}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Batch Number"
                name="batchNumber"
                value={drugForm.batchNumber}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Manufacturing Date"
                name="manufacturingDate"
                type="date"
                value={drugForm.manufacturingDate}
                onChange={handleInputChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                fullWidth
                label="Expiry Date"
                name="expiryDate"
                type="date"
                value={drugForm.expiryDate}
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
                Register Drug
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }} elevation={3}>
            <Typography variant="h6" gutterBottom>
              Registered Drugs
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Serial Number</TableCell>
                    <TableCell>Batch Number</TableCell>
                    <TableCell>Expiry Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {drugs.map((drug) => (
                    <TableRow key={drug.id}>
                      <TableCell>{drug.name}</TableCell>
                      <TableCell>{drug.serialNumber}</TableCell>
                      <TableCell>{drug.batchNumber}</TableCell>
                      <TableCell>{drug.expiryDate}</TableCell>
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

export default ManufacturerDashboard; 