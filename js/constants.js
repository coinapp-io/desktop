var ethers = require('ethers');
var bip39 = require('bip39');
var bitcoin = require('bitcoinjs-lib');
var hdkey = require('ethereumjs-wallet/hdkey');
const {shell} = require('electron');
const fs = require('fs');
const clipboardy = require('clipboardy');
const { dialog } = require('electron').remote;

if (process.env.NODE_ENV=='test') {
    var tokenList = require('../.travis/tokens_testnet.json');
} else {
    var tokenList = require('../js/tokens-eth.json');
}

const ipcRenderer = require('electron').ipcRenderer;
const EthereumTx = require('ethereumjs-tx');
var os = require('os');
const Store = require('electron-store');
const store = new Store();
const notifier = require('node-notifier');
var pathjs = require('path');


var btcHD;
var ethHD;
var xpriv;
var usingHD;
var path;


var version = "0.0.1";

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