const main = async () => {
  try {
    // Get contract factories
    const DrugRegistry = await ethers.getContractFactory("DrugRegistry");
    const SupplyChain = await ethers.getContractFactory("SupplyChain");
    const TemperatureMonitor = await ethers.getContractFactory("TemperatureMonitor");
    
    // Attach to deployed contracts
    const drugRegistry = await DrugRegistry.attach("0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e");
    const supplyChain = await SupplyChain.attach("0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0");
    const temperatureMonitor = await TemperatureMonitor.attach("0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82");
    
    console.log("Testing Batch Transfers and Temperature Monitoring...\n");

    // Get signers for testing transfers
    const [owner, distributor, retailer] = await ethers.getSigners();
    console.log("Test Accounts:");
    console.log("Owner:", owner.address);
    console.log("Distributor:", distributor.address);
    console.log("Retailer:", retailer.address);

    // 1. Test Temperature Edge Cases
    console.log("\n=== Testing Temperature Edge Cases ===");
    
    // 1.1 Test temperature below minimum
    console.log("\n1.1 Testing temperature below minimum (15°C)...");
    try {
      const lowTempTx = await temperatureMonitor.checkTemperature(
        1, // batchId
        15, // temperature (15°C) - below minimum of 18°C
        "Warehouse A"
      );
      await lowTempTx.wait();
      console.log("Low temperature check completed!");

      // Check for temperature alerts
      const lowTempAlerts = await temperatureMonitor.getTemperatureAlerts(1);
      console.log("Temperature Alerts after low temperature:", lowTempAlerts.map(alert => ({
        temperature: Number(alert.temperature),
        timestamp: new Date(Number(alert.timestamp) * 1000).toISOString(),
        isResolved: alert.isResolved
      })));
    } catch (error) {
      console.log("Error checking low temperature:", error.message);
    }

    // 1.2 Test temperature above maximum
    console.log("\n1.2 Testing temperature above maximum (25°C)...");
    try {
      const highTempTx = await temperatureMonitor.checkTemperature(
        1,
        25, // temperature (25°C) - above maximum of 23°C
        "Warehouse A"
      );
      await highTempTx.wait();
      console.log("High temperature check completed!");

      // Check for temperature alerts
      const highTempAlerts = await temperatureMonitor.getTemperatureAlerts(1);
      console.log("Temperature Alerts after high temperature:", highTempAlerts.map(alert => ({
        temperature: Number(alert.temperature),
        timestamp: new Date(Number(alert.timestamp) * 1000).toISOString(),
        isResolved: alert.isResolved
      })));
    } catch (error) {
      console.log("Error checking high temperature:", error.message);
    }

    // 2. Test Batch Transfers
    console.log("\n=== Testing Batch Transfers ===");
    
    // 2.1 Transfer batch to distributor
    console.log("\n2.1 Transferring batch to distributor...");
    try {
      const transferToDistributorTx = await supplyChain.transferBatch(
        1, // batchId
        distributor.address,
        "Distribution Center A",
        21 // temperature (21°C)
      );
      await transferToDistributorTx.wait();
      console.log("Batch transferred to distributor successfully!");

      // Get updated batch details
      const batchAfterDistributor = await supplyChain.getBatch(1);
      console.log("Batch Details after distributor transfer:", {
        currentHolder: batchAfterDistributor.currentHolder,
        location: batchAfterDistributor.location,
        temperature: Number(batchAfterDistributor.temperature)
      });
    } catch (error) {
      console.log("Error transferring to distributor:", error.message);
    }

    // 2.2 Transfer batch to retailer
    console.log("\n2.2 Transferring batch to retailer...");
    try {
      // Switch to distributor account for transfer
      const supplyChainDistributor = supplyChain.connect(distributor);
      const transferToRetailerTx = await supplyChainDistributor.transferBatch(
        1,
        retailer.address,
        "Retail Store A",
        22 // temperature (22°C)
      );
      await transferToRetailerTx.wait();
      console.log("Batch transferred to retailer successfully!");

      // Get updated batch details
      const batchAfterRetailer = await supplyChain.getBatch(1);
      console.log("Batch Details after retailer transfer:", {
        currentHolder: batchAfterRetailer.currentHolder,
        location: batchAfterRetailer.location,
        temperature: Number(batchAfterRetailer.temperature)
      });
    } catch (error) {
      console.log("Error transferring to retailer:", error.message);
    }

    // 2.3 Get complete transfer history
    console.log("\n2.3 Getting complete transfer history...");
    try {
      const transferHistory = await supplyChain.getTransferHistory(1);
      console.log("Complete Transfer History:", transferHistory.map(transfer => ({
        from: transfer.from,
        to: transfer.to,
        timestamp: new Date(Number(transfer.timestamp) * 1000).toISOString(),
        location: transfer.location,
        temperature: Number(transfer.temperature)
      })));
    } catch (error) {
      console.log("Error getting transfer history:", error.message);
    }

    // 3. Test Temperature Monitoring During Transfers
    console.log("\n=== Testing Temperature Monitoring During Transfers ===");
    
    // 3.1 Check temperature at retailer location
    console.log("\n3.1 Checking temperature at retailer location...");
    try {
      const retailerTempTx = await temperatureMonitor.checkTemperature(
        1,
        22, // temperature (22°C) - within range
        "Retail Store A"
      );
      await retailerTempTx.wait();
      console.log("Temperature checked at retailer location!");

      // Get final temperature alerts
      const finalAlerts = await temperatureMonitor.getTemperatureAlerts(1);
      console.log("Final Temperature Alerts:", finalAlerts.map(alert => ({
        temperature: Number(alert.temperature),
        location: alert.location,
        timestamp: new Date(Number(alert.timestamp) * 1000).toISOString(),
        isResolved: alert.isResolved
      })));
    } catch (error) {
      console.log("Error checking temperature at retailer:", error.message);
    }

    console.log("\nAll transfer and temperature tests completed!");

  } catch (error) {
    console.error("Error:", error);
  }
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 