const DrugRegistry = artifacts.require('DrugRegistry');

module.exports = async function(callback) {
  try {
    const drugRegistry = await DrugRegistry.deployed();
    const accounts = await web3.eth.getAccounts();
    
    // Register the first account as a manufacturer
    await drugRegistry.registerManufacturer(
      accounts[0],
      "Test Manufacturer",
      "Test Location",
      "Test License",
      { from: accounts[0] }
    );

    console.log('Manufacturer registered successfully!');
    console.log('Manufacturer address:', accounts[0]);
    
    callback();
  } catch (err) {
    console.error(err);
    callback(err);
  }
};
