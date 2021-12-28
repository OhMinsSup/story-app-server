const HDWalletProvider = require('truffle-hdwallet-provider-klaytn');
require('dotenv').config({
  path: '.env.development',
});

/**
 * 트러플 네트워크 변수
 * klaytn 네트워크에 계약을 배포하기 위한 것입니다. */
const NETWORK_ID = '1001';
const GASLIMIT = '20000000';

/**
 * URL: 사용할 원격 노드의 URL
 * PRIVATE_KEY: 거래대금을 지급하는 계좌의 Private Key (자신의 Private Key로 변경) */
const URL = `https://api.baobab.klaytn.net:8651`;
// truffle.js에 충분한 KLAY가 있는 `Private key`를 붙여넣습니다.
const PRIVATE_KEY = process.env.KLAYTN_PRIVATE_KEY;

module.exports = {
  networks: {
    ganache: {
      host: 'localhost',
      port: 8545,
      network_id: '*', // Match any network id
    },

    klaytn: {
      provider: new HDWalletProvider(PRIVATE_KEY, URL),
      network_id: NETWORK_ID,
      gas: GASLIMIT,
      gasPrice: null,
    },
  },

  // Specify the version of compiler, we use 0.5.6
  compilers: {
    solc: {
      version: '0.5.16',
    },
  },
};
