


var eToken = {
  address: "",
  balance: 0,
  symbol: "",
  decimals: 8
};


var exporter = {
    info: "CoinApp.io",
    version: version,
    time: 0,
    address: "",
    balance: 0,
    decimals: 18,
    nonce: 0,
    coin: "",
    transactions: [],
    utxo: [],
    tokens: []
};



function ImportWalletData() {
    dialog.showOpenDialog(function(file) {
        fs.readFile(file.toString(), function (err, data) {
            var json = JSON.parse(data.toString());
            console.log(json);
        });
    });
}




function ConvertImportedData(data) {



}





function ExportETHWallet() {
    ParseETHWalletData().then(function(data) {
        var json = WalletToJSON(data);
        dialog.showSaveDialog({defaultPath: configs.address.substring(0, 10)+'-data.json'},function (fileName) {
            var stream = fs.createWriteStream(fileName);
            stream.once('open', function(fd) {
                stream.write(json);
                stream.end();
            });
        });
    });
}



function ExportBTCWallet() {
    ParseBTCWalletData().then(function(data) {
        var json = WalletToJSON(data);
        dialog.showSaveDialog({defaultPath: configs.address.substring(0, 10)+'-data.json'},function (fileName) {
            var stream = fs.createWriteStream(fileName);
            stream.once('open', function(fd) {
                stream.write(json);
                stream.end();
            });
        });
    });
}



function ExportWallet() {
    if (isBitcoin()) {
        ExportBTCWallet()
    } else {
        ExportETHWallet()
    }
}



function ParseBTCWalletData() {
    return new Promise(function(resolve, reject) {
        if (isBitcoin()) {

            UpdateBalance().then(function(balance) {
                DownloadAllBitcoinTransactions(configs.address).then(function(transactions) {
                    LoadUTXOs(configs.address).then(function(utxos) {

                exporter = {
                    info: "CoinApp.io Wallet Data for "+configs.address,
                    version: version,
                    address: configs.address,
                    balance: balance.toString(),
                    decimals: 8,
                    coin: configs.coin,
                    transactions: transactions.transactions,
                    utxos: utxos
                };

                resolve(exporter);


                });
            });
        });

        }

    });
}





function ParseETHWalletData() {
    return new Promise(function(resolve, reject) {
    if (configs.coin=="ETH" || configs.coin=="ROPSTEN") {

        GetNonce().then(function(nonce) {

            exporter = {
                info: "CoinApp.io Wallet Data for "+configs.address,
                version: version,
                address: configs.address,
                balance: configs.bigBalance.toString(),
                decimals: 18,
                coin: configs.coin,
                nonce: nonce,
                transactions: configs.transactions,
                tokens: configs.availableTokens
            };

            resolve(exporter);

        });

    }

    });
}



function WalletToJSON(expo) {
    var ex = expo;
    ex.time = Math.round(+new Date()/1000);
    return JSON.stringify(ex);
}
