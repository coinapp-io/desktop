$(".main-container").css("opacity", "1");


ipcRenderer.send('checkForLedger');

// SignEthLedger("e7808609184e72a00082271094ae7ce10bd7fd8eb786064b888013faccc451632e822710801c8080");

function SignEthLedger(rawtx) {
    path = "44'/60'/0'/0'/0";
    ipcRenderer.send('signEthLedger', path, rawtx);
}


function OpenBTCLedger() {
    path = "44'/0'/0'/0";
    ipcRenderer.send('openBtcLedger', path);
}


function OpenETHLedger() {
    path = "44'/60'/0'/0'/0";
    ipcRenderer.send('openEthLedger', path);
}


ipcRenderer.on('ledgerBtcAddress', function(info, address) {
    console.log(info);
    alert(address);
});


ipcRenderer.on('ledgerEthAddress', function(info, address) {
    console.log(info);
    alert(address);
});


function TransactionFee(utxos) {
    var isTesting = process.env.NODE_ENV;
    var fee = 0;
    if (usingLtc) {
        if (isTesting=='test'){
            fee = (utxos.length) * 180 + 2 * 34 + 10;
        } else {
            fee = (utxos.length) * 180 + 2 * 34 + 10;
        }
    } else if (usingBtc) {
        if (isTesting=='test'){
            fee = (utxos.length) * 180 + 2 * 34 + 10;
        } else {
            fee = (utxos.length) * 180 + 2 * 34 + 10;
        }
    }
    console.log("current fee: "+fee);
    if (usingLtc) {
        if (isTesting=='test'){
            if (fee <= 37400) fee = 37400
        } else {
            if (fee <= 100000) fee = 100000
        }
    } else if (usingBtc) {
        if (isTesting=='test'){
            if (fee <= 100000) fee = 100000
        } else {
            if (fee <= 1130) fee = 1130
        }
    }
    return fee
}



function PendingBalance() {
    if (usingBtc) {
        return btcBalance
    } else if (usingLtc) {
        return ltcBalance
    } else {
        return ethBalance
    }
}


function SendCoins(to_address, send_amount, callback) {
    var tx = new bitcoin.TransactionBuilder(coinNetwork);

    CryptoBalance(myAddress, function(bal) {

        console.log("tx bal: "+bal);

        LoadUTXOs(myAddress, function(utxos) {

            $.each(utxos, function (key, out) {
                tx.addInput(out.txid, out.vout);
            });

            var transactionFee = TransactionFee(utxos);

            console.log("fee: "+transactionFee);
            var remaining = parseInt(bal) - parseInt(send_amount) - transactionFee;

            console.log("sending:   ", send_amount);
            console.log("remaining: ", remaining);
            console.log("to: ", to_address);
            console.log("my addr: ", myAddress);

            tx.addOutput(to_address, parseInt(send_amount));
            tx.addOutput(myAddress, parseInt(remaining));

            $.each(utxos, function (key, out) {
                tx.sign(key, myWallet);
            });

            console.log(tx);

            var tx_hex = tx.build().toHex();

            callback(tx_hex);

        });

    });

}

function LoadUTXOs(address, callback) {
    var api = apiEndpoint+"/addr/"+address+"/utxo";
    $.get(api, function(utxos) {
        callback(utxos)
    });
}

function CopyAddress() {
    clipboardy.writeSync(myAddress);
    ShowNotification("Address Copied: " + myAddress);
}


function ChangeTokenName(name) {
    $("span.token_name").each(function() {
        $(this).html(name);
    });
}

function ChangeTokenSymbol(name) {
    $("span.token_symbol").each(function() {
        $(this).html(name);
    });
}

function ChangeCryptoSymbol(name) {
    $(".crypto_symbol").each(function() {
        $(this).html(name);
    });
}

function QuitAppButton() {
    app.quit()
}


function OpenNewWallet() {
    var pass = $("#newpass").val();
    var passconf = $("#newpassconf").val();
}


function UseKeystore() {
    HideButtons();
    $("#keystoreupload").attr("class", "");
}

function UsePrivateKey() {
    HideButtons();
    $("#privatekey").attr("class", "");
}

