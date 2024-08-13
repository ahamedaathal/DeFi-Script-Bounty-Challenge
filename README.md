# DeFi Leverage Trading Script

## Overview of Script

This script demonstrates a sophisticated DeFi operation that combines Uniswap and Aave protocols to perform a leverage trading setup. The script executes the following steps:

1. Swaps ETH for USDC using Uniswap
2. Supplies the acquired USDC as collateral to Aave
3. Borrows additional USDC from Aave using the supplied collateral

This process allows for a basic leverage trading setup, where the user can potentially amplify their position using borrowed funds.

This script demonstrates advanced DeFi concepts, including:

- Token swapping using decentralized exchanges (Uniswap)
- Supplying collateral and borrowing in lending protocols (Aave)
- Leveraging positions by borrowing against supplied collateral
- Interacting with multiple DeFi protocols in a single flow

## Diagram Illustration

![diagram-aave-borrow](https://github.com/user-attachments/assets/9a919402-d27c-4412-8bbe-4a9b8055205c)

## Code Explanation

### Key Functions:

1. `setupProvider()`

   - Initializes the Ethereum provider using the RPC URL from environment variables.
   - Creates a signer object using the private key, essential for transaction signing.

2. `setupContracts(signer)`

   - Initializes contract instances for Uniswap Router, Aave Lending Pool, and USDC token.
   - Uses predefined contract addresses and ABIs to create these instances.

3. `swapEthForUsdc(uniswapRouter, signer, ethAmount)`

   - Executes a token swap on Uniswap, converting ETH to USDC.
   - Calculates the minimum amount of USDC to receive based on current market rates.
   - Constructs and sends the swap transaction.

4. `approveUsdcTransfer(usdcContract, amount)`

   - Approves the Aave contract to spend USDC on behalf of the user.
   - This step is crucial before interacting with Aave protocol.

5. `supplyCollateralToAave(aaveLendingPool, signer, amount)`

   - Supplies the acquired USDC as collateral to the Aave lending pool.
   - This step enables borrowing capabilities on Aave.

6. `borrowFromAave(aaveLendingPool, signer, collateralAmount)`

   - Borrows 50% of the supplied USDC amount from Aave.
   - Demonstrates leveraging capabilities in DeFi.

7. `main(ethAmount)`
   - Orchestrates the entire process by calling the above functions in sequence.
   - Handles error logging and provides transaction status updates.

### Logic and Protocol Interactions:

1. **Uniswap Interaction:**

   - The script first interacts with Uniswap to swap ETH for USDC.
   - It uses the Uniswap Router contract to execute the swap.
   - The `swapExactETHForTokens` function is likely used, specifying ETH as input and USDC as output.

2. **Aave Interaction:**

   - After acquiring USDC, the script interacts with Aave in two steps:
     a. Supply: The USDC is supplied as collateral using the `deposit` function of the Aave Lending Pool.
     b. Borrow: A portion of USDC is then borrowed against this collateral using the `borrow` function.

3. **Transaction Handling:**

   - Each interaction (swap, approve, deposit, borrow) is a separate transaction.
   - Transactions are signed using the signer object created with the user's private key.
   - Gas limits and prices are likely set for each transaction to ensure proper execution.

4. **Error Handling:**

   - The script includes try-catch blocks to handle and log any errors during execution.
   - This is crucial for debugging and ensuring smooth operation in the volatile DeFi environment.

5. **Environment Variables:**

   - Sensitive data like private keys and RPC URLs are stored in environment variables.
   - This practice enhances security by keeping critical information out of the source code.

6. **Testnet Compatibility:**
   - The script is designed to run on the Sepolia testnet, using appropriate contract addresses for this network.

Key aspects of the code:

- The script uses environment variables for sensitive information like private keys and RPC URLs.
- It interacts with multiple DeFi protocols (Uniswap and Aave) in a single transaction flow.
- Error handling is implemented to catch and log any issues during execution.
- Gas limits are specified for Aave interactions to ensure transaction success.

This script demonstrates the power of DeFi composability by combining multiple protocols to create a more complex financial operation.

## How to Run

1. Clone this repository
2. Install dependencies with `npm install`
3. Create a `.env` file with your `PRIVATE_KEY` and `RPC_URL`
4. Run the script with `node index.js`

Note: This script is designed to run on the Sepolia testnet. Ensure you have sufficient testnet ETH before running.

## Disclaimer

This script is for educational purposes only. Always exercise caution when dealing with real assets in DeFi protocols. Leverage trading carries significant risks.
