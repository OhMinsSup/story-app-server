const Story = artifacts.require('./Story.sol');
const fs = require('fs');

module.exports = function (deployer) {
  deployer.deploy(Story).then(() => {
    if (Story._json) {
      // 1. Record recently deployed contract's abi file to 'deployedABI'
      fs.writeFile('deployedABI', JSON.stringify(Story._json.abi, 2), (err) => {
        if (err) throw err;
        console.log(
          `The abi of ${Story._json.contractName} is recorded on deployedABI file`,
        );
      });
    }

    // 2. Record recently deployed contract's address to 'deployedAddress'
    fs.writeFile('deployedAddress', Story.address, (err) => {
      if (err) throw err;
      console.log(
        `The deployed contract address * ${Story.address} * is recorded on deployedAddress file`,
      );
    });
  });
};
