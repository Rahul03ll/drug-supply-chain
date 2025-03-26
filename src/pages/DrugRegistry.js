import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { getContract, CONTRACT_ADDRESSES } from '../utils/contracts';
import DrugRegistryABI from '../contracts/DrugRegistry.json';

function DrugRegistry() {
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newDrug, setNewDrug] = useState({
    name: '',
    manufacturer: '',
    expiryPeriod: '',
    minTemp: '',
    maxTemp: ''
  });

  const fetchDrugs = async () => {
    try {
      const contract = await getContract(CONTRACT_ADDRESSES.drugRegistry, DrugRegistryABI, true);
      const totalDrugs = await contract.getTotalDrugs();
      
      const drugPromises = [];
      for (let i = 1; i <= totalDrugs; i++) {
        drugPromises.push(contract.getDrug(i));
      }
      
      const drugData = await Promise.all(drugPromises);
      const formattedDrugs = drugData.map((drug, index) => ({
        id: index + 1,
        name: drug.name,
        manufacturer: drug.manufacturer,
        expiryPeriod: Number(drug.expiryPeriod),
        minTemp: Number(drug.minTemp),
        maxTemp: Number(drug.maxTemp)
      }));
      
      setDrugs(formattedDrugs);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching drugs:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrugs();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewDrug(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const contract = await getContract(CONTRACT_ADDRESSES.drugRegistry, DrugRegistryABI, true);
      const tx = await contract.registerDrug(
        newDrug.name,
        newDrug.manufacturer,
        Number(newDrug.expiryPeriod),
        Number(newDrug.minTemp),
        Number(newDrug.maxTemp)
      );
      await tx.wait();
      
      setOpenDialog(false);
      setNewDrug({
        name: '',
        manufacturer: '',
        expiryPeriod: '',
        minTemp: '',
        maxTemp: ''
      });
      fetchDrugs();
    } catch (error) {
      console.error('Error registering drug:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Drug Registry
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Register New Drug
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Manufacturer</TableCell>
              <TableCell>Expiry Period (days)</TableCell>
              <TableCell>Min Temp (°C)</TableCell>
              <TableCell>Max Temp (°C)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {drugs.map((drug) => (
              <TableRow key={drug.id}>
                <TableCell>{drug.id}</TableCell>
                <TableCell>{drug.name}</TableCell>
                <TableCell>{drug.manufacturer}</TableCell>
                <TableCell>{drug.expiryPeriod}</TableCell>
                <TableCell>{drug.minTemp}</TableCell>
                <TableCell>{drug.maxTemp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Register New Drug</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="name"
            label="Drug Name"
            fullWidth
            value={newDrug.name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="manufacturer"
            label="Manufacturer"
            fullWidth
            value={newDrug.manufacturer}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="expiryPeriod"
            label="Expiry Period (days)"
            type="number"
            fullWidth
            value={newDrug.expiryPeriod}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="minTemp"
            label="Minimum Temperature (°C)"
            type="number"
            fullWidth
            value={newDrug.minTemp}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="maxTemp"
            label="Maximum Temperature (°C)"
            type="number"
            fullWidth
            value={newDrug.maxTemp}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Register</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DrugRegistry; 