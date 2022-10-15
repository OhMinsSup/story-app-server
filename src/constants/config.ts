import * as fs from 'fs';

export const CONFIG_OPTIONS = 'CONFIG_OPTIONS';
export const KLAYTN = 'KLAYTN';
export const FEE_PAYER_WALLET = 'FEE_PAYER_WALLET'; // 대납주소 지갑
export const NFT_STORAGE = 'NFT_STORAGE';
export const QUEUE = 'QUEUE';

export const KLAYTN_NET_RPC_URL = process.env.KLAYTN_NET_RPC_URL;

export const QUEUE_CONSTANTS = {
  MINTING: '@queue:minting',
  MINT: '@queue:mint',
};

export const TASK_CONSTANTS = {
  MINTING: '@task:minting',
  MINT: '@task:mint',
};

const addressPath = __dirname + '/../../deployed/deployedAddress';
const abiPath = __dirname + '/../../deployed/deployedABI';

export const DEPLOYED_ADDRESS: any =
  fs.existsSync(addressPath) &&
  fs.readFileSync(addressPath, 'utf8').replace(/\n|\r/g, '');

export const DEPLOYED_ABI: any =
  fs.existsSync(abiPath) && JSON.parse(fs.readFileSync(abiPath, 'utf8'));