function UseNewWallet() {
    HideButtons();
    $("#createnewwallet").attr("class", "");
}


function OpenURL(url) {
    shell.openExternal(url)
}

function OpenEtherScan(txid) {
    shell.openExternal('https://etherscan.io/tx/' + txid)
}

function OpenGithubRepo() {
    shell.openExternal('https://github.com/hunterlong/coinapp')
}

function OpenGithubReleases() {
    shell.openExternal('https://github.com/hunterlong/coinapp/releases')
}

function OpenHunterGithub() {
    shell.openExternal('https://github.com/hunterlong')
}

function OpenMyEtherWallet() {
    shell.openExternal('https://www.myetherwallet.com')
}

function OpenBlockchainTx(txid, coin) {
    var url = TransactionURL(txid, coin);
    shell.openExternal(url);
}


function FocusOnToken(token, decimals, name, symbol) {
    console.log("Logging: " + token);
    TOKEN_ADDRESS = token;
    tokenSymbol = symbol;
    tokenDecimals = decimals;
    tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);

    $("#token_balance_area").removeClass("d-none");
    $("#send_token_area").removeClass("d-none");

    $("#token_balance_area").attr("class", "col-4 offset-2 coinBox");
    $("#crypto_balance_area").attr("class", "col-6 coinBox");
    $("#send_token_area").attr("class", "col-4 offset-2 text-center sendBtns");
    $("#send_crypto_area").attr("class", "col-6 text-center sendBtns");

    UpdateBalance();
    ChangeTokenName(name);
    ChangeTokenSymbol(symbol);
}


$("#hdpath_coin").change(function() {
    coin = $('#hdpath_coin option:selected').val();
    if (coin=="eth") {
        usingBtc = false;
        usingLtc = false;
    } else if (coin=="btc") {
        usingBtc = true;
        usingLtc = false;
    } else if (coin=="ltc") {
        usingBtc = false;
        usingLtc = true;
    }
    UpdatePath(ParsePath());
});


function ParsePath() {
    path = $('#hdpath_options option:selected').val();
    index = $("#hd_path_index").val();
    return path+index;
}


$("#hdpath_options").change(function() {
    $("#hd_path").val(ParsePath());
    UpdatePath(ParsePath());
});


$("#hd_path_index").on("input", function() {
    $("#hd_path").val(ParsePath());
    UpdatePath(ParsePath());
});


function UpdatePath(path) {
    UpdateWalletFromHD(path);
    // for (i=0;i<=15;i++) {
    //     var thispath = path+"/"+i;
    //     console.log("BTC Path: "+thispath+" - "+BTCaddress(thispath));
    //     console.log("ETH Path: "+thispath+" - "+ETHaddress(thispath));
    // }
}


function SuccessAccess() {
    if (usingBtc) {
        $("#token_balance_area").hide();
        $("#send_token_area").hide();
        $("#crypto_balance_area").attr("class", "col-md-12 coinBox");
        $("#send_crypto_area").attr("class", "col-md-12 text-center sendBtns");
        $("#send_ether_btn").html("Send Bitcoin");
        $("#crypto_balance_area").html("<b id=\"ethbal\"></b> BTC");
        $("#tokens_available-tab").remove();
        $("#transaction_nav").attr("class", "nav-item col-12");
        $("#crypto_modal_title").html('Send Bitcoin');
        $("#cryptos_available").html("<u class=\"ethspend\">0.0</u> BTC Available");
        $("#crypto_data").remove();
        $("#crypto_gas_limit").remove();
        $("#crypto_gas_price").remove();
        $("#sendethbutton").html("Send BTC");
        apiEndpoint = btc;
        ChangeCryptoSymbol("BTC");
        LoadBitcoinTransactions(myAddress, "btc");
    } else if (usingLtc) {
        $("#token_balance_area").hide();
        $("#send_token_area").hide();
        $("#crypto_balance_area").attr("class", "col-md-12 coinBox");
        $("#send_crypto_area").attr("class", "col-md-12 text-center sendBtns");
        $("#send_ether_btn").html("Send Litecoin");
        $("#crypto_balance_area").html("<b id=\"ethbal\"></b> LTC");
        $("#tokens_available-tab").remove();
        $("#transaction_nav").attr("class", "nav-item col-12");
        $("#crypto_modal_title").html('Send Litecoin');
        $("#cryptos_available").html("<u class=\"ethspend\">0.0</u> LTC Available");
        $("#crypto_data").remove();
        $("#crypto_gas_limit").remove();
        $("#crypto_gas_price").remove();
        $("#sendethbutton").html("Send LTC");
        apiEndpoint = ltc;
        ChangeCryptoSymbol("LTC");
        LoadBitcoinTransactions(myAddress, "ltc");
    } else {
        // tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);
        LoadEthereumTransactions(myAddress);
        ParseTokenList();
        $(".block_number").removeClass("d-none");
        provider.on('block', function(blockNumber) {
            console.log('New Block: ' + blockNumber);
            $(".block_number").html("Block #"+blockNumber);
        });
    }
    $("#access_container").hide();
    $("#token_container").removeAttr("hidden");
    $(".tokens_list").removeAttr("hidden");

    $(".main-container").css("left", "220px");
    $(".main-container").css("width", "620px");

    // $(".options").hide();
    // $(".walletInput").hide();
    // $("#addressArea").attr("class", "row");
    // $("#walletActions").attr("class", "row");
    // $(".walletInfo").attr("class", "row walletInfo");
}


