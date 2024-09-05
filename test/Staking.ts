/// <reference types="ethers" />
import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { Ajidokwu20 } from "../typechain-types";
import { Staking } from "../typechain-types";
describe("Staking Contract", function () {
  let staking: Staking;
  let ajidokwu: Ajidokwu20;
  const contractDeposit = 1000000000000000;
  beforeEach(async () => {
    const initialOwner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const Ajidokwu20 = await ethers.getContractFactory("Ajidokwu20");
    ajidokwu = await Ajidokwu20.deploy(initialOwner);
    const SaveERC20ANDEther = await ethers.getContractFactory("Staking");
    staking = await SaveERC20ANDEther.deploy(ajidokwu.target);
    const CurrentTime = await time.latest();
  });

  // const AjidokwuSigner1 = ajidokwu.connect(owner);
  // const AjidokwuSigner2 = ajidokwu.connect(addr1);
  // const AjidokwuSigner3 = ajidokwu.connect(addr2);
  // const Stakingsigner1 = staking.connect(owner);
  // const Stakingsigner2 = staking.connect(addr1);
  // const Stakingsigner3 = staking.connect(addr2);
  describe("Balance of contract to improved after deployment", () => {
    it("should Transfer Rewards tokens to contract", async () => {
      const [owner] = await ethers.getSigners();
      await ajidokwu.connect(owner).transfer(staking.target, contractDeposit);
      const contractBal = await ajidokwu
        .connect(owner)
        .balanceOf(staking.target);
      expect(contractBal).to.equal(contractDeposit);
    });
  });

  describe("Stake", () => {
    it("Should Stake properly", async () => {
      const stakeAmount = 1000;
      const stakedTime = 20;
      const [owner] = await ethers.getSigners();
      await ajidokwu.connect(owner).transfer(staking.target, contractDeposit);
      await ajidokwu.connect(owner).approve(staking.target, stakeAmount);
      await staking.connect(owner).stake(stakeAmount, stakedTime);
      expect(await staking.connect(owner).totalStakedBalance()).to.equal(
        stakeAmount
      );
    });
  });

  describe("Unstake", () => {
    it("should unstake properly", async () => {
      const stakeAmount = 1000;

      const [owner] = await ethers.getSigners();

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
    it("should unstake during emergencyproperly", async () => {
      const stakeAmount = 1000;
      const stakedTime = await time.latest();
      const [owner] = await ethers.getSigners();
      await ajidokwu.connect(owner).transfer(staking.target, contractDeposit);
      await ajidokwu.connect(owner).approve(staking.target, stakeAmount);
      await staking.connect(owner).stake(stakeAmount, stakedTime);

      await staking.connect(owner).emergencyWithdraw();
      expect(
        await staking.connect(owner).checkUserStakedBalance(owner.address)
      ).to.equal(0);
    });
  });
});
