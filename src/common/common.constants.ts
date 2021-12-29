import fs from 'fs';

export const CONFIG_OPTIONS = 'CONFIG_OPTIONS';
export const CLOUDINARY = 'CLOUDINARY';
export const KLAYTN = 'KLAYTN';
export const CONTRACT = 'STORY_CONTRACT';

export const BAOBAB_TESTNET_RPC_URL = 'https://api.baobab.klaytn.net:8651/';

const addressPath = __dirname + '/../../deployedAddress';
const abiPath = __dirname + '/../../deployedABI';

export const DEPLOYED_ADDRESS: any =
  fs.existsSync(addressPath) &&
  fs.readFileSync(addressPath, 'utf8').replace(/\n|\r/g, '');

export const DEPLOYED_ABI: any =
  fs.existsSync(abiPath) && JSON.parse(fs.readFileSync(abiPath, 'utf8'));

export const GAS = 30000;
