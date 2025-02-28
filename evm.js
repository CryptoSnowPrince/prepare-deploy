const {
    createWalletClient,
    createPublicClient,
    http,
    parseEther,
    parseUnits,
    formatEther,
    formatUnits,
    defineChain
} = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const dotenv = require('dotenv');
const fs = require('fs')

// Load .env if available
dotenv.config();

// Load .env.json if .env is missing
let PRIVATE_KEY = process.env.PRIVATE_KEY;
const filePath = ''
if (!PRIVATE_KEY && fs.existsSync(`./${filePath}/.env.json`)) {
    try {
        const envJson = JSON.parse(fs.readFileSync(`./${filePath}/.env.json`, "utf8"));
        PRIVATE_KEY = envJson.PRIVATE_KEY;
    } catch (error) {
        console.error("❌ Error reading .env.json:", error);
        process.exit(1);
    }
}

if (!PRIVATE_KEY) {
    console.error("❌ Missing PRIVATE_KEY! Provide an .env or .env.json file.");
    process.exit(1);
}

// Create account from private key
const account = privateKeyToAccount(`0x${PRIVATE_KEY.replace(/^0x/, '')}`);

console.log(`Account: ${account?.address}`)

// Get CLI arguments
const args = process.argv.slice(2);

if (args.length === 0) {
    console.log(`
Usage:
  Check ETH Balance:    node evm.js <rpc_url> checkETH
  Check Token Balance:  node evm.js <rpc_url> checkToken <token_address> <decimals>
  Send ETH:            node evm.js <rpc_url> sendETH <recipient_address> <amount>
  Send Token:          node evm.js <rpc_url> sendToken <recipient_address> <amount> <token_address> <decimals>

Examples:
  node evm.js https://rpc.com checkETH
  node evm.js https://rpc.com checkToken 0xTokenContractAddress 18
  node evm.js https://rpc.com sendETH 0xRecipientAddress 0.01
  node evm.js https://rpc.com sendToken 0xRecipientAddress 10 0xTokenContractAddress 18
    `);
    process.exit(1);
}

// Extract arguments
const [RPC_URL, action, ...txArgs] = args;

// Initialize public client for read operations (balance, chain ID, etc.)
const publicClient = createPublicClient({
    transport: http(RPC_URL),
});

// Fetch the actual chain ID from the RPC
async function getChainDetails() {
    try {
        const chainId = await publicClient.getChainId();
        console.log(`🔍 Connected to Chain ID: ${chainId}`);
        return defineChain({
            id: chainId,
            name: `Chain ${chainId}`,
            network: `custom-${chainId}`,
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            rpcUrls: { default: { http: [RPC_URL] } },
        });
    } catch (error) {
        console.error("❌ Failed to fetch chain ID from RPC:", error);
        process.exit(1);
    }
}

// Main function to execute actions
async function main() {
    const customChain = await getChainDetails();

    // Initialize wallet client for sending transactions
    const walletClient = createWalletClient({
        chain: customChain,
        transport: http(RPC_URL),
    });

    // Function to check ETH balance
    async function checkETHBalance() {
        try {
            const balance = await publicClient.getBalance({ address: account.address });
            console.log(`🔍 ETH Balance: ${formatEther(balance)} ETH`);
        } catch (error) {
            console.error("❌ Error fetching ETH balance:", error);
        }
    }

    // Function to check ERC-20 Token balance
    async function checkTokenBalance(tokenAddress, decimals) {
        try {
            const balance = await publicClient.readContract({
                address: tokenAddress,
                abi: [
                    {
                        "constant": true,
                        "inputs": [{ "name": "_owner", "type": "address" }],
                        "name": "balanceOf",
                        "outputs": [{ "name": "balance", "type": "uint256" }],
                        "type": "function"
                    }
                ],
                functionName: "balanceOf",
                args: [account.address],
            });

            console.log(`🔍 Token Balance: ${formatUnits(balance, decimals)} Tokens`);
        } catch (error) {
            console.error("❌ Error fetching Token balance:", error);
        }
    }

    // Function to send ETH (with balance check)
    async function sendETH(to, amount) {
        try {
            const ethBalance = await publicClient.getBalance({ address: account.address });
            const amountToSend = parseEther(amount);

            if (ethBalance < amountToSend) {
                console.error("❌ Insufficient ETH balance!");
                return;
            }

            const hash = await walletClient.sendTransaction({
                account,
                to,
                value: amountToSend,
            });

            console.log(`✅ ETH sent! Transaction Hash: ${hash}`);
        } catch (error) {
            console.error("❌ ETH transfer failed:", error);
        }
    }

    // Function to send ERC-20 Token (with balance check)
    async function sendToken(to, amount, tokenAddress, decimals) {
        try {
            const tokenBalance = await publicClient.readContract({
                address: tokenAddress,
                abi: [
                    {
                        "constant": true,
                        "inputs": [{ "name": "_owner", "type": "address" }],
                        "name": "balanceOf",
                        "outputs": [{ "name": "balance", "type": "uint256" }],
                        "type": "function"
                    }
                ],
                functionName: "balanceOf",
                args: [account.address],
            });

            const amountToSend = parseUnits(amount, decimals);

            if (tokenBalance < amountToSend) {
                console.error("❌ Insufficient Token balance!");
                return;
            }

            const hash = await walletClient.writeContract({
                address: tokenAddress,
                abi: [
                    {
                        "constant": false,
                        "inputs": [
                            { "name": "_to", "type": "address" },
                            { "name": "_value", "type": "uint256" }
                        ],
                        "name": "transfer",
                        "outputs": [{ "name": "", "type": "bool" }],
                        "type": "function"
                    }
                ],
                functionName: "transfer",
                args: [to, amountToSend],
                account
            });

            console.log(`✅ Token sent! Transaction Hash: ${hash}`);
        } catch (error) {
            console.error("❌ Token transfer failed:", error);
        }
    }

    // Validate and execute transaction
    if (action === "checkETH") {
        checkETHBalance();
    } else if (action === "checkToken" && txArgs.length === 2) {
        const [tokenAddress, decimals] = txArgs;
        checkTokenBalance(tokenAddress, parseInt(decimals, 10));
    } else if (action === "sendETH" && txArgs.length === 2) {
        const [recipient, amount] = txArgs;
        sendETH(recipient, amount);
    } else if (action === "sendToken" && txArgs.length === 4) {
        const [recipient, amount, tokenAddress, decimals] = txArgs;
        sendToken(recipient, amount, tokenAddress, parseInt(decimals, 10));
    } else {
        console.error("❌ Invalid arguments! Use `node send.js` for help.");
    }
}

main();
