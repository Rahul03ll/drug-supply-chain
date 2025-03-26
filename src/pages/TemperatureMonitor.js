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
  InputLabel,
  Alert
} from '@mui/material';
import { Add as AddIcon, Warning, CheckCircle } from '@mui/icons-material';
import { getContract, CONTRACT_ADDRESSES } from '../utils/contracts';
import TemperatureMonitorABI from '../contracts/TemperatureMonitor.json';
import SupplyChainABI from '../contracts/SupplyChain.json';

const ALERT_STATUS = {
  0: 'Active',
  1: 'Resolved'
};

function TemperatureMonitor() {
  const [readings, setReadings] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newReading, setNewReading] = useState({
    batchId: '',
    temperature: ''
  });

  const fetchData = async () => {
    try {
      const tempMonitor = await getContract(CONTRACT_ADDRESSES.temperatureMonitor, TemperatureMonitorABI);
      const supplyChain = await getContract(CONTRACT_ADDRESSES.supplyChain, SupplyChainABI);

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
        location: batch.location,
        status: Number(batch.status)
      }));
      setBatches(formattedBatches);

      // Fetch temperature readings
      const totalReadings = await tempMonitor.getTotalReadings();
      const readingPromises = [];
      for (let i = 1; i <= totalReadings; i++) {
        readingPromises.push(tempMonitor.getReading(i));
      }
      const readingData = await Promise.all(readingPromises);
      const formattedReadings = readingData.map((reading, index) => ({
        id: index + 1,
        batchId: Number(reading.batchId),
        temperature: Number(reading.temperature),
        timestamp: Number(reading.timestamp),
        location: reading.location
      }));
      setReadings(formattedReadings);

      // Fetch alerts
      const totalAlerts = await tempMonitor.getTotalAlerts();
      const alertPromises = [];
      for (let i = 1; i <= totalAlerts; i++) {
        alertPromises.push(tempMonitor.getAlert(i));
      }
      const alertData = await Promise.all(alertPromises);
      const formattedAlerts = alertData.map((alert, index) => ({
        id: index + 1,
        batchId: Number(alert.batchId),
        temperature: Number(alert.temperature),
        timestamp: Number(alert.timestamp),
        status: Number(alert.status),
        location: alert.location
      }));
      setAlerts(formattedAlerts);

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
    setNewReading(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const tempMonitorContract = await getContract(CONTRACT_ADDRESSES.temperatureMonitor, TemperatureMonitorABI, true);
      const recordTx = await tempMonitorContract.recordTemperature(
        Number(newReading.batchId),
        Number(newReading.temperature)
      );
      await recordTx.wait();
      
      setOpenDialog(false);
      setNewReading({
        batchId: '',
        temperature: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error recording temperature:', error);
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      const tempMonitorContract = await getContract(CONTRACT_ADDRESSES.temperatureMonitor, TemperatureMonitorABI, true);
      const resolveTx = await tempMonitorContract.resolveAlert(alertId);
      await resolveTx.wait();
      fetchData();
    } catch (error) {
      console.error('Error resolving alert:', error);
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
          Temperature Monitor
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Record Temperature
        </Button>
      </Box>

      {alerts.some(alert => alert.status === 0) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          There are active temperature alerts that require attention!
        </Alert>
      )}

      <Typography variant="h6" gutterBottom>
        Temperature Alerts
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Alert ID</TableCell>
              <TableCell>Batch ID</TableCell>
              <TableCell>Temperature</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell>{alert.id}</TableCell>
                <TableCell>{alert.batchId}</TableCell>
                <TableCell>{alert.temperature}°C</TableCell>
                <TableCell>{alert.location}</TableCell>
                <TableCell>{new Date(alert.timestamp * 1000).toLocaleString()}</TableCell>
                <TableCell>{ALERT_STATUS[alert.status]}</TableCell>
                <TableCell>
                  <Button
                    startIcon={<CheckCircle />}
                    onClick={() => handleResolveAlert(alert.id)}
                    disabled={alert.status === 1}
                  >
                    Resolve
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" gutterBottom>
        Temperature Readings
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Reading ID</TableCell>
              <TableCell>Batch ID</TableCell>
              <TableCell>Temperature</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {readings.map((reading) => (
              <TableRow key={reading.id}>
                <TableCell>{reading.id}</TableCell>
                <TableCell>{reading.batchId}</TableCell>
                <TableCell>{reading.temperature}°C</TableCell>
                <TableCell>{reading.location}</TableCell>
                <TableCell>{new Date(reading.timestamp * 1000).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Record Temperature</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Batch</InputLabel>
            <Select
              name="batchId"
              value={newReading.batchId}
              onChange={handleInputChange}
              label="Batch"
            >
              {batches.map((batch) => (
                <MenuItem key={batch.id} value={batch.id}>
                  Batch #{batch.id} ({batch.location})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="temperature"
            label="Temperature (°C)"
            type="number"
            fullWidth
            value={newReading.temperature}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Record</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TemperatureMonitor; 