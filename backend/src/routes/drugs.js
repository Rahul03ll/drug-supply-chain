const express = require('express');
const Web3 = require('web3');
const path = require('path');
const fs = require('fs');

// Dynamically load contract JSON
const contractsDir = path.resolve(__dirname, '../../build/contracts');
const DrugRegistryContract = JSON.parse(
  fs.readFileSync(path.join(contractsDir, 'DrugRegistry.json'), 'utf8')
);

const router = express.Router();

// Initialize Web3 provider
const web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
const web3 = new Web3(web3Provider);

// Contract initialization function
async function getContractInstance() {
  try {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = DrugRegistryContract.networks[networkId];
    
    if (!deployedNetwork) {
      throw new Error('Contract not deployed on this network');
    }

    return new web3.eth.Contract(
      DrugRegistryContract.abi,
      deployedNetwork.address
    );
  } catch (error) {
    console.error('Contract initialization error:', error);
    throw error;
  }
}

// Create a new drug 
router.post('/', async (req, res) => {
  try {
    const drugRegistryContract = await getContractInstance();

    const {
      name,
      description,
      manufacturer,
      manufacturingDate,
      expiryDate,
      requiresTemperatureControl,
      minTemperature,
      maxTemperature
    } = req.body;

    // Validate input
    if (!name || !manufacturer) {
      return res.status(400).json({ message: 'Name and manufacturer are required' });
    }

    // Validate dates
    const manufacturingTimestamp = manufacturingDate ? Math.floor(new Date(manufacturingDate).getTime() / 1000) : null;
    const expiryTimestamp = expiryDate ? Math.floor(new Date(expiryDate).getTime() / 1000) : null;

    if (manufacturingTimestamp && expiryTimestamp && manufacturingTimestamp >= expiryTimestamp) {
      return res.status(400).json({ message: 'Manufacturing date must be before expiry date' });
    }

    // Get accounts
    const accounts = await web3.eth.getAccounts();

    // Call contract method to register drug
    const result = await drugRegistryContract.methods.registerDrug(
      name,
      description || '',
      manufacturer,
      manufacturingTimestamp || Math.floor(Date.now() / 1000),
      expiryTimestamp || 0,
      requiresTemperatureControl || false,
      minTemperature || 0,
      maxTemperature || 0
    ).send({ from: accounts[0] });

    res.status(201).json({
      message: 'Drug registered successfully',
      drugId: result.events.DrugRegistered.returnValues.drugId
    });
  } catch (error) {
    console.error('Error adding drug:', error);
    
    // Handle specific Web3 and contract-related errors
    if (error.message.includes('insufficient funds')) {
      return res.status(400).json({
        message: 'Insufficient blockchain account funds',
        error: error.message
      });
    }

    if (error.message.includes('revert')) {
      return res.status(400).json({
        message: 'Drug registration failed due to contract validation',
        error: error.message
      });
    }

    // Generic error response
    res.status(500).json({
      message: 'Failed to create drug',
      error: error.message
    });
  }
});

// Get all drugs
router.get('/', async (req, res) => {
  try {
    const drugRegistryContract = await getContractInstance();
    const totalDrugs = await drugRegistryContract.methods.getTotalDrugs().call();
    const drugs = [];

    for (let i = 1; i <= totalDrugs; i++) {
      const drug = await drugRegistryContract.methods.getDrug(i).call();
      drugs.push(drug);
    }

    res.json(drugs);
  } catch (error) {
    console.error('Error fetching drugs:', error);
    res.status(500).json({
      message: 'Failed to retrieve drugs',
      error: error.message
    });
  }
});

// Get a specific drug by ID
router.get('/:id', async (req, res) => {
  try {
    const drugRegistryContract = await getContractInstance();
    const drugId = req.params.id;

    // Validate drug ID
    if (!drugId || isNaN(parseInt(drugId))) {
      return res.status(400).json({ message: 'Invalid drug ID' });
    }

    const drug = await drugRegistryContract.methods.getDrug(drugId).call();

    // Check if drug exists
    if (!drug || drug.name === '') {
      return res.status(404).json({ message: `Drug with ID ${drugId} not found` });
    }

    res.json(drug);
  } catch (error) {
    console.error('Error fetching drug details:', error);
    res.status(500).json({
      message: 'Failed to retrieve drug details',
      error: error.message
    });
  }
});

// Update drug status 
router.patch('/:id/status', async (req, res) => {
  try {
    const drugRegistryContract = await getContractInstance();
    const drugId = req.params.id;
    const { status } = req.body;

    // Validate input
    if (!drugId || isNaN(parseInt(drugId))) {
      return res.status(400).json({ message: 'Invalid drug ID' });
    }

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    // Get accounts
    const accounts = await web3.eth.getAccounts();

    // Call contract method to update drug status
    const result = await drugRegistryContract.methods.updateDrugStatus(
      drugId, 
      status
    ).send({ from: accounts[0] });

    res.json({
      message: 'Drug status updated successfully',
      drugId: drugId,
      status: status
    });
  } catch (error) {
    console.error('Error updating drug status:', error);
    res.status(500).json({
      message: 'Failed to update drug status',
      error: error.message
    });
  }
});

// Verify drug 
router.get('/verify/:serialNumber/:batchNumber', async (req, res) => {
  try {
    const drugRegistryContract = await getContractInstance();
    const { serialNumber, batchNumber } = req.params;

    // Validate input
    if (!serialNumber || !batchNumber) {
      return res.status(400).json({ message: 'Serial number and batch number are required' });
    }

    // Get accounts
    const accounts = await web3.eth.getAccounts();

    // Call contract method to verify drug
    const isVerified = await drugRegistryContract.methods.verifyDrug(
      serialNumber, 
      batchNumber
    ).call({ from: accounts[0] });

    res.json({
      verified: isVerified,
      serialNumber,
      batchNumber
    });
  } catch (error) {
    console.error('Error verifying drug:', error);
    res.status(500).json({
      message: 'Failed to verify drug',
      error: error.message
    });
  }
});

module.exports = router;
