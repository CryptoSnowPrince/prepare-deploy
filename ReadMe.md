# Prepare Deploy

## Solana

```
solana-keygen new --outfile ./path/id.json 1> ./path/log
solana address --keypair ./path/id.json
```

```
solana balance account_address --url https://rpc.com
solana transfer --keypair id.json --url https://rpc.com recipient_address amount
solana transfer --keypair id.json --url https://rpc.com recipient_address amount --allow-unfunded-recipient
```

```
spl-token balance token_address --owner account_address --url https://rpc.com
spl-token transfer token_address amount recipient_address --owner id.json --url https://rpc.com
spl-token transfer token_address amount recipient_address --owner id.json --url https://rpc.com --allow-unfunded-recipient
spl-token transfer token_address amount recipient_address --owner id.json --url https://rpc.com --allow-unfunded-recipient --fund-recipient
```