function PopupNotification(title, text) {
    notifier.notify({
        title: title,
        message: text,
        sound: 'Ping',
        timeout: 6
    });
}


function ShowNotification(text, time=2500) {
    $(".popup_notifications").html(text);
    $(".popup_notifications").css("margin-top", "0px");
    setTimeout(function() {
        $(".popup_notifications").css("margin-top", "-85px");
    }, time);
}


function HideButtons() {
    $("#keystoreupload").attr("class", "hidden");
    $("#createnewwallet").attr("class", "hidden");
    $("#privatekey").attr("class", "hidden");
}


function SetBitcoinNetwork(coin) {
    if (coin=="btc") {
        if (process.env.NODE_ENV=='test') {
            coinNetwork = bitcoin.networks.testnet;
        } else {
            coinNetwork = bitcoin.networks.bitcoin;
        }
    } else if (coin=="ltc") {
        if (process.env.NODE_ENV=='test') {
            coinNetwork = bitcoin.networks.testnet;
        } else {
            coinNetwork = bitcoin.networks.litecoin;
        }
    }
}


function OpenPrivateKey() {
    var key = $("#privatepass").val();
    var coin = $( "#unlock_coin_type option:selected").val();

    if (coin=="btc") {
        try {
            usingBtc = true;
            SetBitcoinNetwork(coin);
            myWallet = bitcoin.ECPair.fromWIF(key, coinNetwork);
            myAddress = myWallet.getAddress();
            SuccessAccess();
            UpdateBalance();
        } catch(e) {
            $("#privatepass").val('');
            ShowNotification("Bitcoin Wallet: "+e);
        }
    } else if (coin=="ltc") {
        try {
            usingLtc = true;
            SetBitcoinNetwork(coin);
            myWallet = bitcoin.ECPair.fromWIF(key, coinNetwork);
            myAddress = myWallet.getAddress();
            SuccessAccess();
            UpdateBalance();
        } catch(e) {
            $("#privatepass").val('');
            ShowNotification("Litecoin Wallet: "+e);
        }
    } else {

        if (key.substring(0, 2) !== '0x') {
            key = '0x' + key;
        }
        if (key != '' && key.match(/^(0x)?[0-9A-fa-f]{64}$/)) {
            HideButtons();
            try {
                provider = new ethers.providers.JsonRpcProvider(geth);
                myWallet = new Wallet(key);
                myWallet.provider = new ethers.providers.JsonRpcProvider(geth);
                myAddress = myWallet.address;
                console.log("Opened: " + myAddress);
                SuccessAccess();
                UpdateBalance();
            } catch (e) {
                ShowNotification(e);
                console.error(e);
            }
        } else {
            $("#privatekeyerror").show();
        }
    }
}


