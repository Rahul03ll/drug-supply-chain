const DrugRegistry = artifacts.require('DrugRegistry');

module.exports = async function(callback) {
  try {
    const drugRegistry = await DrugRegistry.deployed();
    const accounts = await web3.eth.getAccounts();
    
    // Generate serial number for drug ID 1
    const result = await drugRegistry.generateSerialNumber(1, { from: accounts[0] });
    const serialNumber = result.logs[0].args.serialNumber.toString();

    console.log('Serial number generated successfully!');
    console.log('Drug ID:', 1);
    console.log('Serial Number:', serialNumber);
    
    callback();
  } catch (err) {
    console.error(err);
    callback(err);
  }
};
