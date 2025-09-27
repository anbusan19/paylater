const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying PayLater EMI System contracts...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // PYUSD token address on Sepolia testnet
  const PYUSD_ADDRESS = "0x6f14C02fC1F78322cFd7d707aB90f18baD3B54f5";

  // Deploy UserProfile contract
  console.log("\nDeploying UserProfile contract...");
  const UserProfile = await ethers.getContractFactory("UserProfile");
  const userProfile = await UserProfile.deploy();
  await userProfile.deployed();
  console.log("UserProfile deployed to:", userProfile.address);

  // Deploy LiquidityPool contract
  console.log("\nDeploying LiquidityPool contract...");
  const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
  const liquidityPool = await LiquidityPool.deploy(PYUSD_ADDRESS);
  await liquidityPool.deployed();
  console.log("LiquidityPool deployed to:", liquidityPool.address);

  // Deploy EMIManager contract
  console.log("\nDeploying EMIManager contract...");
  const EMIManager = await ethers.getContractFactory("EMIManager");
  const emiManager = await EMIManager.deploy(
    PYUSD_ADDRESS,
    userProfile.address,
    liquidityPool.address
  );
  await emiManager.deployed();
  console.log("EMIManager deployed to:", emiManager.address);

  // Authorize contracts to interact with each other
  console.log("\nSetting up contract permissions...");
  
  // Authorize EMIManager to interact with UserProfile
  await userProfile.authorizeContract(emiManager.address, true);
  console.log("EMIManager authorized in UserProfile");

  // Authorize EMIManager to interact with LiquidityPool
  await liquidityPool.authorizeEMIContract(emiManager.address, true);
  console.log("EMIManager authorized in LiquidityPool");

  // Authorize a test merchant (deployer for testing)
  await emiManager.authorizeMerchant(deployer.address, true);
  console.log("Test merchant authorized");

  console.log("\n=== Deployment Summary ===");
  console.log("PYUSD Token:", PYUSD_ADDRESS);
  console.log("UserProfile:", userProfile.address);
  console.log("LiquidityPool:", liquidityPool.address);
  console.log("EMIManager:", emiManager.address);

  console.log("\n=== Environment Variables ===");
  console.log("Add these to your .env file:");
  console.log(`REACT_APP_PYUSD_ADDRESS=${PYUSD_ADDRESS}`);
  console.log(`REACT_APP_USER_PROFILE_ADDRESS=${userProfile.address}`);
  console.log(`REACT_APP_LIQUIDITY_POOL_ADDRESS=${liquidityPool.address}`);
  console.log(`REACT_APP_EMI_MANAGER_ADDRESS=${emiManager.address}`);

  // Verify contracts on Etherscan (optional)
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("\nVerifying contracts on Etherscan...");
    
    try {
      await hre.run("verify:verify", {
        address: userProfile.address,
        constructorArguments: [],
      });
      console.log("UserProfile verified");
    } catch (error) {
      console.log("UserProfile verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: liquidityPool.address,
        constructorArguments: [PYUSD_ADDRESS],
      });
      console.log("LiquidityPool verified");
    } catch (error) {
      console.log("LiquidityPool verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: emiManager.address,
        constructorArguments: [PYUSD_ADDRESS, userProfile.address, liquidityPool.address],
      });
      console.log("EMIManager verified");
    } catch (error) {
      console.log("EMIManager verification failed:", error.message);
    }
  }

  console.log("\nDeployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });