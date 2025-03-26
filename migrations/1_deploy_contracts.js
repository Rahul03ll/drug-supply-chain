const DrugRegistry = artifacts.require("DrugRegistry");
const SupplyChain = artifacts.require("SupplyChain");
const TemperatureMonitor = artifacts.require("TemperatureMonitor");

module.exports = async function(deployer) {
  // Deploy DrugRegistry
  await deployer.deploy(DrugRegistry);
  const drugRegistry = await DrugRegistry.deployed();

  // Deploy SupplyChain with DrugRegistry address
  await deployer.deploy(SupplyChain, drugRegistry.address);
  const supplyChain = await SupplyChain.deployed();

  // Deploy TemperatureMonitor with DrugRegistry and SupplyChain addresses
  await deployer.deploy(TemperatureMonitor, drugRegistry.address, supplyChain.address);
}; 