const { Wallet } = require("ethers")
const fs = require('fs')
require('dotenv').config();

async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log(`
    Usage:
      Create Env:    node index.js <my_project>
    
    Examples:
      node index.js my_project
        `);
        return;
    }
    if (fs.existsSync(args[0])) {
        console.log("FOLDER_OVER_WRITE DEPLOY");
        return;
    }
    fs.mkdirSync(args[0]);
    // DEPLOY
    const s_pubKeyFile = `./${args[0]}/pubkey`
    const s_envFile = `./${args[0]}/.env`
    const s_envJSONFile = `./${args[0]}/.env.json`
    // TODO
    const account = Wallet.createRandom()
    if (fs.existsSync(s_pubKeyFile) || fs.existsSync(s_envFile)) {
        console.log("FILE_OVER_WRITE DEPLOY")
        return
    }
    fs.writeFileSync(s_pubKeyFile, account.address);
    fs.writeFileSync(s_envFile, `PRIVATE_KEY='${account._signingKey().privateKey}'`);
    const jsonFile = {
        PRIVATE_KEY: account._signingKey().privateKey,
        PUBLIC_KEY: account.address
    }
    fs.writeFileSync(s_envJSONFile, JSON.stringify(jsonFile, null, 2));

    console.log("OK")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });