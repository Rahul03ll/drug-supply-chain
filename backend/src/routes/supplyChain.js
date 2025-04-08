const express = require('express');
const Web3 = require('web3');
const path = require('path');
const fs = require('fs');

// Dynamically load contract JSON
const contractsDir = path.resolve(__dirname, '../../build/contracts');
const SupplyChainContract = JSON.parse(
  fs.readFileSync(path.join(contractsDir, 'SupplyChain.json'), 'utf8')
);

const router = express.Router();

// Initialize Web3 provider
const web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
const web3 = new Web3(web3Provider);

// Contract initialization function
async function getContractInstance() {
  try {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = SupplyChainContract.networks[networkId];
    
    if (!deployedNetwork) {
      throw new Error('Contract not deployed on this network');
    }

    return new web3.eth.Contract(
      SupplyChainContract.abi,
      deployedNetwork.address
    );
  } catch (error) {
    console.error('Contract initialization error:', error);
    throw error;
  }
}

// Get shipment count
router.get('/shipments/count', async (req, res) => {
  try {
    const supplyChainContract = await getContractInstance();
    const shipmentCount = await supplyChainContract.methods.getShipmentCount().call();
    res.json({ count: shipmentCount });
  } catch (error) {
    console.error('Error fetching shipment count:', error);
    res.status(500).json({
      message: 'Failed to retrieve shipment count',
      error: error.message
    });
  }
});

// Get shipment details
router.get('/shipments/:shipmentId', async (req, res) => {
  try {
    const supplyChainContract = await getContractInstance();
    const { shipmentId } = req.params;

    // Validate shipment ID
    if (!shipmentId || isNaN(parseInt(shipmentId))) {
      return res.status(400).json({ message: 'Invalid shipment ID' });
    }

    const shipmentDetails = await supplyChainContract.methods.getShipmentDetails(shipmentId).call();

    // Check if shipment exists
    if (!shipmentDetails || shipmentDetails.drugId === '0') {
      return res.status(404).json({ message: `Shipment with ID ${shipmentId} not found` });
    }

    res.json(shipmentDetails);
  } catch (error) {
    console.error('Error fetching shipment details:', error);
    res.status(500).json({
      message: 'Failed to retrieve shipment details',
      error: error.message
    });
  }
});

// Create a new shipment
router.post('/shipments', async (req, res) => {
  try {
    const supplyChainContract = await getContractInstance();
    const {
      drugId,
      manufacturer,
      distributor,
      quantity,
      temperature
    } = req.body;

    // Validate input
    if (!drugId || !manufacturer || !distributor) {
      return res.status(400).json({ message: 'Drug ID, manufacturer, and distributor are required' });
    }

    // Validate quantity
    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }

    // Get accounts
    const accounts = await web3.eth.getAccounts();

    // Call contract method to create shipment
    const result = await supplyChainContract.methods.createShipment(
      drugId,
      manufacturer,
      distributor,
      quantity,
      temperature || 0
    ).send({ from: accounts[0] });

    res.status(201).json({
      message: 'Shipment created successfully',
      shipmentId: result.events.ShipmentCreated.returnValues.shipmentId
    });
  } catch (error) {
    console.error('Error creating shipment:', error);
    
    // Handle specific Web3 and contract-related errors
    if (error.message.includes('insufficient funds')) {
      return res.status(400).json({
        message: 'Insufficient blockchain account funds',
        error: error.message
      });
    }

    if (error.message.includes('revert')) {
      return res.status(400).json({
        message: 'Shipment creation failed due to contract validation',
        error: error.message
      });
    }

    // Generic error response
    res.status(500).json({
      message: 'Failed to create shipment',
      error: error.message
    });
  }
});

// Mark shipment as delivered
router.patch('/shipments/:shipmentId/deliver', async (req, res) => {
  try {
    const supplyChainContract = await getContractInstance();
    const { shipmentId } = req.params;

    // Validate input
    if (!shipmentId || isNaN(parseInt(shipmentId))) {
      return res.status(400).json({ message: 'Invalid shipment ID' });
    }

    // Get accounts
    const accounts = await web3.eth.getAccounts();

    // Call contract method to mark shipment as delivered
    const result = await supplyChainContract.methods.markShipmentDelivered(shipmentId).send({ from: accounts[0] });

    res.json({
      message: 'Shipment marked as delivered successfully',
      shipmentId: result.events.ShipmentDelivered.returnValues.shipmentId
    });
  } catch (error) {
    console.error('Error marking shipment as delivered:', error);
    
    // Handle specific Web3 and contract-related errors
    if (error.message.includes('revert')) {
      return res.status(400).json({
        message: 'Failed to mark shipment as delivered',
        error: error.message
      });
    }

    // Generic error response
    res.status(500).json({
      message: 'Failed to mark shipment as delivered',
      error: error.message
    });
  }
});

module.exports = router;
