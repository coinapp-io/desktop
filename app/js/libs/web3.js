LoadGasPrice();

function Web3Mainnet(mainnet) {
    if (mainnet) {
        configs.api = ETH_SERVER;
    } else {
        configs.api = ROPSTEN_SERVER;
    }
    web3 = new Web3(new Web3.providers.HttpProvider(configs.api));
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

function BroadcastRaw(raw) {
    return new Promise(function(resolve, reject) {
        web3.eth.sendSignedTransaction(raw).then(function(e) {
            resolve(e);
        }).catch(function(e) {
            reject(e)
        });
    });
}

function BtcBalance(address) {
    return new Promise(function(resolve, reject) {
        $.get("https://btc.coinapp.io/api/addr/"+address+"/balance", function( data ) {
            resolve(TokenToFloat(data, 8));
        }).catch(function(e){
            reject("Could not fetch BTC balance for address: "+address);
        });
    });
}


function LtcBalance(address) {
    return new Promise(function(resolve, reject) {
        $.get("https://ltc.coinapp.io/api/addr/"+address+"/balance", function( data ) {
            resolve(TokenToFloat(data, 8));
        }).catch(function(e){
            reject("Could not fetch LTC balance for address: "+address);
        });
    });
}

function LoadGasPrice(callback) {
    web3.eth.getGasPrice().then(function(p) {
        var amount = ethers.utils.formatUnits(p.toString(), 9).toString();
        configs.gasPrice = parseInt(amount);
        if (callback) { callback(configs.gasPrice); }
    });
}
