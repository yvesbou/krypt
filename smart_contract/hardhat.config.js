const { solidity } = require('ethereum-waffle')

require('@nomiclabs/hardhat-waffle')

// why did we use alchemy here when our dapp only connected to the ropsten network via metamask (which uses infura)
// possibly to deploy our smart contract
module.exports = {
  solidity: '0.8.0',
  networks: {
    ropsten: {
      url: 'https://eth-ropsten.alchemyapi.io/v2/XodNL6-SylrElEfH1XmZ-VA_fjv7ckcc',
      accounts: [ 'ddfd7a35e8415ac1c7c62a038b8fc23fbfd17f7bb2bf23d63e4f5bd04ee4e419' ]
    }
  }
}