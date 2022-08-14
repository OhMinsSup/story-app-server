const Story = artifacts.require('../contracts/Story.sol');
const StoryFactory = artifacts.require('../contracts/StoryFactory.sol');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

module.exports = async (deployer) => {
  let proxyRegistryAddress = '0xfF2D4AE2D0E107C3eDDeDe3F6FBA103ce9Fd4F18';

  // Story
  await deployer.deploy(Story, proxyRegistryAddress);

  await deployer
    .deploy(StoryFactory, proxyRegistryAddress, Story.address)
    .then(() => {
      if (StoryFactory._json) {
        // 1. Record recently deployed contract's abi file to 'deployedABI'
        fs.writeFile(
          './deployed/deployedABI',
          JSON.stringify(StoryFactory._json.abi),
          (err) => {
            if (err) throw err;
            console.log(
              `The abi of ${StoryFactory._json.contractName} is recorded on deployedABI file`,
            );
          },
        );
      }

      // 2. Record recently deployed contract's address to 'deployedAddress'
      fs.writeFile(
        './deployed/deployedAddress',
        StoryFactory.address,
        (err) => {
          if (err) throw err;
          console.log(
            `The deployed contract address * ${StoryFactory.address} * is recorded on deployedAddress file`,
          );
        },
      );
    });
};
