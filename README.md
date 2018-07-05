<p align="center">
  <img width="40%" src="https://i.imgur.com/f5pJI1h.png">
</p>

<p align="center">
  <b><a href="https://coinapp.io">CoinApp.io</a> - A Simple Cryptocurrency Wallet</b><br>
  <a href="https://github.com/coinapp-io/desktop/releases">Windows</a> |
  <a href="https://github.com/coinapp-io/desktop/releases">Mac</a> |
  <a href="https://github.com/coinapp-io/desktop/releases">Linux</a>
  <br><br>
  <a href="https://travis-ci.org/coinapp-io/desktop"><img src="https://travis-ci.org/coinapp-io/desktop.svg?branch=master"></a>
</p>

# CoinApp - A Simple Cryptocurrency Wallet
A nifty crypto wallet application that lets you send and receive Ethereum, ERC20 Tokens, Bitcoin and Litecoin. CoinApp has a minimal UI for people who just want to move their coins, there's some advanced features for the knowledgable users too. <a href="https://github.com/hunterlong/coinapp/releases/latest">Download Latest</a> and try out this new opensource wallet. This application uses [insight-api](https://github.com/bitpay/insight-api) to fetch up-to-date balances and UTXO's rather than depending on a central server to collect transaction information. For Ethereum, this application uses a normal connect to geth JSON RPC server. You can use [infura.io](https://infura.io/) or connect to your local geth server. CoinApp lets the user modify their connections to fit their own decentralized server. 

<p align="center">
<a href="https://img.cjx.io/coinapprun1.gif"><img width="70%" src="https://img.cjx.io/coinapprun1.gif"></a>
</p>

# Features of CoinApp
CoinApp trys to make this cryptocurrency process as simple as possible. The wallet accepts Keystore JSON Etheruem Wallets, Private Keys for ETH, BTC, LTC, and Mnemonic phrases 3-24 words long [BIP39](https://iancoleman.io/bip39/). With CoinApp you can view all of your wallet's transactions without downloading the entire blockchain. This application is also great for developing on the Blockchain Testnet's.

<p align="center">
  <a href="https://img.cjx.io/coinappsendeth.gif"><img width="70%" src="https://img.cjx.io/coinappsendeth.gif"></a>
</p>

# ERC20 Tokens
CoinApp will automatically fetch all your balances for the most popular coins when you use an Ethereum address. This token list is based off of MyEtherWallet [tokens-eth.json](https://github.com/MyEtherWallet/ethereum-lists/blob/master/tokens/tokens-eth.json) list. It will quickly scan for balances on ERC20 Tokens using my other project [TokenBalance.com API](https://github.com/hunterlong/tokenbalance). When using smart contracts you can change the Gas Limit and the Gas Price to match the requirements, the defaults are a safe limit for all coin transfers. 
If you need to add a custom token you can easily add your own contract address to parse ERC20 tokens!

<p align="center">
<a href="https://img.cjx.io/coinappcoinview1.gif"><img width="45%" src="https://img.cjx.io/coinappcoinview1.gif"></a><a href ="https://img.cjx.io/coinapptxscroll.gif"><img width="45%" src="https://img.cjx.io/coinapptxscroll.gif"></a>
</p>
<p align="center"><a href="https://img.cjx.io/coinapptxview.gif"><img width="45%" src="https://img.cjx.io/coinapptxview.gif"></a><a href="https://img.cjx.io/coinappaddtoken.gif"><img width="45%" src="https://img.cjx.io/coinappaddtoken.gif"></a>
</p>

# Cryptocurrency Support
There are hundreds of cryptos these days, but this app lets you interact with the most popular tokens and main cryptocurrencies. Below is a list of cryptocurrencies we current support.
- Ethereum
- ERC20 Tokens
- Bitcoin
- Litecoin
- Ethereum Ropsten Testnet
- Bitcoin Testnet
- Litecoin Testnet

<p align="center">
  <img width="70%" src="https://img.cjx.io/coinappsendbtc.gif">
</p>

This list will expand while trying to keep the "minimal" look. Any coin that has an insight api or any other open source API should be added in CoinApp. Coins like Bitcoin and Litecoin need to fetch previous transactions from the blockchain before you can create a new transaction. This application will give you the option to point everything to your own local servers. Below is a list of cryptos we want to accept in the near future. 
- Bitcoin Cash
- Dash
- Ripple
- Possibly Ethereum contract calls!

# Wallet Types Support
CoinApp lets the advanced users get in control of their own cryptos. You can change API endpoint any time! Below is a list of wallet types this crypto wallet accepts.
- Ethereum Keystore JSON File (same file Mist and MyEtherWallet.com uses)
- Ethereum Private Key
- Bitcoin Private Key
- Litecoin Private Key
- Mnemonic Phrases (3-24 words, includes wallet index option) BIP39

In the future CoinApp plans to add a couple other cryptocurrency wallet types to better serve the crypto community. Here's a short list of wallet types we plan to add.
- [Ledger](https://www.ledgerwallet.com/) Hardware Wallet
- [Trezor](https://trezor.io/) Hardware Wallet
- Bitcoin and Litecoin wallet.dat Files.
- Hierarchical Deterministic Wallets (from xpriv) [BIP32](http://bip32.org/)

# Signed Windows and Mac Apps
CoinApp is tested, built, signed and deployed on Travis CI and Appveyor and then updated as a release into Github. Only download CoinApp from Github because it will have a valid certificate when it was created. [Windows may warn you](https://answers.microsoft.com/en-us/protect/forum/protect_defender-protect_scanning/defendersmartscreen-warning/bba4ad97-c145-4cad-9963-70782371cea9) about installing, this is because the app has a relatively new code signing certificate. The publisher for the Windows installation should be **Hunter Long** signed by Digicert. If you do not have this publisher name while installing delete it immediately. Only download from Github releases!

# Automatic Updates
This application will automatically update when there is a new version of CoinApp. Automatic updates will make sure you have the latest code that might have patched previous exploits. Be sure to update when a new release is issued. Only the master branch of this repo will be built, and only admins of this project can accept a pull request into master. 

# Wallet Security
You must remember to keep your private keys **private**. If you're using an Ethereum wallet I recommend you use a Keystore JSON file to secure your Ethereum and ERC20 funds. CoinApp does not send private keys to the outside internet, all transactions are encrypted locally and private keys always remain in your hands. Only download CoinApp from the [latest releases](https://github.com/hunterlong/coinapp/releases/latest) area of this github repo. I recommend you test this application and review the source code. Below is a list of core libraries CoinApp uses.
- [bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib) - Encrypts BTC and LTC transactions locally.
- [bip39](https://github.com/bitcoinjs/bip39) - Mnemonic phrase wallets
- [Electron](https://electronjs.org/) - Framework for a client side crypto wallet
- [ethers](https://github.com/ethers-io/ethers.js/) - Transactions and Encryption for Ethereum wallets

# Test and Audit
Testing is to be performed on all functions that the user interacts with. You can test yourself with `export NODE_ENV='test' && npm test` for automated testing. This project has a docker-compose.yml file to run 3 test instances of Bitcoin, Litecoin, and an Ethereum server with RPC requests. The Bitcoin and Litecoin servers also have insight-api to get balances and UTXO's as you normally would. Don't worry, the private keys listed in the tests have no value on them and only work with the. You can run an entire test including sending transactions with the commands below.

### Full Test with Docker
To test CoinApp with an Ethereum, Bitcoin and Litecoin test network you can get everything setup with the docker-compose file included in this repo. You must have [Docker](https://www.docker.com/get-docker) installed to do this full test.
- `npm run test-all`

<p align="center">
  <img width="80%" src="https://i.imgur.com/8Od3JMr.png">
</p>

