const hre = require("hardhat");

async function main() {
  // Deploy DrugRegistry
  const DrugRegistry = await hre.ethers.getContractFactory("DrugRegistry");
  const drugRegistry = await DrugRegistry.deploy();
  await drugRegistry.waitForDeployment();
  console.log("DrugRegistry deployed to:", await drugRegistry.getAddress());

  // Deploy SupplyChain
  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
  const supplyChain = await SupplyChain.deploy(await drugRegistry.getAddress());
  await supplyChain.waitForDeployment();
  console.log("SupplyChain deployed to:", await supplyChain.getAddress());

  // Deploy TemperatureMonitor
  const TemperatureMonitor = await hre.ethers.getContractFactory("TemperatureMonitor");
  const temperatureMonitor = await TemperatureMonitor.deploy(await drugRegistry.getAddress(), await supplyChain.getAddress());
  await temperatureMonitor.waitForDeployment();
  console.log("TemperatureMonitor deployed to:", await temperatureMonitor.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 