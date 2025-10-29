export const KIICHAIN_CONFIG = {
  TESTNET_RPC: 'https://rpc-testnet.kiichain.io',
  TESTNET_API: 'https://api-testnet.kiichain.io',
  CHAIN_ID: 'kiitestnet-2',
  PREFIX: 'kii',
  DENOM: 'ukii',
  GAS_PRICE: '0.025ukii',

  REWARD_THRESHOLDS: {
    BRONZE: 1000,
    SILVER: 5000,
    GOLD: 10000,
    DIAMOND: 25000,
  }
};

export const COSMOS_ENDPOINTS = {
  TX_BROADCAST: '/cosmos/tx/v1beta1/txs',
  BANK_BALANCES: '/cosmos/bank/v1beta1/balances',
  TX_QUERY: '/cosmos/tx/v1beta1/txs',
};
