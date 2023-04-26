import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Base Token", function () {
  async function deployMeldTokenFixture() {
    const [
      owner,
      minter,
      burner,
      pauser,
      unpauser,
      forwarderSetter,
      trustedForwarder,
    ] = await ethers.getSigners();

    const tokenName = "Test Token";
    const tokenSymbol = "TTKN";
    const tokenDecimals = 6;

    const BaseToken = await ethers.getContractFactory("BaseToken");
    const testToken = await BaseToken.connect(owner).deploy(
      owner.address,
      tokenName,
      tokenSymbol,
      tokenDecimals
    );

    return {
      testToken,
      tokenName,
      tokenSymbol,
      tokenDecimals,
      owner,
      minter,
      burner,
      pauser,
      unpauser,
      forwarderSetter,
      trustedForwarder,
    };
  }

  async function deployMeldTokenAndGrantRolesFixture() {
    const {
      testToken,
      tokenName,
      tokenSymbol,
      tokenDecimals,
      owner,
      minter,
      burner,
      pauser,
      unpauser,
      forwarderSetter,
      trustedForwarder,
    } = await loadFixture(deployMeldTokenFixture);

    // Minter without limit
    await testToken
      .connect(owner)
      .setMintingAccount(
        minter.address,
        ethers.BigNumber.from(10).pow(6).mul(4),
        0
      );

    await testToken
      .connect(owner)
      .grantRole(testToken.BURNER_ROLE(), burner.address);

    await testToken
      .connect(owner)
      .grantRole(testToken.PAUSER_ROLE(), pauser.address);

    await testToken
      .connect(owner)
      .grantRole(testToken.UNPAUSER_ROLE(), unpauser.address);

    await testToken
      .connect(owner)
      .grantRole(
        testToken.TRUSTED_FORWARDER_SETTER_ROLE(),
        forwarderSetter.address
      );

    return {
      testToken,
      tokenName,
      tokenSymbol,
      tokenDecimals,
      owner,
      minter,
      burner,
      pauser,
      unpauser,
      forwarderSetter,
      trustedForwarder,
    };
  }

  describe("Basic info", function () {
    it("Should have the right name", async function () {
      const { testToken, tokenName } = await loadFixture(
        deployMeldTokenFixture
      );

      expect(await testToken.name()).to.equal(tokenName);
    });

    it("Should have the right symbol", async function () {
      const { testToken, tokenSymbol } = await loadFixture(
        deployMeldTokenFixture
      );

      expect(await testToken.symbol()).to.equal(tokenSymbol);
    });

    it("Should have the right decimals", async function () {
      const { testToken, tokenDecimals } = await loadFixture(
        deployMeldTokenFixture
      );

      expect(await testToken.decimals()).to.equal(tokenDecimals);
    });

    it("Should have a total supply of 0", async function () {
      const { testToken } = await loadFixture(deployMeldTokenFixture);

      expect(await testToken.totalSupply()).to.equal(0);
    });
  });

  describe("Constructor", function () {
    it("Should not be able to set the default admin to the zero address", async function () {
      const [owner] = await ethers.getSigners();

      const tokenName = "Test Token";
      const tokenSymbol = "TTKN";
      const tokenDecimals = 6;

      const BaseToken = await ethers.getContractFactory("BaseToken");

      await expect(
        BaseToken.connect(owner).deploy(
          ethers.constants.AddressZero,
          tokenName,
          tokenSymbol,
          tokenDecimals
        )
      ).to.be.revertedWith(
        "BaseToken: Default admin cannot be the zero address"
      );
    });
  });

  describe("Roles", function () {
    it("Should show the owner has the DEFAULT_ADMIN_ROLE ", async function () {
      const { testToken, owner } = await loadFixture(deployMeldTokenFixture);

      expect(
        await testToken.hasRole(testToken.DEFAULT_ADMIN_ROLE(), owner.address)
      ).to.be.true;
    });

    it("Should grant the MINTER_ROLE to the minter", async function () {
      const { testToken, owner, minter } = await loadFixture(
        deployMeldTokenFixture
      );

      expect(await testToken.hasRole(testToken.MINTER_ROLE(), minter.address))
        .to.be.false;

      const grantRoleTx = await testToken
        .connect(owner)
        .grantRole(testToken.MINTER_ROLE(), minter.address);

      const grantRoleRcpt = await grantRoleTx.wait();

      expect(grantRoleRcpt.events).to.have.lengthOf(1);
      const grantRoleEv = grantRoleRcpt.events![0];
      expect(grantRoleEv.event).to.equal("RoleGranted");
      expect(grantRoleEv.args?.role).to.equal(await testToken.MINTER_ROLE());
      expect(grantRoleEv.args?.account).to.equal(minter.address);
      expect(grantRoleEv.args?.sender).to.equal(owner.address);

      expect(await testToken.hasRole(testToken.MINTER_ROLE(), minter.address))
        .to.be.true;
    });

    it("Should grant the BURNER_ROLE to the burner", async function () {
      const { testToken, owner, burner } = await loadFixture(
        deployMeldTokenFixture
      );

      expect(await testToken.hasRole(testToken.BURNER_ROLE(), burner.address))
        .to.be.false;

      const grantRoleTx = await testToken
        .connect(owner)
        .grantRole(testToken.BURNER_ROLE(), burner.address);

      const grantRoleRcpt = await grantRoleTx.wait();

      expect(grantRoleRcpt.events).to.have.lengthOf(1);
      const grantRoleEv = grantRoleRcpt.events![0];
      expect(grantRoleEv.event).to.equal("RoleGranted");
      expect(grantRoleEv.args?.role).to.equal(await testToken.BURNER_ROLE());
      expect(grantRoleEv.args?.account).to.equal(burner.address);
      expect(grantRoleEv.args?.sender).to.equal(owner.address);

      expect(await testToken.hasRole(testToken.BURNER_ROLE(), burner.address))
        .to.be.true;
    });

    it("Should grant the PAUSER_ROLE to the pauser", async function () {
      const { testToken, owner, pauser } = await loadFixture(
        deployMeldTokenFixture
      );

      expect(await testToken.hasRole(testToken.PAUSER_ROLE(), pauser.address))
        .to.be.false;

      const grantRoleTx = await testToken
        .connect(owner)
        .grantRole(testToken.PAUSER_ROLE(), pauser.address);

      const grantRoleRcpt = await grantRoleTx.wait();

      expect(grantRoleRcpt.events).to.have.lengthOf(1);
      const grantRoleEv = grantRoleRcpt.events![0];
      expect(grantRoleEv.event).to.equal("RoleGranted");
      expect(grantRoleEv.args?.role).to.equal(await testToken.PAUSER_ROLE());
      expect(grantRoleEv.args?.account).to.equal(pauser.address);
      expect(grantRoleEv.args?.sender).to.equal(owner.address);

      expect(await testToken.hasRole(testToken.PAUSER_ROLE(), pauser.address))
        .to.be.true;
    });

    it("Should grant the UNPAUSER_ROLE to the unpauser", async function () {
      const { testToken, owner, unpauser } = await loadFixture(
        deployMeldTokenFixture
      );

      expect(
        await testToken.hasRole(testToken.UNPAUSER_ROLE(), unpauser.address)
      ).to.be.false;

      const grantRoleTx = await testToken
        .connect(owner)
        .grantRole(testToken.UNPAUSER_ROLE(), unpauser.address);

      const grantRoleRcpt = await grantRoleTx.wait();

      expect(grantRoleRcpt.events).to.have.lengthOf(1);
      const grantRoleEv = grantRoleRcpt.events![0];
      expect(grantRoleEv.event).to.equal("RoleGranted");
      expect(grantRoleEv.args?.role).to.equal(await testToken.UNPAUSER_ROLE());
      expect(grantRoleEv.args?.account).to.equal(unpauser.address);
      expect(grantRoleEv.args?.sender).to.equal(owner.address);

      expect(
        await testToken.hasRole(testToken.UNPAUSER_ROLE(), unpauser.address)
      ).to.be.true;
    });

    it("Should grant the TRUSTED_FORWARDER_SETTER_ROLE to the forwarderSetter", async function () {
      const { testToken, owner, forwarderSetter } = await loadFixture(
        deployMeldTokenFixture
      );

      expect(
        await testToken.hasRole(
          testToken.TRUSTED_FORWARDER_SETTER_ROLE(),
          forwarderSetter.address
        )
      ).to.be.false;

      const grantRoleTx = await testToken
        .connect(owner)
        .grantRole(
          testToken.TRUSTED_FORWARDER_SETTER_ROLE(),
          forwarderSetter.address
        );

      const grantRoleRcpt = await grantRoleTx.wait();

      expect(grantRoleRcpt.events).to.have.lengthOf(1);
      const grantRoleEv = grantRoleRcpt.events![0];
      expect(grantRoleEv.event).to.equal("RoleGranted");
      expect(grantRoleEv.args?.role).to.equal(
        await testToken.TRUSTED_FORWARDER_SETTER_ROLE()
      );
      expect(grantRoleEv.args?.account).to.equal(forwarderSetter.address);
      expect(grantRoleEv.args?.sender).to.equal(owner.address);

      expect(
        await testToken.hasRole(
          testToken.TRUSTED_FORWARDER_SETTER_ROLE(),
          forwarderSetter.address
        )
      ).to.be.true;
    });

    it("Should be able to transfer the DEFAULT_ADMIN_ROLE and renounce it", async function () {
      const { testToken, owner, minter } = await loadFixture(
        deployMeldTokenFixture
      );

      expect(
        await testToken.hasRole(testToken.DEFAULT_ADMIN_ROLE(), owner.address)
      ).to.be.true;

      const grantRoleTx = await testToken
        .connect(owner)
        .grantRole(testToken.DEFAULT_ADMIN_ROLE(), minter.address);

      const grantRoleRcpt = await grantRoleTx.wait();

      expect(grantRoleRcpt.events).to.have.lengthOf(1);
      const grantRoleEv = grantRoleRcpt.events![0];
      expect(grantRoleEv.event).to.equal("RoleGranted");
      expect(grantRoleEv.args?.role).to.equal(
        await testToken.DEFAULT_ADMIN_ROLE()
      );
      expect(grantRoleEv.args?.account).to.equal(minter.address);
      expect(grantRoleEv.args?.sender).to.equal(owner.address);

      expect(
        await testToken.hasRole(testToken.DEFAULT_ADMIN_ROLE(), minter.address)
      ).to.be.true;

      const renounceRoleTx = await testToken
        .connect(minter)
        .renounceRole(testToken.DEFAULT_ADMIN_ROLE(), minter.address);

      const renounceRoleRcpt = await renounceRoleTx.wait();

      expect(renounceRoleRcpt.events).to.have.lengthOf(1);
      const renounceRoleEv = renounceRoleRcpt.events![0];
      expect(renounceRoleEv.event).to.equal("RoleRevoked");
      expect(renounceRoleEv.args?.role).to.equal(
        await testToken.DEFAULT_ADMIN_ROLE()
      );
      expect(renounceRoleEv.args?.account).to.equal(minter.address);
      expect(renounceRoleEv.args?.sender).to.equal(minter.address);

      expect(
        await testToken.hasRole(testToken.DEFAULT_ADMIN_ROLE(), minter.address)
      ).to.be.false;
    });

    it("Should not be able to set minting account to the zero address", async function () {
      const { testToken, owner } = await loadFixture(deployMeldTokenFixture);

      await expect(
        testToken.setMintingAccount(ethers.constants.AddressZero, 1000, 1000)
      ).to.be.revertedWith("BaseToken: Account cannot be the zero address");
    });

    it("Should be able to revoke a role", async function () {
      const { testToken, owner, minter } = await loadFixture(
        deployMeldTokenAndGrantRolesFixture
      );

      expect(await testToken.hasRole(testToken.MINTER_ROLE(), minter.address))
        .to.be.true;

      const revokeRoleTx = await testToken
        .connect(owner)
        .revokeRole(testToken.MINTER_ROLE(), minter.address);

      const revokeRoleRcpt = await revokeRoleTx.wait();

      expect(revokeRoleRcpt.events).to.have.lengthOf(1);
      const revokeRoleEv = revokeRoleRcpt.events![0];
      expect(revokeRoleEv.event).to.equal("RoleRevoked");
      expect(revokeRoleEv.args?.role).to.equal(await testToken.MINTER_ROLE());
      expect(revokeRoleEv.args?.account).to.equal(minter.address);
      expect(revokeRoleEv.args?.sender).to.equal(owner.address);

      expect(await testToken.hasRole(testToken.MINTER_ROLE(), minter.address))
        .to.be.false;
    });
  });

  describe("Pausing", function () {
    it("Should not pause if the account does not have the PAUSER_ROLE", async function () {
      const { testToken, pauser } = await loadFixture(deployMeldTokenFixture);

      const expectedException = `AccessControl: account ${pauser.address.toLowerCase()} is missing role ${(
        await testToken.PAUSER_ROLE()
      ).toLowerCase()}`;

      await expect(testToken.connect(pauser).pause()).to.be.revertedWith(
        expectedException
      );
    });

    it("Should pause if the account has the PAUSER_ROLE", async function () {
      const { testToken, pauser } = await loadFixture(
        deployMeldTokenAndGrantRolesFixture
      );

      const pauseTx = await testToken.connect(pauser).pause();

      const pauseRcpt = await pauseTx.wait();

      expect(pauseRcpt.events).to.have.lengthOf(1);
      const pauseEv = pauseRcpt.events![0];
      expect(pauseEv.event).to.equal("Paused");
      expect(pauseEv.args?.account).to.equal(pauser.address);
    });

    it("Should not pause if the contract is already paused", async function () {
      const { testToken, pauser } = await loadFixture(
        deployMeldTokenAndGrantRolesFixture
      );

      const pauseTx = await testToken.connect(pauser).pause();

      await pauseTx.wait();

      await expect(testToken.connect(pauser).pause()).to.be.revertedWith(
        "Pausable: paused"
      );
    });
  });

  describe("Unpausing", function () {
    it("Should not unpause if the account does not have the UNPAUSER_ROLE", async function () {
      const { testToken, unpauser } = await loadFixture(deployMeldTokenFixture);

      const expectedException = `AccessControl: account ${unpauser.address.toLowerCase()} is missing role ${(
        await testToken.UNPAUSER_ROLE()
      ).toLowerCase()}`;

      await expect(testToken.connect(unpauser).unpause()).to.be.revertedWith(
        expectedException
      );
    });

    it("Should unpause if the account has the UNPAUSER_ROLE", async function () {
      const { testToken, pauser, unpauser } = await loadFixture(
        deployMeldTokenAndGrantRolesFixture
      );

      const pauseTx = await testToken.connect(pauser).pause();

      await pauseTx.wait();

      const unpauseTx = await testToken.connect(unpauser).unpause();

      const unpauseRcpt = await unpauseTx.wait();

      expect(unpauseRcpt.events).to.have.lengthOf(1);
      const unpauseEv = unpauseRcpt.events![0];
      expect(unpauseEv.event).to.equal("Unpaused");
      expect(unpauseEv.args?.account).to.equal(unpauser.address);
    });
  });

  describe("Minting", function () {
    it("Should not mint tokens if the minter does not have the MINTER_ROLE", async function () {
      const { testToken, minter } = await loadFixture(deployMeldTokenFixture);

      const mintAmount = 1000;

      const expectedException = `AccessControl: account ${minter.address.toLowerCase()} is missing role ${(
        await testToken.MINTER_ROLE()
      ).toLowerCase()}`;

      await expect(
        testToken.connect(minter).mint(minter.address, mintAmount)
      ).to.be.revertedWith(expectedException);
    });

    it("Should mint tokens to the minter", async function () {
      const { testToken, minter } = await loadFixture(
        deployMeldTokenAndGrantRolesFixture
      );

      const mintAmount = 1000;

      const mintTx = await testToken
        .connect(minter)
        .mint(minter.address, mintAmount);

      const mintRcpt = await mintTx.wait();

      expect(mintRcpt.events).to.have.lengthOf(1);
      const mintEv = mintRcpt.events![0];
      expect(mintEv.event).to.equal("Transfer");
      expect(mintEv.args?.from).to.equal(ethers.constants.AddressZero);
      expect(mintEv.args?.to).to.equal(minter.address);
      expect(mintEv.args?.value).to.equal(mintAmount);
    });

    it("Should not mint tokens if the contract is paused", async function () {
      const { testToken, minter, pauser } = await loadFixture(
        deployMeldTokenAndGrantRolesFixture
      );

      const mintAmount = 1000;

      const pauseTx = await testToken.connect(pauser).pause();

      await pauseTx.wait();

      await expect(
        testToken.connect(minter).mint(minter.address, mintAmount)
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should not mint tokens if the amount is 0", async function () {
      const { testToken, minter } = await loadFixture(
        deployMeldTokenAndGrantRolesFixture
      );

      const mintAmount = 0;

      await expect(
        testToken.connect(minter).mint(minter.address, mintAmount)
      ).to.be.revertedWith("BaseToken: Amount must be greater than 0");
    });

    it("Should be able to remove the MINTER_ROLE", async function () {
      const { owner, testToken, minter } = await loadFixture(
        deployMeldTokenAndGrantRolesFixture
      );

      const revokeTx = await testToken
        .connect(owner)
        .setMintingAccount(minter.address, 0, 0);

      const revokeRcpt = await revokeTx.wait();

      expect(revokeRcpt.events).to.have.lengthOf(2);
      const revokeEv = revokeRcpt.events![1];
      expect(revokeEv.event).to.equal("MintingPermissionChanged");
      expect(revokeEv.args?.account).to.equal(minter.address);
      expect(revokeEv.args?.amountThreshold).to.equal(0);
      expect(revokeEv.args?.periodLength).to.equal(0);

      expect(
        await testToken.hasRole(await testToken.MINTER_ROLE(), minter.address)
      ).to.equal(false);
    });

    it("Should set a minting threshold", async function () {
      const { testToken, owner, minter } = await loadFixture(
        deployMeldTokenFixture
      );

      // Threshold is 1000 MELD per day
      const mintingPeriodLength = 86400;
      const mintingAmountThreshold = ethers.BigNumber.from(10)
        .pow(18 + 4)
        .mul(1000);

      const setMintingAccountTx = await testToken
        .connect(owner)
        .setMintingAccount(
          minter.address,
          mintingAmountThreshold,
          mintingPeriodLength
        );

      const setMintingAccountRcpt = await setMintingAccountTx.wait();

      expect(setMintingAccountRcpt.events).to.have.lengthOf(2);
      const setMintingAccountEv = setMintingAccountRcpt.events![1];
      expect(setMintingAccountEv.event).to.equal("MintingPermissionChanged");
      expect(setMintingAccountEv.args?.account).to.equal(minter.address);
      expect(setMintingAccountEv.args?.amountThreshold).to.equal(
        mintingAmountThreshold
      );
      expect(setMintingAccountEv.args?.periodLength).to.equal(
        mintingPeriodLength
      );

      expect(await testToken.mintingAmountThreshold(minter.address)).to.equal(
        mintingAmountThreshold
      );
      expect(await testToken.mintingPeriodLength(minter.address)).to.equal(
        mintingPeriodLength
      );
    });

    it("Should be able to mint within the threshold", async function () {
      const { testToken, owner, minter } = await loadFixture(
        deployMeldTokenFixture
      );

      // Threshold is 1000 MELD per day
      const mintingPeriodLength = 86400;
      const mintingAmountThreshold = ethers.BigNumber.from(10)
        .pow(18)
        .mul(1000);

      const setMintingAccountTx = await testToken
        .connect(owner)
        .setMintingAccount(
          minter.address,
          mintingAmountThreshold,
          mintingPeriodLength
        );

      await setMintingAccountTx.wait();

      const mintAmount = ethers.BigNumber.from(10).pow(18).mul(500);

      const mintTx = await testToken
        .connect(minter)
        .mint(minter.address, mintAmount);

      const mintRcpt = await mintTx.wait();

      expect(mintRcpt.events).to.have.lengthOf(1);
      const mintEv = mintRcpt.events![0];
      expect(mintEv.event).to.equal("Transfer");
      expect(mintEv.args?.from).to.equal(ethers.constants.AddressZero);
      expect(mintEv.args?.to).to.equal(minter.address);
      expect(mintEv.args?.value).to.equal(mintAmount);

      expect(await testToken.balanceOf(minter.address)).to.equal(mintAmount);
      expect(await testToken.totalSupply()).to.equal(mintAmount);
      expect(await testToken.currentMintingAmount(minter.address)).to.equal(
        mintAmount
      );

      const timestamp = (await ethers.provider.getBlock(mintTx.blockNumber!))
        .timestamp;
      expect(await testToken.lastMintingPeriod(minter.address)).to.equal(
        timestamp
      );

      const mint2Amount = ethers.BigNumber.from(10).pow(18).mul(500);

      const mint2Tx = await testToken
        .connect(minter)
        .mint(minter.address, mint2Amount);

      const mint2Rcpt = await mint2Tx.wait();

      expect(mint2Rcpt.events).to.have.lengthOf(1);
      const mint2Ev = mint2Rcpt.events![0];
      expect(mint2Ev.event).to.equal("Transfer");
      expect(mint2Ev.args?.from).to.equal(ethers.constants.AddressZero);
      expect(mint2Ev.args?.to).to.equal(minter.address);
      expect(mint2Ev.args?.value).to.equal(mint2Amount);

      const totalAmount = mintAmount.add(mint2Amount);

      expect(await testToken.balanceOf(minter.address)).to.equal(totalAmount);
      expect(await testToken.totalSupply()).to.equal(totalAmount);
      expect(await testToken.currentMintingAmount(minter.address)).to.equal(
        totalAmount
      );
      expect(await testToken.lastMintingPeriod(minter.address)).to.equal(
        timestamp
      );
    });

    it("Should not be able to mint beyond the threshold", async function () {
      const { testToken, owner, minter } = await loadFixture(
        deployMeldTokenFixture
      );

      // Threshold is 1000 MELD per day
      const mintingPeriodLength = 86400;
      const mintingAmountThreshold = ethers.BigNumber.from(10)
        .pow(18)
        .mul(1000);

      const setMintingAccountTx = await testToken
        .connect(owner)
        .setMintingAccount(
          minter.address,
          mintingAmountThreshold,
          mintingPeriodLength
        );

      await setMintingAccountTx.wait();

      const mintAmount = ethers.BigNumber.from(10).pow(18).mul(500);

      const mintTx = await testToken
        .connect(minter)
        .mint(minter.address, mintAmount);

      await mintTx.wait();

      const mint2Amount = ethers.BigNumber.from(10).pow(18).mul(501);

      await expect(
        testToken.connect(minter).mint(minter.address, mint2Amount)
      ).to.be.revertedWith("BaseToken: Minting amount exceeds threshold");
    });

    it("Should be able to mint again after the period", async function () {
      const { testToken, owner, minter } = await loadFixture(
        deployMeldTokenFixture
      );

      // Threshold is 1000 MELD per day
      const mintingPeriodLength = 86400;
      const mintingAmountThreshold = ethers.BigNumber.from(10)
        .pow(18)
        .mul(1000);

      const setMintingAccountTx = await testToken
        .connect(owner)
        .setMintingAccount(
          minter.address,
          mintingAmountThreshold,
          mintingPeriodLength
        );

      await setMintingAccountTx.wait();

      const mintAmount = ethers.BigNumber.from(10).pow(18).mul(500);

      const mintTx = await testToken
        .connect(minter)
        .mint(minter.address, mintAmount);

      await mintTx.wait();

      expect(await testToken.balanceOf(minter.address)).to.equal(mintAmount);
      expect(await testToken.totalSupply()).to.equal(mintAmount);
      expect(await testToken.currentMintingAmount(minter.address)).to.equal(
        mintAmount
      );

      const timestamp1 = (await ethers.provider.getBlock(mintTx.blockNumber!))
        .timestamp;
      expect(await testToken.lastMintingPeriod(minter.address)).to.equal(
        timestamp1
      );

      const mint2Amount = ethers.BigNumber.from(10).pow(18).mul(500);

      const mint2Tx = await testToken
        .connect(minter)
        .mint(minter.address, mint2Amount);

      await mint2Tx.wait();

      let totalAmount = mintAmount.add(mint2Amount);

      expect(await testToken.balanceOf(minter.address)).to.equal(totalAmount);
      expect(await testToken.totalSupply()).to.equal(totalAmount);
      expect(await testToken.currentMintingAmount(minter.address)).to.equal(
        totalAmount
      );
      expect(await testToken.lastMintingPeriod(minter.address)).to.equal(
        timestamp1
      );

      // Wait for the period to end
      await time.increase(mintingPeriodLength + 1);

      const mint3Amount = ethers.BigNumber.from(10).pow(18).mul(800);

      const mint3Tx = await testToken
        .connect(minter)
        .mint(minter.address, mint3Amount);

      const mint3Rcpt = await mint3Tx.wait();

      expect(mint3Rcpt.events).to.have.lengthOf(1);
      const mint3Ev = mint3Rcpt.events![0];
      expect(mint3Ev.event).to.equal("Transfer");
      expect(mint3Ev.args?.from).to.equal(ethers.constants.AddressZero);
      expect(mint3Ev.args?.to).to.equal(minter.address);
      expect(mint3Ev.args?.value).to.equal(mint3Amount);

      totalAmount = totalAmount.add(mint3Amount);

      expect(await testToken.balanceOf(minter.address)).to.equal(totalAmount);
      expect(await testToken.totalSupply()).to.equal(totalAmount);
      expect(await testToken.currentMintingAmount(minter.address)).to.equal(
        mint3Amount
      );
      const timestamp2 = (await ethers.provider.getBlock(mint3Tx.blockNumber!))
        .timestamp;
      expect(await testToken.lastMintingPeriod(minter.address)).to.equal(
        timestamp2
      );
    });
  });

  describe("Burning", function () {
    it("Should not burn tokens if the account does not have the BURNER_ROLE", async function () {
      const { testToken, minter } = await loadFixture(deployMeldTokenFixture);

      const burnAmount = 1000;
      const expectedException = `AccessControl: account ${minter.address.toLowerCase()} is missing role ${(
        await testToken.BURNER_ROLE()
      ).toLowerCase()}`;
      await expect(
        testToken.connect(minter).burn(burnAmount)
      ).to.be.revertedWith(expectedException);
    });

    it("Should not burn tokens if there isn't enough balance", async function () {
      const { testToken, burner } = await loadFixture(
        deployMeldTokenAndGrantRolesFixture
      );

      const burnAmount = 1000;

      await expect(
        testToken.connect(burner).burn(burnAmount)
      ).to.be.revertedWith("ERC20: burn amount exceeds balance");
    });

    it("Should burn tokens from the burner", async function () {
      const { testToken, minter, burner } = await loadFixture(
        deployMeldTokenAndGrantRolesFixture
      );

      const mintAmount = 1000;

      const mintTx = await testToken
        .connect(minter)
        .mint(burner.address, mintAmount);

      await mintTx.wait();

      const burnTx = await testToken.connect(burner).burn(mintAmount);

      const burnRcpt = await burnTx.wait();

      expect(burnRcpt.events).to.have.lengthOf(1);
      const burnEv = burnRcpt.events![0];
      expect(burnEv.event).to.equal("Transfer");
      expect(burnEv.args?.from).to.equal(burner.address);
      expect(burnEv.args?.to).to.equal(ethers.constants.AddressZero);
      expect(burnEv.args?.value).to.equal(mintAmount);
    });

    it("Should not burn tokens if the contract is paused", async function () {
      const { testToken, minter, burner, pauser } = await loadFixture(
        deployMeldTokenAndGrantRolesFixture
      );

      const mintAmount = 1000;

      const mintTx = await testToken
        .connect(minter)
        .mint(minter.address, mintAmount);

      await mintTx.wait();

      const pauseTx = await testToken.connect(pauser).pause();

      await pauseTx.wait();

      await expect(
        testToken.connect(burner).burn(mintAmount)
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should not burn tokens if the amount is 0", async function () {
      const { testToken, burner } = await loadFixture(
        deployMeldTokenAndGrantRolesFixture
      );

      const burnAmount = 0;

      await expect(
        testToken.connect(burner).burn(burnAmount)
      ).to.be.revertedWith("BaseToken: Amount must be greater than 0");
    });
  });

  describe("Transfer", function () {
    it("Should be able to transfer MELD tokens", async function () {
      const { testToken, minter, pauser } = await loadFixture(
        deployMeldTokenAndGrantRolesFixture
      );

      const mintAmount = 1000;
      const transferAmount = 500;

      const mintTx = await testToken
        .connect(minter)
        .mint(minter.address, mintAmount);

      await mintTx.wait();

      const balanceBefore = await testToken.balanceOf(pauser.address);
      expect(balanceBefore).to.equal(0);

      const transferTx = await testToken
        .connect(minter)
        .transfer(pauser.address, transferAmount);

      const transferRcpt = await transferTx.wait();

      expect(transferRcpt.events).to.have.lengthOf(1);
      const transferEv = transferRcpt.events![0];
      expect(transferEv.event).to.equal("Transfer");
      expect(transferEv.args?.from).to.equal(minter.address);
      expect(transferEv.args?.to).to.equal(pauser.address);
      expect(transferEv.args?.value).to.equal(transferAmount);

      const balanceAfter = await testToken.balanceOf(pauser.address);
      expect(balanceAfter).to.equal(transferAmount);
    });

    it("Should not be able to transfer more than the balance", async function () {
      const { testToken, minter, pauser } = await loadFixture(
        deployMeldTokenAndGrantRolesFixture
      );

      const mintAmount = 1000;
      const transferAmount = 1500;

      const mintTx = await testToken
        .connect(minter)
        .mint(minter.address, mintAmount);

      await mintTx.wait();

      await expect(
        testToken.connect(minter).transfer(pauser.address, transferAmount)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("Should not be allowed to transfer MELD tokens to the MeldToken contract", async function () {
      const { testToken, minter } = await loadFixture(
        deployMeldTokenAndGrantRolesFixture
      );

      const mintAmount = 1000;
      const transferAmount = 500;

      const mintTx = await testToken
        .connect(minter)
        .mint(minter.address, mintAmount);

      await mintTx.wait();

      await expect(
        testToken.connect(minter).transfer(testToken.address, transferAmount)
      ).to.be.revertedWith("BaseToken: Cannot transfer to this contract");
    });
  });

  describe("Approve", function () {
    it("Should be able to approve MELD tokens", async function () {
      const { testToken, minter, pauser } = await loadFixture(
        deployMeldTokenAndGrantRolesFixture
      );

      const mintAmount = 1000;
      const approveAmount = 500;

      const mintTx = await testToken
        .connect(minter)
        .mint(minter.address, mintAmount);

      await mintTx.wait();

      const allowanceBefore = await testToken.allowance(
        minter.address,
        pauser.address
      );
      expect(allowanceBefore).to.equal(0);

      const approveTx = await testToken
        .connect(minter)
        .approve(pauser.address, approveAmount);

      const approveRcpt = await approveTx.wait();

      expect(approveRcpt.events).to.have.lengthOf(1);
      const approveEv = approveRcpt.events![0];
      expect(approveEv.event).to.equal("Approval");
      expect(approveEv.args?.owner).to.equal(minter.address);
      expect(approveEv.args?.spender).to.equal(pauser.address);
      expect(approveEv.args?.value).to.equal(approveAmount);

      const allowanceAfter = await testToken.allowance(
        minter.address,
        pauser.address
      );
      expect(allowanceAfter).to.equal(approveAmount);
    });

    it("Should be able to increase MELD tokens allowance", async function () {
      const { testToken, minter, pauser } = await loadFixture(
        deployMeldTokenAndGrantRolesFixture
      );

      const mintAmount = 1000;
      const approveAmount = 500;
      const increaseAmount = 250;

      const mintTx = await testToken
        .connect(minter)
        .mint(minter.address, mintAmount);

      await mintTx.wait();

      const approveTx = await testToken
        .connect(minter)
        .approve(pauser.address, approveAmount);

      await approveTx.wait();

      const allowanceBefore = await testToken.allowance(
        minter.address,
        pauser.address
      );
      expect(allowanceBefore).to.equal(approveAmount);

      const increaseTx = await testToken
        .connect(minter)
        .increaseAllowance(pauser.address, increaseAmount);

      const increaseRcpt = await increaseTx.wait();

      expect(increaseRcpt.events).to.have.lengthOf(1);
      const increaseEv = increaseRcpt.events![0];
      expect(increaseEv.event).to.equal("Approval");
      expect(increaseEv.args?.owner).to.equal(minter.address);
      expect(increaseEv.args?.spender).to.equal(pauser.address);
      expect(increaseEv.args?.value).to.equal(approveAmount + increaseAmount);

      const allowanceAfter = await testToken.allowance(
        minter.address,
        pauser.address
      );
      expect(allowanceAfter).to.equal(approveAmount + increaseAmount);
    });

    it("Should be able to decrease MELD tokens allowance", async function () {
      const { testToken, minter, pauser } = await loadFixture(
        deployMeldTokenAndGrantRolesFixture
      );

      const mintAmount = 1000;
      const approveAmount = 500;
      const decreaseAmount = 250;

      const mintTx = await testToken
        .connect(minter)
        .mint(minter.address, mintAmount);

      await mintTx.wait();

      const approveTx = await testToken
        .connect(minter)
        .approve(pauser.address, approveAmount);

      await approveTx.wait();

      const allowanceBefore = await testToken.allowance(
        minter.address,
        pauser.address
      );
      expect(allowanceBefore).to.equal(approveAmount);

      const decreaseTx = await testToken
        .connect(minter)
        .decreaseAllowance(pauser.address, decreaseAmount);

      const decreaseRcpt = await decreaseTx.wait();

      expect(decreaseRcpt.events).to.have.lengthOf(1);
      const decreaseEv = decreaseRcpt.events![0];
      expect(decreaseEv.event).to.equal("Approval");
      expect(decreaseEv.args?.owner).to.equal(minter.address);
      expect(decreaseEv.args?.spender).to.equal(pauser.address);
      expect(decreaseEv.args?.value).to.equal(approveAmount - decreaseAmount);

      const allowanceAfter = await testToken.allowance(
        minter.address,
        pauser.address
      );
      expect(allowanceAfter).to.equal(approveAmount - decreaseAmount);
    });

    it("Should not be able to decrease MELD tokens allowance below zero", async function () {
      const { testToken, minter, pauser } = await loadFixture(
        deployMeldTokenAndGrantRolesFixture
      );

      const mintAmount = 1000;
      const approveAmount = 500;
      const decreaseAmount = 750;

      const mintTx = await testToken
        .connect(minter)
        .mint(minter.address, mintAmount);

      await mintTx.wait();

      const approveTx = await testToken
        .connect(minter)
        .approve(pauser.address, approveAmount);

      await approveTx.wait();

      const allowanceBefore = await testToken.allowance(
        minter.address,
        pauser.address
      );
      expect(allowanceBefore).to.equal(approveAmount);

      await expect(
        testToken
          .connect(minter)
          .decreaseAllowance(pauser.address, decreaseAmount)
      ).to.be.revertedWith("ERC20: decreased allowance below zero");

      const allowanceAfter = await testToken.allowance(
        minter.address,
        pauser.address
      );
      expect(allowanceAfter).to.equal(approveAmount);
    });
  });

  describe("Transfer from", function () {
    it("Should be able to transfer allowed MELD tokens", async function () {
      const { testToken, minter, pauser } = await loadFixture(
        deployMeldTokenAndGrantRolesFixture
      );

      const mintAmount = 1000;
      const approveAmount = 500;

      const mintTx = await testToken
        .connect(minter)
        .mint(minter.address, mintAmount);

      await mintTx.wait();

      const approveTx = await testToken
        .connect(minter)
        .approve(pauser.address, approveAmount);

      await approveTx.wait();

      const balanceBefore = await testToken.balanceOf(minter.address);
      expect(balanceBefore).to.equal(mintAmount);

      const transferTx = await testToken
        .connect(pauser)
        .transferFrom(minter.address, pauser.address, approveAmount);

      const transferRcpt = await transferTx.wait();

      expect(transferRcpt.events).to.have.lengthOf(2);
      const transferEv = transferRcpt.events![1];
      expect(transferEv.event).to.equal("Transfer");
      expect(transferEv.args?.from).to.equal(minter.address);
      expect(transferEv.args?.to).to.equal(pauser.address);
      expect(transferEv.args?.value).to.equal(approveAmount);

      const balanceAfter = await testToken.balanceOf(minter.address);
      expect(balanceAfter).to.equal(mintAmount - approveAmount);
    });

    it("Should not be able to transfer more MELD tokens than allowed", async function () {
      const { testToken, minter, pauser } = await loadFixture(
        deployMeldTokenAndGrantRolesFixture
      );

      const mintAmount = 1000;
      const approveAmount = 500;

      const mintTx = await testToken
        .connect(minter)
        .mint(minter.address, mintAmount);

      await mintTx.wait();

      const approveTx = await testToken
        .connect(minter)
        .approve(pauser.address, approveAmount);

      await approveTx.wait();

      const balanceBefore = await testToken.balanceOf(minter.address);
      expect(balanceBefore).to.equal(mintAmount);

      await expect(
        testToken
          .connect(pauser)
          .transferFrom(minter.address, pauser.address, approveAmount + 1)
      ).to.be.revertedWith("ERC20: insufficient allowance");

      const balanceAfter = await testToken.balanceOf(minter.address);
      expect(balanceAfter).to.equal(mintAmount);
    });

    it("Should not be allowed to transfer allowed MELD tokens to the MeldToken contract", async function () {
      const { testToken, minter, pauser } = await loadFixture(
        deployMeldTokenAndGrantRolesFixture
      );

      const mintAmount = 1000;
      const approveAmount = 500;

      const mintTx = await testToken
        .connect(minter)
        .mint(minter.address, mintAmount);

      await mintTx.wait();

      const approveTx = await testToken
        .connect(minter)
        .approve(pauser.address, approveAmount);

      await approveTx.wait();

      const balanceBefore = await testToken.balanceOf(minter.address);
      expect(balanceBefore).to.equal(mintAmount);

      await expect(
        testToken
          .connect(pauser)
          .transferFrom(minter.address, testToken.address, approveAmount)
      ).to.be.revertedWith("BaseToken: Cannot transfer to this contract");

      const balanceAfter = await testToken.balanceOf(minter.address);
      expect(balanceAfter).to.equal(mintAmount);
    });
  });

  describe("Forwarder", function () {
    it("Should show that there isn't a trusted forwarder initially", async function () {
      const { testToken } = await loadFixture(deployMeldTokenFixture);

      const forwarder = await testToken.getTrustedForwarder();
      expect(forwarder).to.equal(ethers.constants.AddressZero);
    });

    it("Should not set a forwarder if the account does not have the TRUSTED_FORWARDER_SETTER_ROLE ", async function () {
      const { testToken, minter, trustedForwarder } = await loadFixture(
        deployMeldTokenAndGrantRolesFixture
      );

      const expectedException = `AccessControl: account ${minter.address.toLowerCase()} is missing role ${(
        await testToken.TRUSTED_FORWARDER_SETTER_ROLE()
      ).toLowerCase()}`;

      await expect(
        testToken.connect(minter).setTrustedForwarder(trustedForwarder.address)
      ).to.be.revertedWith(expectedException);
    });

    it("Should set a forwarder", async function () {
      const { testToken, forwarderSetter, trustedForwarder } =
        await loadFixture(deployMeldTokenAndGrantRolesFixture);

      const setForwarderTx = await testToken
        .connect(forwarderSetter)
        .setTrustedForwarder(trustedForwarder.address);

      const setForwarderRcpt = await setForwarderTx.wait();

      expect(setForwarderRcpt.events).to.have.lengthOf(1);
      const setForwarderEv = setForwarderRcpt.events![0];
      expect(setForwarderEv.event).to.equal("TrustedForwarderChanged");
      expect(setForwarderEv.args?.oldForwarder).to.equal(
        ethers.constants.AddressZero
      );
      expect(setForwarderEv.args?.newForwarder).to.equal(
        trustedForwarder.address
      );

      const forwarder = await testToken.getTrustedForwarder();
      expect(forwarder).to.equal(trustedForwarder.address);

      expect(await testToken.isTrustedForwarder(trustedForwarder.address)).to.be
        .true;
    });

    it("Should not be able to pause the contract from the trusted forwarder", async function () {
      const { testToken, forwarderSetter, trustedForwarder, pauser } =
        await loadFixture(deployMeldTokenAndGrantRolesFixture);

      const setForwarderTx = await testToken
        .connect(forwarderSetter)
        .setTrustedForwarder(trustedForwarder.address);

      await setForwarderTx.wait();

      const cf = await ethers.getContractFactory("BaseToken");
      const functionData = cf.interface.encodeFunctionData("pause", []);

      const functionDataWithAddress = ethers.utils.solidityPack(
        ["bytes", "address"],
        [functionData, pauser.address]
      );

      await expect(
        trustedForwarder.sendTransaction({
          to: testToken.address,
          data: functionDataWithAddress,
        })
      ).to.be.revertedWith("EIP2771Recipient: meta transaction is not allowed");

      const paused = await testToken.paused();
      expect(paused).to.be.false;
    });

    it("Should not be able to unpause the contract from the trusted forwarder", async function () {
      const { testToken, forwarderSetter, trustedForwarder, pauser, unpauser } =
        await loadFixture(deployMeldTokenAndGrantRolesFixture);

      const setForwarderTx = await testToken
        .connect(forwarderSetter)
        .setTrustedForwarder(trustedForwarder.address);

      await setForwarderTx.wait();

      await testToken.connect(pauser).pause();

      expect(await testToken.paused()).to.be.true;

      const cf = await ethers.getContractFactory("BaseToken");
      const functionData = cf.interface.encodeFunctionData("unpause", []);

      const functionDataWithAddress = ethers.utils.solidityPack(
        ["bytes", "address"],
        [functionData, unpauser.address]
      );

      await expect(
        trustedForwarder.sendTransaction({
          to: testToken.address,
          data: functionDataWithAddress,
        })
      ).to.be.revertedWith("EIP2771Recipient: meta transaction is not allowed");

      const paused = await testToken.paused();
      expect(paused).to.be.true;
    });

    it("Should not be able to mint tokens from the trusted forwarder", async function () {
      const { testToken, forwarderSetter, trustedForwarder, minter } =
        await loadFixture(deployMeldTokenAndGrantRolesFixture);

      const setForwarderTx = await testToken
        .connect(forwarderSetter)
        .setTrustedForwarder(trustedForwarder.address);

      await setForwarderTx.wait();

      const mintAmount = 1000;

      const cf = await ethers.getContractFactory("BaseToken");
      const functionData = cf.interface.encodeFunctionData("mint", [
        trustedForwarder.address,
        mintAmount,
      ]);

      const functionDataWithAddress = ethers.utils.solidityPack(
        ["bytes", "address"],
        [functionData, minter.address]
      );

      await expect(
        trustedForwarder.sendTransaction({
          to: testToken.address,
          data: functionDataWithAddress,
        })
      ).to.be.revertedWith("EIP2771Recipient: meta transaction is not allowed");

      const balance = await testToken.balanceOf(trustedForwarder.address);
      expect(balance).to.equal(0);
    });

    it("Should not be able to burn tokens from the trusted forwarder", async function () {
      const { testToken, forwarderSetter, trustedForwarder, minter, burner } =
        await loadFixture(deployMeldTokenAndGrantRolesFixture);

      const setForwarderTx = await testToken
        .connect(forwarderSetter)
        .setTrustedForwarder(trustedForwarder.address);

      await setForwarderTx.wait();

      const mintAmount = 1000;

      await testToken
        .connect(minter)
        .mint(trustedForwarder.address, mintAmount);

      const cf = await ethers.getContractFactory("BaseToken");
      const functionData = cf.interface.encodeFunctionData("burn", [
        mintAmount,
      ]);

      const functionDataWithAddress = ethers.utils.solidityPack(
        ["bytes", "address"],
        [functionData, burner.address]
      );

      await expect(
        trustedForwarder.sendTransaction({
          to: testToken.address,
          data: functionDataWithAddress,
        })
      ).to.be.revertedWith("EIP2771Recipient: meta transaction is not allowed");

      const balance = await testToken.balanceOf(trustedForwarder.address);
      expect(balance).to.equal(mintAmount);
    });

    it("Should not be able to set the truster forwarder from the trusted forwarder", async function () {
      const { testToken, forwarderSetter, trustedForwarder, minter } =
        await loadFixture(deployMeldTokenAndGrantRolesFixture);

      const setForwarderTx = await testToken
        .connect(forwarderSetter)
        .setTrustedForwarder(trustedForwarder.address);

      await setForwarderTx.wait();

      const cf = await ethers.getContractFactory("BaseToken");
      const functionData = cf.interface.encodeFunctionData(
        "setTrustedForwarder",
        [minter.address]
      );

      const functionDataWithAddress = ethers.utils.solidityPack(
        ["bytes", "address"],
        [functionData, forwarderSetter.address]
      );

      await expect(
        trustedForwarder.sendTransaction({
          to: testToken.address,
          data: functionDataWithAddress,
        })
      ).to.be.revertedWith("EIP2771Recipient: meta transaction is not allowed");

      const forwarder = await testToken.getTrustedForwarder();
      expect(forwarder).to.equal(trustedForwarder.address);
    });

    it("Should not be able to rescue ERC20 tokens from the trusted forwarder", async function () {
      const { testToken, forwarderSetter, trustedForwarder, owner } =
        await loadFixture(deployMeldTokenAndGrantRolesFixture);

      const setForwarderTx = await testToken
        .connect(forwarderSetter)
        .setTrustedForwarder(trustedForwarder.address);

      await setForwarderTx.wait();

      const fakeTokenAddress = ethers.constants.AddressZero;

      const cf = await ethers.getContractFactory("BaseToken");
      const functionData = cf.interface.encodeFunctionData("rescueERC20", [
        fakeTokenAddress,
        trustedForwarder.address,
      ]);

      const functionDataWithAddress = ethers.utils.solidityPack(
        ["bytes", "address"],
        [functionData, owner.address]
      );

      await expect(
        trustedForwarder.sendTransaction({
          to: testToken.address,
          data: functionDataWithAddress,
        })
      ).to.be.revertedWith("EIP2771Recipient: meta transaction is not allowed");
    });

    it("Should not be able to rescue ERC721 tokens from the trusted forwarder", async function () {
      const { testToken, forwarderSetter, trustedForwarder, owner } =
        await loadFixture(deployMeldTokenAndGrantRolesFixture);

      const setForwarderTx = await testToken
        .connect(forwarderSetter)
        .setTrustedForwarder(trustedForwarder.address);

      await setForwarderTx.wait();

      const fakeTokenAddress = ethers.constants.AddressZero;
      const fakeTokenId = 1;

      const cf = await ethers.getContractFactory("BaseToken");
      const functionData = cf.interface.encodeFunctionData("rescueERC721", [
        fakeTokenAddress,
        trustedForwarder.address,
        fakeTokenId,
      ]);

      const functionDataWithAddress = ethers.utils.solidityPack(
        ["bytes", "address"],
        [functionData, owner.address]
      );

      await expect(
        trustedForwarder.sendTransaction({
          to: testToken.address,
          data: functionDataWithAddress,
        })
      ).to.be.revertedWith("EIP2771Recipient: meta transaction is not allowed");
    });

    it("Should not be able to rescue ERC1155 tokens from the trusted forwarder", async function () {
      const { testToken, forwarderSetter, trustedForwarder, owner } =
        await loadFixture(deployMeldTokenAndGrantRolesFixture);

      const setForwarderTx = await testToken
        .connect(forwarderSetter)
        .setTrustedForwarder(trustedForwarder.address);

      await setForwarderTx.wait();

      const fakeTokenAddress = ethers.constants.AddressZero;
      const fakeTokenId = 1;

      const cf = await ethers.getContractFactory("BaseToken");
      const functionData = cf.interface.encodeFunctionData("rescueERC1155", [
        fakeTokenAddress,
        trustedForwarder.address,
        fakeTokenId,
      ]);

      const functionDataWithAddress = ethers.utils.solidityPack(
        ["bytes", "address"],
        [functionData, owner.address]
      );

      await expect(
        trustedForwarder.sendTransaction({
          to: testToken.address,
          data: functionDataWithAddress,
        })
      ).to.be.revertedWith("EIP2771Recipient: meta transaction is not allowed");
    });

    it("Should not be able to grant roles from the trusted forwarder", async function () {
      const { testToken, forwarderSetter, trustedForwarder, owner } =
        await loadFixture(deployMeldTokenAndGrantRolesFixture);

      const setForwarderTx = await testToken
        .connect(forwarderSetter)
        .setTrustedForwarder(trustedForwarder.address);

      await setForwarderTx.wait();

      const MINTER_ROLE = await testToken.MINTER_ROLE();

      const cf = await ethers.getContractFactory("BaseToken");
      const functionData = cf.interface.encodeFunctionData("grantRole", [
        MINTER_ROLE,
        trustedForwarder.address,
      ]);

      const functionDataWithAddress = ethers.utils.solidityPack(
        ["bytes", "address"],
        [functionData, owner.address]
      );

      await expect(
        trustedForwarder.sendTransaction({
          to: testToken.address,
          data: functionDataWithAddress,
        })
      ).to.be.revertedWith("EIP2771Recipient: meta transaction is not allowed");
    });

    it("Should not be able to revoke roles from the trusted forwarder", async function () {
      const { testToken, forwarderSetter, trustedForwarder, minter, owner } =
        await loadFixture(deployMeldTokenAndGrantRolesFixture);

      const setForwarderTx = await testToken
        .connect(forwarderSetter)
        .setTrustedForwarder(trustedForwarder.address);

      await setForwarderTx.wait();

      const MINTER_ROLE = await testToken.MINTER_ROLE();

      const cf = await ethers.getContractFactory("BaseToken");
      const functionData = cf.interface.encodeFunctionData("revokeRole", [
        MINTER_ROLE,
        minter.address,
      ]);

      const functionDataWithAddress = ethers.utils.solidityPack(
        ["bytes", "address"],
        [functionData, owner.address]
      );

      await expect(
        trustedForwarder.sendTransaction({
          to: testToken.address,
          data: functionDataWithAddress,
        })
      ).to.be.revertedWith("EIP2771Recipient: meta transaction is not allowed");
    });

    it("Should not be able to renounce roles from the trusted forwarder", async function () {
      const { testToken, forwarderSetter, trustedForwarder, minter, owner } =
        await loadFixture(deployMeldTokenAndGrantRolesFixture);

      const setForwarderTx = await testToken
        .connect(forwarderSetter)
        .setTrustedForwarder(trustedForwarder.address);

      await setForwarderTx.wait();

      const MINTER_ROLE = await testToken.MINTER_ROLE();

      const cf = await ethers.getContractFactory("BaseToken");
      const functionData = cf.interface.encodeFunctionData("renounceRole", [
        MINTER_ROLE,
        minter.address,
      ]);

      const functionDataWithAddress = ethers.utils.solidityPack(
        ["bytes", "address"],
        [functionData, minter.address]
      );

      await expect(
        trustedForwarder.sendTransaction({
          to: testToken.address,
          data: functionDataWithAddress,
        })
      ).to.be.revertedWith("EIP2771Recipient: meta transaction is not allowed");
    });
  });
});
