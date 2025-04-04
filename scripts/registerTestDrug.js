const DrugRegistry = artifacts.require('DrugRegistry');

module.exports = async function(callback) {
  try {
    const drugRegistry = await DrugRegistry.deployed();
    
    // Register a test drug
    const result = await drugRegistry.registerDrug(
      "Test Drug",
      "Test Description",
      "Test Manufacturer",
      Math.floor(Date.now() / 1000),  // manufacturing date
      Math.floor(Date.now() / 1000) + 31536000,  // expiry date (1 year from now)
      true,  // requires temperature control
      2,  // min temperature
      8,  // max temperature
      { from: (await web3.eth.getAccounts())[0] }
    );

    console.log('Test drug registered successfully!');
    console.log('Transaction:', result.tx);
    console.log('Drug ID:', result.logs[0].args.drugId.toString());
    
    callback();
  } catch (err) {
    console.error(err);
    callback(err);
  }
};
