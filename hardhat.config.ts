import dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "./tasks/vadd";
import "./tasks/grantRoles";

dotenv.config();

const MUMBAI_PRIVATE_KEY = process.env.MUMBAI_PRIVATE_KEY;
const GOERLI_PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY;
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY;
const KANAZAWA_PRIVATE_KEY = process.env.KANAZAWA_PRIVATE_KEY;
const ETHEREUM_PRIVATE_KEY = process.env.ETHEREUM_PRIVATE_KEY;
const POLYGON_PRIVATE_KEY = process.env.POLYGON_PRIVATE_KEY;
const AVALANCHE_PRIVATE_KEY = process.env.AVALANCHE_PRIVATE_KEY;
const BINANCE_PRIVATE_KEY = process.env.BINANCE_PRIVATE_KEY;

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
    localhost: {
      url: "http://127.0.0.1:7545/",
    },
    mumbai: {
      url: process.env.MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com",
      chainId: 80001,
      accounts: MUMBAI_PRIVATE_KEY ? [MUMBAI_PRIVATE_KEY] : [],
    },
    goerli: {
      url: process.env.GOERLI_RPC_URL || "https://rpc.ankr.com/eth_goerli",
      chainId: 5,
      accounts: GOERLI_PRIVATE_KEY ? [GOERLI_PRIVATE_KEY] : [],
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org/",
      chainId: 11155111,
      accounts: SEPOLIA_PRIVATE_KEY ? [SEPOLIA_PRIVATE_KEY] : [],
    },
    kanazawa: {
      url:
        process.env.KANAZAWA_RPC_URL ||
        "https://rpc-kanazawa.meldlabs.dev/ext/bc/2Ci7VYrUd4fTBqGA5D2HA6UPHzQ4LQyr8rZQww9MGSv9rNkRzn/rpc",
      chainId: 222000222,
      accounts: KANAZAWA_PRIVATE_KEY ? [KANAZAWA_PRIVATE_KEY] : [],
    },
    ethereum: {
      url: process.env.ETHEREUM_RPC_URL || "https://eth.llamarpc.com",
      chainId: 1,
      accounts: ETHEREUM_PRIVATE_KEY ? [ETHEREUM_PRIVATE_KEY] : [],
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL || "https://rpc-mainnet.maticvigil.com",
      chainId: 137,
      accounts: POLYGON_PRIVATE_KEY ? [POLYGON_PRIVATE_KEY] : [],
    },
    avalanche: {
      url:
        process.env.AVALANCHE_RPC_URL ||
        "https://avalanche-c-chain.publicnode.com	",
      chainId: 43114,
      accounts: AVALANCHE_PRIVATE_KEY ? [AVALANCHE_PRIVATE_KEY] : [],
    },
    binance: {
      url: process.env.BINANCE_RPC_URL || "https://bsc.publicnode.com",
      chainId: 56,
      accounts: BINANCE_PRIVATE_KEY ? [BINANCE_PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
