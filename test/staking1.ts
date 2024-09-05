const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
import { ethers } from "hardhat";
import { Ajidokwu20 } from "../typechain-types";
import { Staking } from "../typechain-types";

describe("Staking", function () {
  let staking: Staking;
  let ajidokwu: Ajidokwu20;
  async function deployStakingFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();
    const initialOwner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const Ajidokwu20 = await ethers.getContractFactory("Ajidokwu20");
    ajidokwu = await Ajidokwu20.deploy(initialOwner);
    const SaveERC20ANDEther = await ethers.getContractFactory("Staking");
    staking = await SaveERC20ANDEther.deploy(ajidokwu.target);
    const contractDeposit = 1000000000000000;
    const ZeroAddress = "0x0000000000000000000000000000000000000000";
    const CurrentTime = await time.latest();
    const AjidokwuSigner1 = ajidokwu.connect(owner);
    const AjidokwuSigner2 = ajidokwu.connect(otherAccount);
    const Stakingsigner1 = staking.connect(owner);
    const Stakingsigner2 = staking.connect(otherAccount);
    const stakeAmount = 1000;

    return {
      ajidokwu,
      staking,
      owner,
      otherAccount,
      AjidokwuSigner1,
      AjidokwuSigner2,
      Stakingsigner1,
      Stakingsigner2,
      CurrentTime,
      contractDeposit,
      stakeAmount,
      ZeroAddress,
    };
  }

  describe("Deployment", function () {
    it("Balance of contract to improved after deployment", async function () {
      const { ajidokwu, owner, contractDeposit } = await loadFixture(
        deployStakingFixture
      );
      await ajidokwu.connect(owner).transfer(staking.target, contractDeposit);
      const contractBal = await ajidokwu
        .connect(owner)
        .balanceOf(staking.target);
      expect(contractBal).to.equal(contractDeposit);
    });
  });

  describe("Stake", () => {
    it("should revert if address zero tries to stake", async function () {
      const stakeAmount = 1000;
      // Connect to the contract using the signer
      const { owner, staketaking, ZeroAddress } = await loadFixture(
        deployStakingFixture
      );

      await expect(staking.connect(ZeroAddress).stake(stakeAmount, 20)).to.be
        .rejected;
      expect(owner.address).to.not.equal(ZeroAddress);
    });

    it("should revert if recently received reward", async function () {
      const { ajidokwu, owner, staking, contractDeposit } = await loadFixture(
        deployStakingFixture
      );
      const stakeAmount = 1000;

      await ajidokwu.connect(owner).transfer(staking.target, contractDeposit);
      await ajidokwu.connect(owner).approve(staking.target, stakeAmount);
      await staking.connect(owner).stake(stakeAmount, 20);
      expect(
        await staking.connect(owner).checkUserStakedBalance(owner.address)
      ).to.equal(stakeAmount);
      const stakedTime = await staking
        .connect(owner)
        .returnStakeDuration(owner.address);
      await time.increaseTo(stakedTime);

      // @ts-ignore

      await expect(staking.connect(owner).unstake()).not.to.be.reverted;
      expect(
        await staking.connect(owner).checkUserStakedBalance(owner.address)
      ).to.equal(0);
      await ajidokwu.connect(owner).transfer(staking.target, contractDeposit);
      await ajidokwu.connect(owner).approve(staking.target, stakeAmount);
      await expect(staking.connect(owner).stake(stakeAmount, 20)).to.be
        .rejected;
    });

    it("should revert if users tries to stake 0", async () => {
      const { ajidokwu, owner, staking, contractDeposit } = await loadFixture(
        deployStakingFixture
      );
      const stakeAmount = 0;
      const stakedTime = 20;
      await ajidokwu.connect(owner).transfer(staking.target, contractDeposit);
      await ajidokwu.connect(owner).approve(staking.target, stakeAmount);
      await expect(staking.connect(owner).stake(stakeAmount, stakedTime)).to.be
        .rejected;
    });

    it("should revert if user does not have enough tokens", async () => {
      const { ajidokwu, owner, staking, otherAccount, contractDeposit } =
        await loadFixture(deployStakingFixture);
      const stakeAmount = 1000;
      const stakedTime = 20;
      await ajidokwu.connect(owner).transfer(staking.target, contractDeposit);
      await ajidokwu.connect(otherAccount).approve(staking.target, stakeAmount);
      await expect(staking.connect(otherAccount).stake(stakeAmount, stakedTime))
        .to.be.rejected;
    });

    it("should revert if unstake time is not in the future", async () => {
      const { ajidokwu, owner, staking, contractDeposit } = await loadFixture(
        deployStakingFixture
      );
      const stakeAmount = 1000;
      const stakedTime = 0;
      await ajidokwu.connect(owner).transfer(staking.target, contractDeposit);
      await ajidokwu.connect(owner).approve(staking.target, stakeAmount);
      await expect(staking.connect(owner).stake(stakeAmount, stakedTime)).to.be
        .rejected;
    });

    it("Should Stake properly", async () => {
      const { ajidokwu, owner, staking, contractDeposit } = await loadFixture(
        deployStakingFixture
      );
      const stakeAmount = 1000;
      const stakedTime = 20;
      await ajidokwu.connect(owner).transfer(staking.target, contractDeposit);
      await ajidokwu.connect(owner).approve(staking.target, stakeAmount);
      await staking.connect(owner).stake(stakeAmount, stakedTime);
      expect(await staking.connect(owner).totalStakedBalance()).to.equal(
        stakeAmount
      );
    });
  });

  describe("Unstake", () => {
    it("should revert if address zero tries to Unstake", async function () {
      // Connect to the contract using the signer
      const { owner, staketaking, ZeroAddress } = await loadFixture(
        deployStakingFixture
      );

      await expect(staking.connect(ZeroAddress).unstake()).to.be.rejected;
      expect(owner.address).to.not.equal(ZeroAddress);
    });

    it("Should revert if called before unstakedtime ", async () => {
      const { ajidokwu, owner, staking, contractDeposit } = await loadFixture(
        deployStakingFixture
      );
      const stakeAmount = 1000;

      await ajidokwu.connect(owner).transfer(staking.target, contractDeposit);
      await ajidokwu.connect(owner).approve(staking.target, stakeAmount);
      await staking.connect(owner).stake(stakeAmount, 20);

      const stakedTime = await staking
        .connect(owner)
        .returnStakeDuration(owner.address);
      const trialBefore = (await time.latest()) + 10;

      await time.increaseTo(trialBefore);

      // @ts-ignore

      await expect(staking.connect(owner).unstake()).to.be.reverted;
    });

    it("Should revert if user did not stake", async () => {
      const { owner, staking } = await loadFixture(deployStakingFixture);
      await expect(staking.connect(owner).unstake()).to.be.rejected;
    });

    it("Should Unstake properly", async () => {
      const { ajidokwu, owner, staking, contractDeposit } = await loadFixture(
        deployStakingFixture
      );
      const stakeAmount = 2500;
      await ajidokwu.connect(owner).transfer(staking.target, contractDeposit);

      await ajidokwu.connect(owner).approve(staking.target, stakeAmount);
      await staking.connect(owner).stake(stakeAmount, 20);

      expect(
        await staking.connect(owner).checkUserStakedBalance(owner.address)
      ).to.equal(stakeAmount);
      const stakedTime = await staking
        .connect(owner)
        .returnStakeDuration(owner.address);
      await time.increaseTo(stakedTime);

      // @ts-ignore

      await expect(staking.connect(owner).unstake()).not.to.be.reverted;
      expect(
        await staking.connect(owner).checkUserStakedBalance(owner.address)
      ).to.equal(0);
    });
  });

  describe("Emergency Withdraw", () => {
    it("should revert if address zero tries to Unstake", async function () {
      // Connect to the contract using the signer
      const { owner, staketaking, ZeroAddress } = await loadFixture(
        deployStakingFixture
      );

      await expect(staking.connect(ZeroAddress).emergencyWithdraw()).to.be
        .rejected;
      expect(owner.address).to.not.equal(ZeroAddress);
    });
    it("Should revert if user did not stake", async () => {
      const { owner, staking } = await loadFixture(deployStakingFixture);
      await expect(staking.connect(owner).emergencyWithdraw()).to.be.rejected;
    });

    it("Should Unstake during Emergency properly", async () => {
      const { ajidokwu, owner, staking, stakeAmount, contractDeposit } =
        await loadFixture(deployStakingFixture);

      const stakedTime = await time.latest();
      await ajidokwu.connect(owner).transfer(staking.target, contractDeposit);
      await ajidokwu.connect(owner).approve(staking.target, stakeAmount);
      await staking.connect(owner).stake(stakeAmount, stakedTime);

      await staking.connect(owner).emergencyWithdraw();
      expect(
        await staking.connect(owner).checkUserStakedBalance(owner.address)
      ).to.equal(0);
    });
  });
  describe("returns staked Balance", () => {
    it("should return staker stake balance", async () => {
      const { ajidokwu, owner, staking, contractDeposit } = await loadFixture(
        deployStakingFixture
      );
      const stakeAmount = 1000;
      const stakedTime = 20;
      await ajidokwu.connect(owner).transfer(staking.target, contractDeposit);
      await ajidokwu.connect(owner).approve(staking.target, stakeAmount);
      await staking.connect(owner).stake(stakeAmount, stakedTime);
      const stakedBal = await staking.connect(owner).totalStakedBalance();
      expect(
        await staking.connect(owner).checkUserStakedBalance(owner.address)
      ).to.equal(stakedBal);
    });
  });
});
