# MELD EVM TOKEN

This is the EVM implementation of the MELD token. It is an ERC20 token with the following features:

- Minting
- Burning
- Pausing
- Unpausing
- Meta transactions support

This repo contains a `BaseToken` contract with all the features listed above, and a `MeldToken` contract that inherits from `BaseToken` that adds the restriction of a hard cap on the supply of 4 billion tokens.

## Installation

Run `npm install` or `yarn install` to install the dependencies.

## Configuration

The network configuration is in the `hardhat.config.ts` file. You can add or modify networks there. There is a `.sample.env` file that you can use as a template to create a `.env` file with the private keys of the accounts you want to interact with the different networks. You can also configure a different RPC URL for each network, as well as set your own `ETHERSCAN_API_KEY`.

## Testing

Run `npm run test` or `yarn test` to run the tests.

## Deployment

This repo is prepared for its contracts to be deployed deterministically with a vanity address. To do so, please check the [VADD documentation](VADD.md). Please note that you don't actually need to calculate a salt if you don't care about the vanity address, so you can set any salt value when deploying.

## Tasks

Apart from the VADD tasks, this repo contains tasks to manage the roles of a deployed token. The existing roles are:

- DEFAULT_ADMIN_ROLE
- MINTER_ROLE
- BURNER_ROLE
- PAUSER_ROLE
- UNPAUSER_ROLE
- TRUSTED_FORWARDER_SETTER_ROLE

All these task need to specify the network. These are tasks that allow you to manage the roles of a deployed token:

### `grantRoles`

Grant all roles to a specific address.
It receives the following params:

- `contractaddress`: Address of the contract.
- `destinationaddress`: Address to grant the roles to.

To execute this task run:

```
yarn hardhat grantRoles --network <network> --contractaddress <contractaddress> --destinationaddress <destinationaddress>
```

This will output the ids of every transaction that grants a role.
Note: the signer must have the default admin role.

### `grantAdminRole`

Grant admin role to a specific address.
It receives the following params:

- `contractaddress`: Address of the contract.
- `destinationaddress`: Address to grant the admin role to.

To execute this task run:

```
yarn hardhat grantAdminRole --network <network> --contractaddress <contractaddress> --destinationaddress <destinationaddress>
```

This will output the id of the transaction that grants the admin role.
Note: the signer must have the default admin role.

### `checkRoles`

Check which roles an address has.
It receives the following params:

- `contractaddress`: Address of the contract.
- `destinationaddress`: Address to check the different roles.

To execute this task run:

```
yarn hardhat checkRoles --network <network> --contractaddress <contractaddress> --destinationaddress <destinationaddress>
```

This will output `true` or `false` for every role.

### `renounceAdminRole`

Renounce admin role. A backup admin address needs to be provided to ensure that the contract won't end up without an admin.
It receives the following params:

- `contractaddress`: Address of the contract.
- `backupaddress`: Address of another address with the admin role, to avoid leaving the contract without an admin.

To execute this task run:

```
yarn hardhat renounceAdminRole --network <network> --contractaddress <contractaddress> --backupaddress <backupaddress>
```

This will output the id of the transaction that renounces the role.
Note: the signer and the `backupaddress` must have the default admin role.
