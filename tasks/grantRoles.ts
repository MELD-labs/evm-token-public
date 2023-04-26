import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("grantRoles", "Grant all roles to a specific address")
  .addParam("contractaddress", "The address of the BaseToken contract")
  .addParam("destinationaddress", "The address to grant the roles")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;
    const contractAddress = taskArgs.contractaddress;
    const destinationAddress = taskArgs.destinationaddress;
    const [adminSigner] = await ethers.getSigners();

    const tokenContract = await ethers.getContractAt(
      "BaseToken",
      contractAddress
    );

    if (
      !(await checkRole(
        tokenContract,
        "DEFAULT_ADMIN_ROLE",
        adminSigner.address
      ))
    ) {
      throw new Error("Admin address does not have DEFAULT_ADMIN_ROLE");
    }

    const MAX_SUPPLY = ethers.utils.parseEther("1000000000");
    console.log("Setting minting account", destinationAddress);
    const setMintingTx = await tokenContract
      .connect(adminSigner)
      .setMintingAccount(destinationAddress, MAX_SUPPLY, 0);
    console.log(`Setting minting account tx: ${setMintingTx.hash}`);
    await setMintingTx.wait();
    await grantRole(
      tokenContract,
      adminSigner,
      "BURNER_ROLE",
      destinationAddress
    );
    await grantRole(
      tokenContract,
      adminSigner,
      "PAUSER_ROLE",
      destinationAddress
    );
    await grantRole(
      tokenContract,
      adminSigner,
      "UNPAUSER_ROLE",
      destinationAddress
    );
    await grantRole(
      tokenContract,
      adminSigner,
      "TRUSTED_FORWARDER_SETTER_ROLE",
      destinationAddress
    );
  });

task("grantAdminRole", "Grant admin role to a specific address")
  .addParam("contractaddress", "The address of the BaseToken contract")
  .addParam("destinationaddress", "The address to grant the roles")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;
    const contractAddress = taskArgs.contractaddress;
    const destinationAddress = taskArgs.destinationaddress;
    const [adminSigner] = await ethers.getSigners();

    const tokenContract = await ethers.getContractAt(
      "BaseToken",
      contractAddress
    );

    if (
      !(await checkRole(
        tokenContract,
        "DEFAULT_ADMIN_ROLE",
        adminSigner.address
      ))
    ) {
      throw new Error("Admin address does not have DEFAULT_ADMIN_ROLE");
    }

    await grantRole(
      tokenContract,
      adminSigner,
      "DEFAULT_ADMIN_ROLE",
      destinationAddress
    );

    console.log(
      `Address ${destinationAddress} has admin role: ${await checkRole(
        tokenContract,
        "DEFAULT_ADMIN_ROLE",
        destinationAddress
      )}`
    );
  });

task("checkRoles", "Check if an address has roles")
  .addParam("contractaddress", "The address of the BaseToken contract")
  .addParam("destinationaddress", "The address to check the roles")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;
    const contractAddress = taskArgs.contractaddress;
    const destinationAddress = taskArgs.destinationaddress;

    const tokenContract = await ethers.getContractAt(
      "BaseToken",
      contractAddress
    );

    const ROLES = [
      "DEFAULT_ADMIN_ROLE",
      "MINTER_ROLE",
      "BURNER_ROLE",
      "PAUSER_ROLE",
      "UNPAUSER_ROLE",
      "TRUSTED_FORWARDER_SETTER_ROLE",
    ];

    console.log(`Checking roles for address ${destinationAddress}`);
    for (const role of ROLES) {
      const hasRole = await checkRole(tokenContract, role, destinationAddress);
      console.log(`Address ${destinationAddress} has role ${role}: ${hasRole}`);
    }
  });

task("renounceAdminRole", "Renounce admin role")
  .addParam("contractaddress", "The address of the BaseToken contract")
  .addParam("backupaddress", "Another admin address (to avoid locking)")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;
    const contractAddress = taskArgs.contractaddress;
    const backupaddress = taskArgs.backupaddress;
    const [adminSigner] = await ethers.getSigners();

    const tokenContract = await ethers.getContractAt(
      "BaseToken",
      contractAddress
    );

    if (
      !(await checkRole(
        tokenContract,
        "DEFAULT_ADMIN_ROLE",
        adminSigner.address
      ))
    ) {
      throw new Error("Admin address does not have DEFAULT_ADMIN_ROLE");
    }

    if (
      !(await checkRole(tokenContract, "DEFAULT_ADMIN_ROLE", backupaddress))
    ) {
      throw new Error(
        "Backup address does not have DEFAULT_ADMIN_ROLE. Please give it the role before renouncing"
      );
    }

    console.log("Renouncing admin role");
    const renounceAdminRoleTx = await tokenContract
      .connect(adminSigner)
      .renounceRole(
        await tokenContract.DEFAULT_ADMIN_ROLE(),
        adminSigner.address
      );
    console.log(
      "Tx hash:",
      renounceAdminRoleTx.hash,
      "waiting for confirmation..."
    );
    await renounceAdminRoleTx.wait();
  });

async function checkRole(
  tokenContract: any,
  role: string,
  address: string
): Promise<boolean> {
  const roleCode = await tokenContract[role]();
  return await tokenContract.hasRole(roleCode, address);
}

async function grantRole(
  tokenContract: any,
  adminSigner: any,
  role: string,
  address: string
) {
  console.log(`Granting role ${role} to ${address}`);
  const roleCode = await tokenContract[role]();
  const grantRoleTx = await tokenContract
    .connect(adminSigner)
    .grantRole(roleCode, address);
  console.log("Tx hash:", grantRoleTx.hash, "waiting for confirmation...");
  await grantRoleTx.wait();
}
