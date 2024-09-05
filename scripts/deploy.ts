import { ethers } from "hardhat";
// const { ethers } = require("hardhat");

async function main() {
  const initialOwner = "0x09c5096AD92A3eb3b83165a4d177a53D3D754197";
  const sCoreContract = await ethers.deployContract("Score", [initialOwner]);

  await sCoreContract.waitForDeployment();

  const stakingContract = await ethers.deployContract("StakingContract", [
    sCoreContract.target,
  ]);

  await stakingContract.waitForDeployment();

  console.log(
    ` Token was deployed to ${sCoreContract.target}

    Staking contract was deployed to ${stakingContract.target}
    `
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
