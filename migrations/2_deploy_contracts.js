const Story = artifacts.require('./StoryNFTs.sol');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

module.exports = function (deployer) {
  deployer.deploy(Story).then(() => {
    if (Story._json) {
      // 1. Record recently deployed contract's abi file to 'deployedABI'
      fs.writeFile(
        './deployed/deployedABI',
        JSON.stringify(Story._json.abi, 2),
        (err) => {
          if (err) throw err;
          console.log(
            `The abi of ${Story._json.contractName} is recorded on deployedABI file`,
          );
        },
      );
    }

    // 2. Record recently deployed contract's address to 'deployedAddress'
    fs.writeFile('./deployed/deployedAddress', Story.address, (err) => {
      if (err) throw err;
      console.log(
        `The deployed contract address * ${Story.address} * is recorded on deployedAddress file`,
      );
    });
  });
};
