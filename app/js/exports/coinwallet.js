const ethers = require('ethers');
const Wallet = ethers.Wallet;
const bitcoin = require('bitcoinjs-lib');
const networks = require('./coinnetworks');
const CoinTransaction = require('./cointransaction');
const ledger = require('ledgerco');
const Web3 = require('web3');
var request = require('request');

var web3 = new Web3(new Web3.providers.HttpProvider("https://eth.coinapp.io"));


CoinWallet.prototype = {
    balance: async function() {
        return await AccountBalance(this.address);
    },
    pendingBalance: async function() {
        return await AccountBalance(this.address);
    },
    nonce: async function() {
        return await AccountNonce(this.address);
    },
    transactions: function() {
        return [];
    },
    utxos: function() {
        if (this.coin==="ETH" || this.coin==="ROPSTEN") { return []; }
        return GetUTXO(this);
    },
    signTransaction: function(tx) {
        if (typeof tx !== CoinTransaction.constructor) { return "incorrect transaction object" }
        if (this.coin==="ETH" || this.coin==="ROPSTEN") {
            return this.w.sign(tx);
        } else if (this.ledger) {
            // sign on ledger

        } else {
            return tx.sign(this.w.key, this.w.address);
        }
    },
    toJSON: function() {
        return JSON.stringify(this);
    },
};

function CoinWallet(w) {
    this.address = w.address;
    this.private = w.priv;
    this.network = w.network;
    this.chain = w.chain;
    this.ledger = (w.ledger===true);
    this.index = (w.index || 0);
    this.isBtc = w.isBtc;
    this.api = w.api;
    this.w = w;
}


function NewWeb3(url) {
    web3 = new Web3(new Web3.providers.HttpProvider(url));
    return web3
}


function NewWallet(coin, key) {
    return new Promise(function(resolve, reject) {
        switch (coin) {
            case "eth":
                UnlockETHPrivateKey(coin, key).then(function (wdata) {
                    w = {
                        address: wdata.address,
                        priv: key,
                        network: ethers.networks.mainnet,
                        nonce: 0,
                        chain: 1,
                        coin: coin.toUpperCase(),
                        w: wdata,
                        api: "https://eth.coinapp.io",
                        isBtc: false,
                    };
                    web3 = new Web3(new Web3.providers.HttpProvider(w.api));
                    resolve(new CoinWallet(w));
                });
                break;
            case "ropsten":
                UnlockETHPrivateKey(coin, key).then(function (wdata) {
                    w = {
                        address: wdata.address,
                        priv: key,
                        network: ethers.networks.testnet,
                        nonce: 0,
                        chain: 3,
                        coin: coin.toUpperCase(),
                        w: wdata,
                        api: "https://ropsten.coinapp.io",
                        isBtc: false,
                    };
                    web3 = new Web3(new Web3.providers.HttpProvider(w.api));
                    resolve(new CoinWallet(w));
                });
                break;
            case "btc":
                UnlockBTCPrivateKey(coin, key).then(function (wdata) {
                    w = {
                        address: wdata.address,
                        priv: wdata.toWIF(),
                        network: networks.bitcoin,
                        nonce: 0,
                        coin: coin.toUpperCase(),
                        w: wdata,
                        api: "https://btc.coinapp.io/api",
                        isBtc: true,
                    };
                    resolve(new CoinWallet(w));
                });
                break;
            case "btctest":
                UnlockBTCPrivateKey(coin, key).then(function (wdata) {
                    w = {
                        address: wdata.address,
                        priv: wdata.toWIF(),
                        network: networks.testnet,
                        nonce: 0,
                        coin: coin.toUpperCase(),
                        w: wdata,
                        api: "https://btctest.coinapp.io/api",
                        isBtc: true,
                    };
                    resolve(new CoinWallet(w));
                });
                break;
            case "ltc":
                UnlockBTCPrivateKey(coin, key).then(function (wdata) {
                    w = {
                        address: wdata.address,
                        priv: wdata.toWIF(),
                        network: networks.litecoin,
                        nonce: 0,
                        coin: coin.toUpperCase(),
                        w: wdata,
                        api: "https://ltc.coinapp.io/api",
                        isBtc: true,
                    };
                    resolve(new CoinWallet(w));
                });
                break;
            case "ltctest":
                UnlockBTCPrivateKey(coin, key).then(function (wdata) {
                    w = {
                        address: wdata.address,
                        priv: wdata.toWIF(),
                        network: networks.litecointest,
                        nonce: 0,
                        coin: coin.toUpperCase(),
                        w: wdata,
                        api: "https://ltctest.coinapp.io/api",
                        isBtc: true,
                    };
                    resolve(new CoinWallet(w));
                });
                break;
            default:
                reject("no wallet created")
        }
    });
}



function UnlockWalletKeystore(filename, password) {
    return new Promise(function (resolve, reject) {
        OpenFile(filename).then(function (walletData) {
            if (password != '' && walletData != '' && Wallet.isEncryptedWallet(walletData)) {
                Wallet.fromEncryptedWallet(walletData, password).then(function (wallet) {
                    resolve(wallet);
                });
            } else {
                reject("incorrect wallet type")
            }
        });
    });
}


function UnlockBTCPrivateKey(coin, key) {
    return new Promise(function (resolve, reject) {
        var network = networks.bitcoin;
        if(coin == "btc") {
            network = networks.bitcoin;
        } else if(coin == "ltc") {
            network = networks.litecoin;
        } else if(coin == "btctest") {
            network = networks.testnet;
        } else if(coin == "ltctest") {
            network = networks.litecointest;
        } else if(coin == "doge") {
            network = networks.dogecoin;
        } else if(coin == "zcash") {
            network = networks.zcash;
        }
        var wallet = bitcoin.ECPair.fromWIF(key, network);
        const { address } = bitcoin.payments.p2pkh({ network: network, pubkey: wallet.publicKey });
        wallet.address = address;
        wallet.coin = coin.toUpperCase();
        resolve(wallet);
    });
}


function UnlockETHPrivateKey(coin, key) {
    return new Promise(function (resolve, reject) {
        if(key.substring(0, 2) !== '0x') {
            key = '0x' + key;
        }
        var wallet = new Wallet(key);
        if (wallet.address === "") {
            reject("incorrect ethereum key")
        }
        resolve(wallet);
    });
}


function GetUTXO(wallet) {
    return new Promise(function(resolve, reject) {
        request.get(wallet.api+"/addr/"+wallet.address+"/utxo").on('response', function(response) {
            resolve(JSON.parse(response));
        })
    });
}


function AccountNonce(address) {
    return new Promise(function(resolve, reject) {
        web3.eth.getTransactionCount(address).then(function (nonce) {
            resolve(nonce)
        }).catch(function(e) {
            reject(e)
        });
    });
}

function AccountBalance(address) {
    return new Promise(function(resolve, reject) {
        web3.eth.getBalance(address).then(function(bal) {
            resolve(bal)
        }).catch(function(e){
            reject(e);
        });
    });
}



function signTx(wallet) {

}

module.exports = {
    NewWallet,
    NewWeb3,
    GetUTXO,
    AccountNonce,
    AccountBalance,
};