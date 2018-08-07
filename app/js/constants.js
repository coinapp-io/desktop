const fs = require("fs");
const pathjs = require('path');
const current_path = pathjs.join(__dirname, '../');
var ethers = require('ethers');
var bip39 = require('bip39');
var bitcoin = require('bitcoinjs-lib');
var hdkey = require('ethereumjs-wallet/dist/hdkey');
var ledger = require('ledgerco');
var networks = require(current_path+'app/js/networks');

const CoinWallet = require(current_path+'app/js/exports/coinwallet');
const CoinTransaction = require(current_path+'app/js/exports/cointransaction');

const Web3 = require('web3');

const RLP = require('rlp');
const Tx = require('ethereumjs-tx');

const {
    shell
} = require('electron');
const clipboardy = require('clipboardy');
const {
    dialog
} = require('electron').remote;
const feeutil = require('bitcoin-util-fee');
var tokenList;
const ipcRenderer = require('electron').ipcRenderer;
var os = require('os');
const Store = require('electron-store');
const store = new Store();
const notifier = require('node-notifier');
var tokenWorker = new Worker(current_path+'app/js/token_parser.js');
var QRCode = require('qrcode');
var BigNumber = require('bignumber.js');
var configs = {
    coin: "none",
    gasLimit: 21000,
    gasPrice: 21,
    wallet: null,
    address: "",
    nonce: 0,
    network: null,
    chainCode: 1,
    transactions: [],
    decimals: 18,
    bigBalance: 0,
    balance: "0.0",
    pendingBalance: "0.0",
    tokenBalance: "0.0",
    bigTokenBalance: 0,
    tokenDecimals: 0,
    block: 0,
    api: "https://eth.coinapp.io",
    provider: null,
    myTransactions: [],
    pendingTransactions: [],
    tokenAddress: "",
    token: null,
    availableTokens: [],
    isTestnet: false,
    savedTokens: [],
    utxos: []
};
var btcHD;
var ethHD;
var xpriv;
var usingHD;
var path;
var version = store.get('version');
// WALLET VARS
var myWallet;
var providers = ethers.providers;
var Wallet = ethers.Wallet;
var provider;
var keyFile;
// ETHEREUM VARS
var ethBalance = 0;
var ethBalanceString;
var myAddress;
// TOKEN VARS
var tokenBalance = 0;
var tokenBalanceString;
var tokenContract;
var tokenSymbol;
var tokenDecimals = 8;
var TOKEN_ADDRESS = '0x29d75277ac7f0335b2165d0895e8725cbf658d73';
var usingBtc;
var usingLtc;
var btcBalance;
var ltcBalance;
var btcTransactions;
var lastBalance;
var coinNetwork;
var availableTokens = [];
var apiEndpoint;
var alreadyCheckTokens;
var usingEthLedger;
var usingBtcLedger;
var allTransactions = [];
var lastTransactions;
var pendingBalance;
var pendingEthTransaction = [];
var lastEthBlock;
var lastTrxScroll;

var web3 = new Web3(new Web3.providers.HttpProvider(configs.api));
