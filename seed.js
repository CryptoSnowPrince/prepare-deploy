const { english, generateMnemonic, mnemonicToAccount } = require('viem/accounts')
const fs = require('fs')
const wallet = require('ethereumjs-wallet')

let password = '' // TODO: set or input password
const args = process.argv.slice(2);
if (args.length < 2) {
    console.log(`
Usage:
  create seed:    node seed.js <MY_PASSWORD> <MY_PROJECT>

Examples:
  node seed.js my_password my_project
    `);
    process.exit(1)
}

if (!password) {
    password = args[0]
}

const folderPath = `./seed/${args[1]}`;
if (fs.existsSync(folderPath)) {
    console.log("FOLDER_OVER_WRITE");
    process.exit(1)
}
fs.mkdirSync(folderPath);

const mnemonic = generateMnemonic(english)
const account = mnemonicToAccount(mnemonic)
const address = account.address
const hexPk = account.getHdKey().privKey.toString(16)
const pk = new Buffer.from(hexPk, 'hex')

// console.log('wd: ', password)
// console.log('mnemonic: ', mnemonic)
// console.log('address: ', address)
// console.log('hexPk: ', hexPk)
// console.log('pk: ', pk)

const ethAccount = wallet.default.fromPrivateKey(pk)

ethAccount.toV3(password)
    .then(value => {
        const fileName = address.slice(0, 7) + "..." + address.slice(37);
        const filePath = `${folderPath}/${fileName}.json`;
        const fileMPath = `${folderPath}/${fileName}_m.json`;
        fs.writeFileSync(`${folderPath}/.env`, `MNEMONIC='${mnemonic}'\nPRIVATE_KEY='${hexPk}'\nMNEMONIC_PASSWORD=''`);
        fs.writeFileSync(filePath, JSON.stringify(value));
        fs.writeFileSync(fileMPath, mnemonic.toString());
        fs.writeFileSync(`${folderPath}/${fileName}`, `${address}\n${password}`);
        console.log(`OK`);
    })
    .catch(error => {
        console.log("❌ Error creating wallet:", error);
        process.exit(1);
    });