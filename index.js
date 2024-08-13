import { ethers } from "ethers";
import UNISWAP_ROUTER_ABI from "./abis/swaprouter.json" assert { type: "json" };
import AAVE_POOL_ABI from "./abis/aavePool.json" assert { type: "json" };
import ERC20_ABI from "./abis/token.json" assert { type: "json" };
import dotenv from "dotenv";

dotenv.config();

const WETH_ADDRESS = "0x7a9b463580B098A9a2984B70CEA7949A1ccC366d";
const USDC_ADDRESS = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8";
const UNISWAP_ROUTER_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const AAVE_POOL_ADDRESS = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951";

async function setupProvider() {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  return { provider, signer };
}

async function setupContracts(signer) {
  const uniswapRouter = new ethers.Contract(
    UNISWAP_ROUTER_ADDRESS,
    UNISWAP_ROUTER_ABI,
    signer
  );
  const aaveLendingPool = new ethers.Contract(
    AAVE_POOL_ADDRESS,
    AAVE_POOL_ABI,
    signer
  );
  const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
  return { uniswapRouter, aaveLendingPool, usdcContract };
}

async function swapEthForUsdc(uniswapRouter, signer, ethAmount) {
  console.log("Swapping ETH for USDC...");
  const params = {
    tokenIn: WETH_ADDRESS,
    tokenOut: USDC_ADDRESS,
    fee: 3000,
    recipient: signer.address,
    deadline: Math.floor(Date.now() / 1000) + 60 * 20,
    amountIn: ethers.parseEther(ethAmount),
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
  };

  const transaction = await uniswapRouter.exactInputSingle.populateTransaction(
    params
  );
  const transactionResponse = await signer.sendTransaction(transaction);
  const receipt = await transactionResponse.wait();
  console.log(
    `Swap Successful: https://sepolia.etherscan.io/tx/${receipt.hash}`
  );

  const UsdcDeposit = ethers.parseUnits("1", 6);
  return UsdcDeposit;
}

async function approveUsdcTransfer(usdcContract, UsdcDeposit) {
  console.log("Approving USDC transfer to Aave...");
  const approveTx = await usdcContract.approve(AAVE_POOL_ADDRESS, UsdcDeposit);
  await approveTx.wait();
  console.log("Approval successful");
}

async function supplyCollateralToAave(aaveLendingPool, signer, UsdcDeposit) {
  console.log("Supplying USDC as collateral in Aave...");
  const depositTx = await aaveLendingPool.supply(
    USDC_ADDRESS,
    UsdcDeposit,
    signer.address,
    0,
    { gasLimit: 300000 }
  );
  const receipt = await depositTx.wait();
  console.log(
    `Supply Successful: https://sepolia.etherscan.io/tx/${receipt.hash}`
  );
}

async function borrowFromAave(aaveLendingPool, signer, UsdcDeposit) {
  const borrowAmount = UsdcDeposit / 2n;
  console.log(
    `Borrowing ${ethers.formatUnits(
      borrowAmount,
      6
    )} worth of USDC from Aave...`
  );
  const borrowTx = await aaveLendingPool.borrow(
    USDC_ADDRESS,
    borrowAmount,
    2,
    0,
    signer.address,
    { gasLimit: 300000 }
  );
  const receipt = await borrowTx.wait();
  console.log(
    `Borrow Successful: https://sepolia.etherscan.io/tx/${receipt.hash}`
  );
}

async function main(ethAmount) {
  try {
    const { signer } = await setupProvider();
    const { uniswapRouter, aaveLendingPool, usdcContract } =
      await setupContracts(signer);

    const UsdcDeposit = await swapEthForUsdc(uniswapRouter, signer, ethAmount);
    await approveUsdcTransfer(usdcContract, UsdcDeposit);
    await supplyCollateralToAave(aaveLendingPool, signer, UsdcDeposit);
    await borrowFromAave(aaveLendingPool, signer, UsdcDeposit);

    console.log("Aave trading setup complete!");
  } catch (error) {
    console.error("Error:", error);
  }
}

const ethAmount = "0.0004";
main(ethAmount);
