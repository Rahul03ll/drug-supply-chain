import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, CircularProgress } from '@mui/material';
import { MedicalServices, LocalShipping, Warning } from '@mui/icons-material';
import { getContract, CONTRACT_ADDRESSES } from '../utils/contracts';
import DrugRegistryABI from '../contracts/DrugRegistry.json';
import SupplyChainABI from '../contracts/SupplyChain.json';
import TemperatureMonitorABI from '../contracts/TemperatureMonitor.json';

function StatCard({ title, value, icon, isLoading }) {
  return (
    <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Typography variant="h6" component="div" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      {isLoading ? (
        <CircularProgress size={24} />
      ) : (
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      )}
    </Paper>
  );
}

function Dashboard() {
  const [stats, setStats] = useState({
    totalDrugs: 0,
    activeBatches: 0,
    activeAlerts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const drugRegistry = await getContract(CONTRACT_ADDRESSES.drugRegistry, DrugRegistryABI);
        const supplyChain = await getContract(CONTRACT_ADDRESSES.supplyChain, SupplyChainABI);
        const tempMonitor = await getContract(CONTRACT_ADDRESSES.temperatureMonitor, TemperatureMonitorABI);

        const [totalDrugs, activeBatches, activeAlerts] = await Promise.all([
          drugRegistry.getTotalDrugs(),
          supplyChain.getTotalBatches(),
          tempMonitor.getActiveAlerts()
        ]);

        setStats({
          totalDrugs: Number(totalDrugs),
          activeBatches: Number(activeBatches),
          activeAlerts: activeAlerts.length
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Registered Drugs"
            value={stats.totalDrugs}
            icon={<MedicalServices color="primary" fontSize="large" />}
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Active Batches"
            value={stats.activeBatches}
            icon={<LocalShipping color="primary" fontSize="large" />}
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Active Temperature Alerts"
            value={stats.activeAlerts}
            icon={<Warning color="error" fontSize="large" />}
            isLoading={loading}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard; 