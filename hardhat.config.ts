import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config({ path: ".env" });

const TEST_CORE_API_KEY_URL = process.env.TEST_CORE_API_KEY_URL;

const ACCOUNT_PRIVATE_KEY = process.env.ACCOUNT_PRIVATE_KEY;

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},

    core_testnet: {
      url: TEST_CORE_API_KEY_URL,
      accounts: [ACCOUNT_PRIVATE_KEY],
      chainId: 1115,
    },
  },
  lockGasLimit: 200000000000,
  gasPrice: 10000000000,
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
