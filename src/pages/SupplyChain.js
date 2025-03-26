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
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { Add as AddIcon, LocalShipping } from '@mui/icons-material';
import { getContract, CONTRACT_ADDRESSES } from '../utils/contracts';
import SupplyChainABI from '../contracts/SupplyChain.json';
import DrugRegistryABI from '../contracts/DrugRegistry.json';

const BATCH_STATUS = {
  0: 'Created',
  1: 'In Transit',
  2: 'Delivered',
  3: 'Sold',
  4: 'Recalled'
};

function SupplyChain() {
  const [batches, setBatches] = useState([]);
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openTransferDialog, setOpenTransferDialog] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [newBatch, setNewBatch] = useState({
    drugId: '',
    quantity: '',
    location: ''
  });
  const [transferDetails, setTransferDetails] = useState({
    to: '',
    newLocation: ''
  });

  const fetchData = async () => {
    try {
      const drugRegistry = await getContract(CONTRACT_ADDRESSES.drugRegistry, DrugRegistryABI);
      const supplyChain = await getContract(CONTRACT_ADDRESSES.supplyChain, SupplyChainABI);

      // Fetch drugs
      const totalDrugs = await drugRegistry.getTotalDrugs();
      const drugPromises = [];
      for (let i = 1; i <= totalDrugs; i++) {
        drugPromises.push(drugRegistry.getDrug(i));
      }
      const drugData = await Promise.all(drugPromises);
      const formattedDrugs = drugData.map((drug, index) => ({
        id: index + 1,
        name: drug.name,
        manufacturer: drug.manufacturer
      }));
      setDrugs(formattedDrugs);

      // Fetch batches
      const totalBatches = await supplyChain.getTotalBatches();
      const batchPromises = [];
      for (let i = 1; i <= totalBatches; i++) {
        batchPromises.push(supplyChain.getBatch(i));
      }
      const batchData = await Promise.all(batchPromises);
      const formattedBatches = batchData.map((batch, index) => ({
        id: index + 1,
        drugId: Number(batch.drugId),
        quantity: Number(batch.quantity),
        location: batch.location,
        status: Number(batch.status),
        currentHolder: batch.currentHolder
      }));
      setBatches(formattedBatches);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewBatch(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTransferInputChange = (event) => {
    const { name, value } = event.target;
    setTransferDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const supplyChainContract = await getContract(CONTRACT_ADDRESSES.supplyChain, SupplyChainABI, true);
      const createTx = await supplyChainContract.createBatch(
        Number(newBatch.drugId),
        Number(newBatch.quantity),
        newBatch.location
      );
      await createTx.wait();
      
      setOpenDialog(false);
      setNewBatch({
        drugId: '',
        quantity: '',
        location: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error creating batch:', error);
    }
  };

  const handleTransfer = async () => {
    try {
      const supplyChainContract = await getContract(CONTRACT_ADDRESSES.supplyChain, SupplyChainABI, true);
      const transferTx = await supplyChainContract.transferBatch(
        selectedBatch.id,
        transferDetails.to,
        transferDetails.newLocation
      );
      await transferTx.wait();
      
      setOpenTransferDialog(false);
      setSelectedBatch(null);
      setTransferDetails({
        to: '',
        newLocation: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error transferring batch:', error);
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
          Supply Chain
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Create New Batch
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Batch ID</TableCell>
              <TableCell>Drug</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Current Holder</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {batches.map((batch) => (
              <TableRow key={batch.id}>
                <TableCell>{batch.id}</TableCell>
                <TableCell>
                  {drugs.find(d => d.id === batch.drugId)?.name || 'Unknown'}
                </TableCell>
                <TableCell>{batch.quantity}</TableCell>
                <TableCell>{batch.location}</TableCell>
                <TableCell>{BATCH_STATUS[batch.status]}</TableCell>
                <TableCell>{batch.currentHolder}</TableCell>
                <TableCell>
                  <Button
                    startIcon={<LocalShipping />}
                    onClick={() => {
                      setSelectedBatch(batch);
                      setOpenTransferDialog(true);
                    }}
                    disabled={batch.status === 3 || batch.status === 4}
                  >
                    Transfer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Batch Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Batch</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Drug</InputLabel>
            <Select
              name="drugId"
              value={newBatch.drugId}
              onChange={handleInputChange}
              label="Drug"
            >
              {drugs.map((drug) => (
                <MenuItem key={drug.id} value={drug.id}>
                  {drug.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="quantity"
            label="Quantity"
            type="number"
            fullWidth
            value={newBatch.quantity}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="location"
            label="Location"
            fullWidth
            value={newBatch.location}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={openTransferDialog} onClose={() => setOpenTransferDialog(false)}>
        <DialogTitle>Transfer Batch</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="to"
            label="Recipient Address"
            fullWidth
            value={transferDetails.to}
            onChange={handleTransferInputChange}
          />
          <TextField
            margin="dense"
            name="newLocation"
            label="New Location"
            fullWidth
            value={transferDetails.newLocation}
            onChange={handleTransferInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTransferDialog(false)}>Cancel</Button>
          <Button onClick={handleTransfer} variant="contained">Transfer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SupplyChain; 