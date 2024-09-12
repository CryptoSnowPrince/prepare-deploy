const { english, generateMnemonic, mnemonicToAccount } = require('viem/accounts')
const fs = require('fs')
const wallet = require('ethereumjs-wallet')

let password = '' // set password or input password when running the script
if (!password) {
    password = process.argv[2]
}

const mnemonic_pwd = ''
const mnemonic = generateMnemonic(english)
const account = mnemonicToAccount(mnemonic)
const address = account.address
const hexPk = account.getHdKey().privKey.toString(16)
const pk = new Buffer.from(hexPk, 'hex')

// console.log('wd: ', password)
// console.log('mnemonic_pwd: ', mnemonic_pwd)
// console.log('mnemonic: ', mnemonic)
// console.log('address: ', address)
// console.log('hexPk: ', hexPk)
// console.log('pk: ', pk)

const ethAccount = wallet.default.fromPrivateKey(pk)

ethAccount.toV3(password)
    .then(value => {
        const fileName = address.slice(0, 7) + "..." + address.slice(37);
        const file = `./seed/${fileName}.json`;
        const fileM = `./seed/${fileName}_m.json`;
        fs.writeFileSync(`seed/.env`, `MNEMONIC='${mnemonic}'\nPRIVATE_KEY='${hexPk}'\nMNEMONIC_PASSWORD='${mnemonic_pwd}'`);
        fs.writeFileSync(file, JSON.stringify(value));
        fs.writeFileSync(fileM, mnemonic.toString());
        fs.writeFileSync(`seed/${fileName}`, `${address}\n${password}`);
    });