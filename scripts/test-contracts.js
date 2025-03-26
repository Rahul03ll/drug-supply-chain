const main = async () => {
  try {
    // Get contract factories
    const DrugRegistry = await ethers.getContractFactory("DrugRegistry");
    
    // Attach to deployed contract
    const drugRegistry = await DrugRegistry.attach("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0");
    
    console.log("Testing Drug Registry Contract...\n");

    // Test 1: Get total drugs
    console.log("Test 1: Getting total number of drugs...");
    const totalDrugs = await drugRegistry.getTotalDrugs();
    console.log("Total Drugs:", Number(totalDrugs));

    // Test 2: Try to get existing drug details
    if (Number(totalDrugs) > 0) {
      console.log("\nTest 2: Getting existing drug details...");
      try {
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
      } catch (error) {
        console.log("Error getting drug details:", error.message);
      }
    }

    // Test 3: Register a new drug with a different name
    console.log("\nTest 3: Registering Amoxicillin...");
    const currentTime = Math.floor(Date.now() / 1000);
    const expiryTime = currentTime + (365 * 24 * 60 * 60); // 1 year from now
    
    const tx2 = await drugRegistry.registerDrug(
      "Amoxicillin",
      "Antibiotic medication",
      "Manufacturer2",
      currentTime,
      expiryTime,
      true, // requires temperature control
      15, // min temperature (15°C)
      22  // max temperature (22°C)
    );
    await tx2.wait();
    console.log("Drug registered successfully!");

    // Test 4: Get updated total drugs
    console.log("\nTest 4: Getting updated total number of drugs...");
    const updatedTotalDrugs = await drugRegistry.getTotalDrugs();
    console.log("Total Drugs:", Number(updatedTotalDrugs));

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