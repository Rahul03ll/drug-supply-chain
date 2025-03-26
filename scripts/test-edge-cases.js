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
    
    console.log("Testing Edge Cases and Advanced Functionality...\n");

    // Get signers for testing
    const [owner, distributor, retailer, unauthorized] = await ethers.getSigners();
    console.log("Test Accounts:");
    console.log("Owner:", owner.address);
    console.log("Distributor:", distributor.address);
    console.log("Retailer:", retailer.address);
    console.log("Unauthorized:", unauthorized.address);

    // 1. Test Invalid Operations
    console.log("\n=== Testing Invalid Operations ===");
    
    // 1.1 Test unauthorized batch creation
    console.log("\n1.1 Testing unauthorized batch creation...");
    try {
      const supplyChainUnauthorized = supplyChain.connect(unauthorized);
      await supplyChainUnauthorized.createBatch(1, 100, "Warehouse A");
    } catch (error) {
      console.log("Expected error - Unauthorized batch creation:", error.message);
    }

    // 1.2 Test invalid batch transfer
    console.log("\n1.2 Testing invalid batch transfer...");
    try {
      const supplyChainRetailer = supplyChain.connect(retailer);
      await supplyChainRetailer.transferBatch(1, distributor.address, "Invalid Location", 21);
    } catch (error) {
      console.log("Expected error - Invalid batch transfer:", error.message);
    }

    // 1.3 Test invalid temperature check
    console.log("\n1.3 Testing invalid temperature check...");
    try {
      await temperatureMonitor.checkTemperature(999, 21, "Invalid Location");
    } catch (error) {
      console.log("Expected error - Invalid temperature check:", error.message);
    }

    // 2. Test Alert Resolution
    console.log("\n=== Testing Alert Resolution ===");
    
    // 2.1 Get current alerts
    console.log("\n2.1 Getting current alerts...");
    const currentAlerts = await temperatureMonitor.getTemperatureAlerts(1);
    console.log("Current Alerts:", currentAlerts.map(alert => ({
      temperature: Number(alert.temperature),
      timestamp: new Date(Number(alert.timestamp) * 1000).toISOString(),
      isResolved: alert.isResolved
    })));

    // 2.2 Try unauthorized alert resolution
    console.log("\n2.2 Testing unauthorized alert resolution...");
    try {
      const tempMonitorUnauthorized = temperatureMonitor.connect(unauthorized);
      await tempMonitorUnauthorized.resolveTemperatureAlert(1, 0, "Temperature adjusted");
    } catch (error) {
      console.log("Expected error - Unauthorized alert resolution:", error.message);
    }

    // 2.3 Resolve alerts as admin
    console.log("\n2.3 Resolving alerts as admin...");
    try {
      for (let i = 0; i < currentAlerts.length; i++) {
        await temperatureMonitor.resolveTemperatureAlert(
          1,
          i,
          `Temperature adjusted to acceptable range at ${new Date().toISOString()}`
        );
      }
      console.log("All alerts resolved successfully!");

      // Verify alerts are resolved
      const resolvedAlerts = await temperatureMonitor.getTemperatureAlerts(1);
      console.log("Resolved Alerts:", resolvedAlerts.map(alert => ({
        temperature: Number(alert.temperature),
        timestamp: new Date(Number(alert.timestamp) * 1000).toISOString(),
        isResolved: alert.isResolved,
        resolution: alert.resolution
      })));
    } catch (error) {
      console.log("Error resolving alerts:", error.message);
    }

    // 3. Test Batch Management
    console.log("\n=== Testing Batch Management ===");
    
    // 3.1 Create multiple batches
    console.log("\n3.1 Creating multiple batches...");
    try {
      const batch2 = await supplyChain.createBatch(1, 50, "Warehouse B");
      console.log("Created batch 2 with ID:", Number(batch2));
      
      const batch3 = await supplyChain.createBatch(1, 75, "Warehouse C");
      console.log("Created batch 3 with ID:", Number(batch3));
    } catch (error) {
      console.log("Error creating additional batches:", error.message);
    }

    // 3.2 Get batch counts
    console.log("\n3.2 Getting batch counts...");
    try {
      const batchCount = await supplyChain.getBatchCount(1);
      console.log("Total batches for drug ID 1:", Number(batchCount));
    } catch (error) {
      console.log("Error getting batch count:", error.message);
    }

    // 3.3 Test batch status updates
    console.log("\n3.3 Testing batch status updates...");
    try {
      // Get initial status
      const batch1 = await supplyChain.getBatch(1);
      console.log("Batch 1 initial status:", {
        isActive: batch1.isActive,
        currentHolder: batch1.currentHolder,
        location: batch1.location
      });

      // Update temperature
      await supplyChain.updateTemperature(1, 20, "Updated Location");
      console.log("Temperature updated successfully!");

      // Get final status
      const batch1Final = await supplyChain.getBatch(1);
      console.log("Batch 1 final status:", {
        isActive: batch1Final.isActive,
        currentHolder: batch1Final.currentHolder,
        location: batch1Final.location,
        temperature: Number(batch1Final.temperature)
      });
    } catch (error) {
      console.log("Error updating batch status:", error.message);
    }

    // 4. Test Drug Registry Edge Cases
    console.log("\n=== Testing Drug Registry Edge Cases ===");
    
    // 4.1 Test duplicate drug registration
    console.log("\n4.1 Testing duplicate drug registration...");
    try {
      const currentTime = Math.floor(Date.now() / 1000);
      const expiryTime = currentTime + (365 * 24 * 60 * 60);
      
      await drugRegistry.registerDrug(
        "Ibuprofen", // Already registered
        "Duplicate registration test",
        "Manufacturer4",
        currentTime,
        expiryTime,
        true,
        18,
        23
      );
    } catch (error) {
      console.log("Expected error - Duplicate drug registration:", error.message);
    }

    // 4.2 Test invalid drug status update
    console.log("\n4.2 Testing invalid drug status update...");
    try {
      const drugRegistryUnauthorized = drugRegistry.connect(unauthorized);
      await drugRegistryUnauthorized.updateDrugStatus(1, false);
    } catch (error) {
      console.log("Expected error - Unauthorized drug status update:", error.message);
    }

    console.log("\nAll edge cases and advanced functionality tests completed!");

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