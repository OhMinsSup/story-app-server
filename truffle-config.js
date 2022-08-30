require('dotenv').config({
  path: '.env.development',
});
const HDWalletProvider = require('truffle-hdwallet-provider-klaytn');

/**
 * URL: 사용할 원격 노드의 URL
 * PRIVATE_KEY: 거래대금을 지급하는 계좌의 Private Key (자신의 Private Key로 변경) */

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*', // Match any network id
    },
    baobab: {
      provider: () => {
        return new HDWalletProvider(
          process.env.KLAYTN_FEE_PAYER_PRIVATE_KEY,
          process.env.KLAYTN_NET_RPC_URL,
        );
      },
      network_id: '1001',
      gas: '8500000',
      gasPrice: null,
    },
  },
  // Specify the version of compiler, we use 0.5.6
  compilers: {
    solc: {
      version: '0.8.7',
    },
  },
};
