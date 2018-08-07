function SendToken(from, to, amount) {
    return new Promise(function(resolve, reject) {
        web3.eth.getTransactionCount(from).then(function (nonce) {
            var gasPrice = parseInt(configs.gasPrice) * 1000000000;
            var data = FormatTransfer(to, amount);
            const txObj = {
                nonce: web3.utils.toHex(nonce),
                gasPrice: web3.utils.toHex(gasPrice),
                gasLimit: web3.utils.toHex(configs.gasLimit),
                to: configs.contract,
                value: web3.utils.toHex(0),
                data: data,
                r: "0x00",
                s: "0x00",
                v: "0x0" + configs.chainCode.toString(16)
            };
            var txToSign = new Tx(txObj).serialize().toString('hex');
            var data = {tx: txObj, signed: txToSign, nonce: nonce};
            resolve(data)
        }).catch(function(e) {
            reject(e);
        });
    });
}


function SendEthereum(from, to, amount) {
    return new Promise(function(resolve, reject) {
        web3.eth.getTransactionCount(from).then(function (nonce) {
            var gasPrice = parseInt(configs.gasPrice) * 1000000000;
            const txObj = {
                nonce: web3.utils.toHex(nonce),
                gasPrice: web3.utils.toHex(gasPrice),
                gasLimit: web3.utils.toHex(configs.gasLimit),
                to: to,
                value: web3.utils.toHex(amount),
                r: "0x00",
                s: "0x00",
                v: "0x0" + configs.chainCode.toString(16)
            };
            var txToSign = new Tx(txObj).serialize().toString('hex');
            var data = {tx: txObj, signed: txToSign, nonce: nonce};
            resolve(data)
        }).catch(function(e) {
            reject(e);
        });
    });
}