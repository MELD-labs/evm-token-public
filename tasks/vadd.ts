import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { SEAPORT_FACTORY_ADDRESS, SEAPORT_FACTORY_ABI } from "../constants";

task("initCode", "Get init code hash of any contract")
  .addParam("contract", "The name of the contract")
  .addOptionalVariadicPositionalParam(
    "constructorArgs",
    "The constructor arguments"
  )
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { contract } = taskArgs;

    console.log("Getting init code hash of contract", contract);

    const constructorArgs = taskArgs.constructorArgs || [];
    const initCode = await getInitCode(hre, contract, ...constructorArgs);
    const initCodeHash = hre.ethers.utils.keccak256(initCode!);
    console.log("initCodeHash:", initCodeHash);
  });

task(
  "getAddress",
  "Get address of a contract given its init code hash and salt"
)
  .addParam("salt", "The salt to use to deploy the contract")
  .addParam("initcodehash", "The init code hash of the contract")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;
    const salt = parseInt(taskArgs.salt);
    const saltBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(salt), 32);

    const initCodeHash = taskArgs.initcodehash;

    console.log(
      "Getting address of contract with salt",
      salt,
      "and initCodeHash",
      initCodeHash,
      "..."
    );

    const address = ethers.utils.getCreate2Address(
      SEAPORT_FACTORY_ADDRESS,
      saltBytes,
      initCodeHash
    );

    console.log("Address:", address);
  });

task("deployDeterministically", "Deploy a contract with deterministic address")
  .addParam("salt", "The salt to use to deploy the contract")
  .addParam("contract", "The name of the contract")
  .addOptionalVariadicPositionalParam(
    "constructorArgs",
    "The constructor arguments"
  )
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    /*
     * This task deploys a contract deterministically using a salt and the Seaport factory contract.
     * The salt is used to generate the address of the contract.
     * The Seaport factory contract must be deployed in the network.
     * To deploy it in a local network, follow docs: https://github.com/ProjectOpenSea/seaport/blob/main/docs/Deployment.md
     *  Usage:
     *  `yarn hardhat deployDeterministically --network <network> --salt <salt> --contract <contract> <constructorArgs>`
     * Example:
     *  `yarn hardhat deployDeterministically --network mumbai --salt 1638560 --contract MeldToken 0xaaaa1A852b202305bc158aD2Ea413CD31D027dE4`
     */

    const { ethers } = hre;
    const [deployerSigner] = await ethers.getSigners();

    // If a salt is provided via param, use it
    const salt = parseInt(taskArgs.salt);

    const contractName = taskArgs.contract;
    const constructorArgs = taskArgs.constructorArgs || [];
    const initCode = await getInitCode(hre, contractName, ...constructorArgs);

    console.log("Deploying contract:", contractName);

    // Check if the factory contract is deployed in this network
    const factoryCode = await ethers.provider.getCode(SEAPORT_FACTORY_ADDRESS);
    if (factoryCode === "0x") {
      throw new Error("Factory contract not deployed in this network!");
    }

    const factoryContract = new ethers.Contract(
      SEAPORT_FACTORY_ADDRESS,
      SEAPORT_FACTORY_ABI,
      deployerSigner
    );

    console.log("Using salt", salt);

    const saltBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(salt), 32);

    const deploymentAddress = await factoryContract.findCreate2Address(
      saltBytes,
      initCode
    );

    if (deploymentAddress == ethers.constants.AddressZero) {
      throw new Error("Contract already deployed!");
    }

    console.log("Deployment address:", deploymentAddress);

    console.log("Deploying...");

    const tx = await factoryContract.safeCreate2(saltBytes, initCode);
    await tx.wait();
    console.log("Tx hash:", tx.hash);

    console.log("Deployed!");
  });

task(
  "checkFactory",
  "Check if factory contract is deployed in the network"
).setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
  const { ethers } = hre;
  const factoryCode = await ethers.provider.getCode(SEAPORT_FACTORY_ADDRESS);
  console.log(
    `Seaport factory is ${factoryCode === "0x" ? "NOT " : ""}DEPLOYED in ${
      hre.network.name
    }`
  );
});

async function getInitCode(
  hre: HardhatRuntimeEnvironment,
  contract: string,
  ...constructorArgs: any[]
) {
  const contractFactory = await hre.ethers.getContractFactory(contract);
  const { data: initCode } = contractFactory.getDeployTransaction(
    ...constructorArgs
  );
  return initCode;
}
