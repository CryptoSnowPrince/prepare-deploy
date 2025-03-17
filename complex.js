const { Wallet } = require("ethers");
const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58').default;
const fs = require('fs');
require('dotenv').config();

const MNEMONIC = "";
const RPC_URL_SOLANA = "https://fragrant-light-pond.solana-mainnet.quiknode.pro/438957c004e2020528384e5a4406e4d4c3d80a9b/";
const RPC_URL_SOLANA_TESTNET = "https://fittest-bitter-seed.solana-devnet.quiknode.pro/d35ac6c14b331ec92da398ebffd274e6f929ffca/";

async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log(`
Usage:
    Create Env:    node complex.js <my_project>

Examples:
    node complex.js my_project
        `);
        return;
    }

    const keypairFile = `./solana/${args[0]}/id.json`;
    if (!fs.existsSync(keypairFile)) {
        console.log(`Keypair file not found: ${keypairFile}`);
        return;
    }

    const data = fs.readFileSync(keypairFile, 'utf8');
    const keypairJson = JSON.parse(data);
    const keypair = Keypair.fromSecretKey(Uint8Array.from(keypairJson));
    const base58EncodedPrivateKey = bs58.encode(keypair.secretKey);
    const SOLANA_PRIVATE_KEY = base58EncodedPrivateKey;

    if (fs.existsSync(`./complex/${args[0]}`)) {
        console.log("FOLDER_OVER_WRITE");
        return;
    }
    fs.mkdirSync(`./complex/${args[0]}`);
    // DEPLOY
    const s_pubKeyFile = `./complex/${args[0]}/pubkey`;
    const s_envFile = `./complex/${args[0]}/.env`;

    // TODO
    const account = Wallet.createRandom()
    if (fs.existsSync(s_pubKeyFile) || fs.existsSync(s_envFile)) {
        console.log("FILE_OVER_WRITE")
        return
    }
    fs.writeFileSync(s_pubKeyFile, `EVM_PUBKEY="${account.address}"\nSOLANA_PUBKEY="${keypair.publicKey.toBase58()}"`);

    let envStr = `MNEMONIC="${MNEMONIC}"\n`;
    envStr += `PRIVATE_KEY="${account._signingKey().privateKey}"\n`;
    envStr += `SOLANA_PRIVATE_KEY="${SOLANA_PRIVATE_KEY}"\n`;
    envStr += `RPC_URL_SOLANA="${RPC_URL_SOLANA}"\n`;
    envStr += `RPC_URL_SOLANA_TESTNET="${RPC_URL_SOLANA_TESTNET}"\n`;

    fs.writeFileSync(s_envFile, envStr);

    console.log("OK")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });