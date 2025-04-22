const bip39 = require('bip39');
const HDKey = require('hdkey');
const Wallet = require('ethereumjs-wallet').default;
const fs = require('fs');

let passphrase = ''; // TODO: set or input a mnemonic passphrase (optional for extra security)
const derivationPath = `m/44'/60'/0'/0/0`; // TODO: set derivation path
let pwdByCmd = false; // TODO: set to true if you want to use the password from command line

const args = process.argv.slice(2);
if (args.length < 2) {
    console.log(`
Usage:
  create mnemonic:    node mnemonic.js <MY_PASSWORD> <MY_PROJECT>

Examples:
  node mnemonic.js my_password my_project
    `);
    process.exit(1)
}

if (!pwdByCmd) {
    passphrase = args[0]
}

const folderPath = `./mnemonic/${args[1]}`;
if (fs.existsSync(folderPath)) {
    console.log("FOLDER_OVER_WRITE");
    process.exit(1)
}
fs.mkdirSync(folderPath);

const mnemonic = bip39.generateMnemonic(); // Default 12-word mnemonic

const seed = bip39.mnemonicToSeedSync(mnemonic, passphrase);
const hdwallet = HDKey.fromMasterSeed(seed);
const childKey = hdwallet.derive(derivationPath);
const wallet = Wallet.fromPrivateKey(childKey.privateKey);
const address = `0x${wallet.getAddress().toString('hex')}`;
const privateKey = wallet.getPrivateKey().toString('hex');

let envStr = `MNEMONIC="${mnemonic}"\nMNEMONIC_PASSWORD="${passphrase}"`
envStr += `\nDERIVATION_PATH="${derivationPath}"`;
envStr += `\nPRIVATE_KEY="${privateKey}"\nPUBLIC_KEY="${address}"`;
fs.writeFileSync(`${folderPath}/.env`, envStr);
const jsonFile = {
    MNEMONIC: mnemonic,
    MNEMONIC_PASSWORD: passphrase,
    DERIVATION_PATH: derivationPath,
    PRIVATE_KEY: privateKey,
    PUBLIC_KEY: address
};
fs.writeFileSync(`${folderPath}/.env.json`, JSON.stringify(jsonFile, null, 2));
fs.writeFileSync(`${folderPath}/firstPubkey`, address);
console.log("OK");
