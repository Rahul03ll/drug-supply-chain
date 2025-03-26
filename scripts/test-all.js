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
    
    console.log("Testing Drug Supply Chain System...\n");

    // 1. Test Drug Registry
    console.log("=== Testing Drug Registry ===");
    
    // 1.1 Get total drugs
    console.log("\n1.1 Getting total number of drugs...");
    const totalDrugs = await drugRegistry.getTotalDrugs();
    console.log("Total Drugs:", Number(totalDrugs));

    // 1.2 Get existing drug details
    if (Number(totalDrugs) > 0) {
      console.log("\n1.2 Getting existing drug details...");
      const drug0 = await drugRegistry.getDrug(1);
      console.log("Drug Details:", {
        id: Number(drug0.id),
        name: drug0.name,
        description: drug0.description,
        manufacturer: drug0.manufacturer,
        manufacturingDate: new Date(Number(drug0.manufacturingDate) * 1000).toISOString(),
        expiryDate: new Date(Number(drug0.expiryDate) * 1000).toISOString(),
        requiresTemperatureControl: drug0.requiresTemperatureControl,
        minTemperature: Number(drug0.minTemperature),
        maxTemperature: Number(drug0.maxTemperature),
        isActive: drug0.isActive,
        registeredBy: drug0.registeredBy
      });
    }

    // 1.3 Register a new drug
    console.log("\n1.3 Registering new drug (Ibuprofen)...");
    const currentTime = Math.floor(Date.now() / 1000);
    const expiryTime = currentTime + (365 * 24 * 60 * 60); // 1 year from now
    
    try {
      const tx1 = await drugRegistry.registerDrug(
        "Ibuprofen",
        "Anti-inflammatory medication",
        "Manufacturer3",
        currentTime,
        expiryTime,
        true, // requires temperature control
        18, // min temperature (18°C)
        23  // max temperature (23°C)
      );
      await tx1.wait();
      console.log("Drug registered successfully!");
    } catch (error) {
      console.log("Error registering drug:", error.message);
    }

    // 2. Test Supply Chain
    console.log("\n=== Testing Supply Chain ===");
    
    // 2.1 Create a new batch
    console.log("\n2.1 Creating a new batch...");
    try {
      const batchTx = await supplyChain.createBatch(
        1, // drugId (Paracetamol)
        100, // quantity
        "Warehouse A" // location
      );
      await batchTx.wait();
      console.log("Batch created successfully!");
    } catch (error) {
      console.log("Error creating batch:", error.message);
    }

    // 2.2 Get batch details
    console.log("\n2.2 Getting batch details...");
    try {
      const batch = await supplyChain.getBatch(1);
      console.log("Batch Details:", {
        id: Number(batch.id),
        drugId: Number(batch.drugId),
        quantity: Number(batch.quantity),
        manufacturer: batch.manufacturer,
        currentHolder: batch.currentHolder,
        timestamp: new Date(Number(batch.timestamp) * 1000).toISOString(),
        location: batch.location,
        temperature: Number(batch.temperature),
        isActive: batch.isActive
      });
    } catch (error) {
      console.log("Error getting batch details:", error.message);
    }

    // 3. Test Temperature Monitor
    console.log("\n=== Testing Temperature Monitor ===");
    
    // 3.1 Check temperature
    console.log("\n3.1 Checking temperature...");
    try {
      const tempTx = await temperatureMonitor.checkTemperature(
        1, // batchId
        21, // temperature (21°C)
        "Warehouse A" // location
      );
      await tempTx.wait();
      console.log("Temperature checked successfully!");
    } catch (error) {
      console.log("Error checking temperature:", error.message);
    }

    // 3.2 Get temperature alerts
    console.log("\n3.2 Getting temperature alerts...");
    try {
      const tempAlerts = await temperatureMonitor.getTemperatureAlerts(1);
      console.log("Temperature Alerts:", tempAlerts.map(alert => ({
        batchId: Number(alert.batchId),
        drugId: Number(alert.drugId),
        temperature: Number(alert.temperature),
        timestamp: new Date(Number(alert.timestamp) * 1000).toISOString(),
        location: alert.location,
        isResolved: alert.isResolved,
        resolution: alert.resolution
      })));
    } catch (error) {
      console.log("Error getting temperature alerts:", error.message);
    }

    // 3.3 Get alert count
    console.log("\n3.3 Getting alert count...");
    try {
      const alertCount = await temperatureMonitor.getAlertCount(1);
      console.log("Alert Count:", Number(alertCount));
    } catch (error) {
      console.log("Error getting alert count:", error.message);
    }

    // 3.4 Check if temperature is in range
    console.log("\n3.4 Checking if temperature is in range...");
    try {
      const isInRange = await temperatureMonitor.isTemperatureInRange(1, 21);
      console.log("Temperature 21°C is in range:", isInRange);
    } catch (error) {
      console.log("Error checking temperature range:", error.message);
    }

    // 4. Test Role Management
    console.log("\n=== Testing Role Management ===");
    
    // 4.1 Get current admin role
    console.log("\n4.1 Getting admin role...");
    try {
      const adminRole = await drugRegistry.DEFAULT_ADMIN_ROLE();
      console.log("Admin Role:", adminRole);

      // 4.2 Get current admin
      const [signer] = await ethers.getSigners();
      const hasAdminRole = await drugRegistry.hasRole(adminRole, signer.address);
      console.log("Current signer has admin role:", hasAdminRole);
    } catch (error) {
      console.log("Error checking admin role:", error.message);
    }

    // 5. Test Batch Management
    console.log("\n=== Testing Batch Management ===");
    
    // 5.1 Get total batches
    console.log("\n5.1 Getting total batches...");
    try {
      const totalBatches = await supplyChain.getTotalBatches();
      console.log("Total Batches:", Number(totalBatches));
    } catch (error) {
      console.log("Error getting total batches:", error.message);
    }

    // 5.2 Get batch transfer history
    console.log("\n5.2 Getting batch transfer history...");
    try {
      const transferHistory = await supplyChain.getTransferHistory(1);
      console.log("Transfer History:", transferHistory.map(transfer => ({
        from: transfer.from,
        to: transfer.to,
        timestamp: new Date(Number(transfer.timestamp) * 1000).toISOString(),
        location: transfer.location,
        temperature: Number(transfer.temperature)
      })));
    } catch (error) {
      console.log("Error getting transfer history:", error.message);
    }

    console.log("\nAll tests completed!");

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