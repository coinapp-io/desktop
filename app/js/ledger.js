

var comm;
var ledgerEth;
var ledgerBTC;

var ledgerConfigs = {
    coin: "",
    comm: null,
    path: "44'/60'/0'/0",
};

ledger.comm_node.create_async().then(function(nodecomm) {
    ledgerEth = new ledger.eth(nodecomm);
    comm = nodecomm;
    console.log(nodecomm);
}).catch(function(e) {
    console.log(e);
});


function OpenLedger(coin) {

    ledgerEth.getAddress_async("44'/60'/0'/0").then(
        function(result) {
            configs.api = store.get("geth");
            configs.network = ethers.networks.mainnet;
            ledgerConfigs.path = "44'/60'/0'/0";
            ledgerConfigs.coin = "coin";
            ledgerConfigs.comm = comm;
            configs.address = result.address;
            var provider = new ethers.providers.JsonRpcProvider(configs.api, configs.network);
            configs.provider = provider;
            configs.wallet = {address: result.address, provider: provider};
            configs.coin = coin.toUpperCase();
            $(".myaddress").html(configs.address);

            console.log(ledgerConfigs);

            LoadSavedTokens();
            UpdateBalance().then(function(balance) {
                tokenList = require('../../app/js/tokens-eth.json');
                LoadEthereumTransactions(configs.address).then(function(tsx) {
                    SuccessAccess();
                    RenderTransactions(configs.myTransactions, 0, 12).then(function(t) {
                        BeginTokenLoading();
                        // render trnsactions
                    });
                }).catch(function(err) {
                    ShowNotification(err);
                });
            });

        })

}