function UnlockWalletKeystore() {
    var password = $("#keystorewalletpass").val();

    if (password=="" || keyFile==undefined) return false;

    var buffer = fs.readFileSync(keyFile);
    var walletData = buffer.toString();

    if (password != '' && keyFile != '' && Wallet.isEncryptedWallet(walletData)) {

        Wallet.fromEncryptedWallet(walletData, password).then(function(wallet) {
            console.log("Opened Address: " + wallet.address);
            provider = new ethers.providers.JsonRpcProvider(geth);
            wallet.provider = provider;
            myWallet = wallet;
            myAddress = myWallet.address;
            SuccessAccess();
            UpdateBalance();
        });
    } else {
        ShowNotification("Invalid Keystore JSON File");
    }
    $("#keystorewalletpass").val('');
}

function reject() {
    $("#keystorejsonerror").html("Incorrect Password for Keystore Wallet");
    $("#keystorejsonerror").show();
    $("#keystorebtn").prop("disabled", false);
    $("#keystorebtn").html("Open");
}


function OpenKeystoreFile() {
    dialog.showOpenDialog(function(fileNames) {
        if (fileNames === undefined) return;
        keyFile = fileNames[0];
        console.log(keyFile);
    });
}


function ConfirmButton(elem) {
    $(elem).html("CONFIRM");
    $(elem).attr("class", "btn btn-success")
}


function UpdateTokenFees() {
    var amount = parseFloat($("#send_amount_token").val());
    var gasLimit = $("#tokengaslimit").val();
    var gasPrice = $("#tokengasprice").val();
    if (bad(amount) || bad(gasLimit) || bad(gasPrice) || bad(amount)) {
        $(".ethavailable").html(ethBalance.toFixed(6));
        $(".token_spend").html(tokenBalance.toFixed(6));
        $("#sendtokenbutton").prop("disabled", true);
        return
    }
    var availableTokens = tokenBalance - amount;
    $(".token_spend").html(availableTokens.toFixed(6));
    var price = parseInt(gasPrice) * 0.000000001;
    var txCost = gasLimit * price;
    var available = ethBalance - txCost;
    $("#tokentxfee").val(txCost.toFixed(6));
    $(".ethavailable").html(available.toFixed(6));
    var correctAddr = isEthAddress($("#send_to_token").val());
    if (correctAddr && availableTokens >= 0 && available >= 0) {
        $("#sendtokenbutton").prop("disabled", false);
    } else {
        $("#sendtokenbutton").prop("disabled", true);
    }
}


function UpdateEthFees() {
    var amount = parseFloat($("#send_ether_amount").val());
    var gasLimit = parseInt($("#ethgaslimit").val());
    var gasPrice = parseInt($("#ethgasprice").val());
    var price = parseInt(gasPrice) * 0.000000001;
    var txCost = gasLimit * price;
    var available = 0;

    if (usingLtc) {
        $(".ethspend").val(ltcBalance);
        available = ltcBalance - parseFloat(amount);
        gasPrice = 1;
        gasLimit = 1;
        txCost = 0.000374;
        $("#send_ether_to").attr("placeholder", "LKmC2Gda9LMAWWDYP6wqN2N8qKhnVzbgE5");
    } else if (usingBtc) {
        $(".ethspend").val(btcBalance);
        available = btcBalance - parseFloat(amount);
        gasPrice = 1;
        gasLimit = 1;
        txCost = 0.001;
        $("#send_ether_to").attr("placeholder", "1GkYGJ8vmxT8JpEWJWFPUHgwYAAccapD2a");
    } else {
        $(".ethspend").val(ethBalance);
        available = ethBalance - amount - txCost;
    }

    if (bad(amount) || bad(gasLimit) || bad(gasPrice) || bad(amount)) {
        $(".ethspend").html(available.toFixed(6));
        $("#sendethbutton").prop("disabled", true);
        return
    }
    $("#ethtxfee").val(txCost.toFixed(6));
    $(".ethspend").html(available.toFixed(6));
    if (!usingBtc && !usingLtc) {
        var correctAddr = isEthAddress($("#send_ether_to").val());
    } else {
        var correctAddr = true;
    }
    if (correctAddr && available >= 0) {
        $("#sendethbutton").prop("disabled", false);
    } else {
        $("#sendethbutton").prop("disabled", true);
    }
}
