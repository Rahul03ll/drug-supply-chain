const Web3 = require('web3');
const DrugRegistryContract = require('../../build/contracts/DrugRegistry.json');

class DrugController {
  constructor() {
    // Web3 configuration will be done in the route initialization
    this.web3 = null;
    this.drugRegistryContract = null;
  }

  async initializeWeb3(web3Provider) {
    this.web3 = new Web3(web3Provider);
    const networkId = await this.web3.eth.net.getId();
    const deployedNetwork = DrugRegistryContract.networks[networkId];
    this.drugRegistryContract = new this.web3.eth.Contract(
      DrugRegistryContract.abi,
      deployedNetwork.address
    );
  }

  async createDrugEntry(req, res, next) {
    try {
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
        const error = new Error('Name and manufacturer are required');
        error.statusCode = 400;
        throw error;
      }

      // Get accounts
      const accounts = await this.web3.eth.getAccounts();

      // Call contract method to register drug
      const result = await this.drugRegistryContract.methods.registerDrug(
        name,
        description || '',
        manufacturer,
        Math.floor(new Date(manufacturingDate).getTime() / 1000),
        Math.floor(new Date(expiryDate).getTime() / 1000),
        requiresTemperatureControl || false,
        minTemperature || 0,
        maxTemperature || 0
      ).send({ from: accounts[0] });

      res.status(201).json({
        message: 'Drug registered successfully',
        drugId: result.events.DrugRegistered.returnValues.drugId
      });
    } catch (error) {
      next(error);
    }
  }

  async getDrugs(req, res, next) {
    try {
      const totalDrugs = await this.drugRegistryContract.methods.getTotalDrugs().call();
      const drugs = [];

      for (let i = 1; i <= totalDrugs; i++) {
        const drug = await this.drugRegistryContract.methods.getDrug(i).call();
        drugs.push(drug);
      }

      res.json(drugs);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DrugController();
