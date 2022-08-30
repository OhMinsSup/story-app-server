// eslint-disable-next-line @typescript-eslint/no-var-requires
const HDWalletProvider = require('truffle-hdwallet-provider-klaytn');

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv');

/**
 * 트러플 네트워크 변수
 * klaytn 네트워크에 계약을 배포하기 위한 것입니다. */
const NETWORK_ID = process.env.NETWORK_ID;
const GASLIMIT = process.env.GASLIMIT;

console.log(process.env.KLAYTN_NET_RPC_URL, NETWORK_ID);

/**
 * URL: 사용할 원격 노드의 URL
 * PRIVATE_KEY: 거래대금을 지급하는 계좌의 Private Key (자신의 Private Key로 변경) */

module.exports = {
  networks: {
    ganache: {
      host: 'localhost',
      port: 8545,
      network_id: '*', // Match any network id
    },

    baobab: {
      provider: () =>
        new HDWalletProvider(
          process.env.KLAYTN_FEE_PAYER_PRIVATE_KEY,
          process.env.KLAYTN_NET_RPC_URL,
        ),
      network_id: NETWORK_ID,
      gas: GASLIMIT,
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
