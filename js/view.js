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




$("#new_token_address").on("input", function() {
    var address = $("#new_token_address").val();
    console.log(address.length);
    if (address.length == 42) {
        QueryTokenContract(address);
    }
});



function QueryTokenContract(address) {
    var tmpToken = new ethers.Contract(address, TOKEN_ABI, configs.provider);
    tmpToken.balanceOf(configs.address).then(function(tokenBal) {
        $("#new_token_address").removeClass("is-invalid");
        $("#new_token_address").addClass("is-valid");

        tmpToken.symbol().then(function(sym) {
                $("#new_token_symbol").val(sym);
                $("#new_token_symbol").prop('readonly', true);

            tmpToken.decimals().then(function(dec) {
                $("#new_token_decimals").val(parseInt(dec));
                $("#new_token_decimals").prop('readonly', true);

                var trueBal = tokenBal * (0.1 ** parseInt(dec));
                $("#new_token_balance").val(trueBal);

                tmpToken.name().then(function(name) {
                    $("#new_token_alert").html("Correct Token for: "+name);
                    $("#new_token_name").val(name);
                });

            });

        }).catch(function (err) {
            $("#new_token_decimals").prop('readonly', false);
            $("#new_token_symbol").prop('readonly', false);
            $("#new_token_address").removeClass("is-valid");
            $("#new_token_address").addClass("is-invalid");
            $("#new_token_alert").html("Token has no Symbol");
        });;

    }).catch(function (err) {
        $("#new_token_decimals").prop('readonly', false);
        $("#new_token_symbol").prop('readonly', false);
        $("#new_token_address").removeClass("is-valid");
        $("#new_token_address").addClass("is-invalid");
        $("#new_token_alert").html("Incorrect ERC20 Token Address");
    });

}



function SaveNewToken() {
    var address = $("#new_token_address").val();
    var decimals = $("#new_token_decimals").val();
    var symbol = $("#new_token_symbol").val();
    var name = $("#new_token_name").val();
    var balance = $("#new_token_balance").val();
    $("#save_token_btn").prop("disabled", true);

    // store.set("saved_tokens", JSON.stringify(configs.savedTokens));

    configs.savedTokens = $.parseJSON(store.get("saved_tokens"));

    tk = {address: address, decimals: decimals, symbol: symbol, name: name, balance: balance};

    configs.savedTokens.push(tk);

    store.set("saved_tokens", JSON.stringify(configs.savedTokens));

    var tokenObj = "<div id=\"token_" + tk.symbol + "\" onclick=\"FocusOnToken('" + tk.address + "', " + tk.decimals + ", '" + tk.name + "', '" + tk.symbol + "')\" class=\"row token_obj\">" +
        "    <div class=\"col-12\">" +
        "        <h5>" + tk.name +
        "<span class=\"badge badge-secondary\">" + toNumber(tk.balance) + "</span></h5>" +
        "    </div>" +
        "</div>";
    $(tokenObj).insertAfter("#new_token_dialog_btn");
    $("#new_token_address").val('');
    $('#add_token_modal').modal('hide');
    $("#save_token_btn").prop("disabled", false);
    $("#new_token_alert").html("");
    $("#new_token_decimals").prop('readonly', false);
    $("#new_token_symbol").prop('readonly', false);
    $("#new_token_address").removeClass("is-valid");
    $("#new_token_address").removeClass("is-invalid");
}



function LoadSavedTokens() {
    console.log(configs.savedTokens);
    $.each(configs.savedTokens, function(k, tk) {
        var tokenObj = "<div id=\"token_" + tk.symbol + "\" onclick=\"FocusOnToken('" + tk.address + "', " + tk.decimals + ", '" + tk.name + "', '" + tk.symbol + "')\" class=\"row token_obj\">" +
            "    <div class=\"col-12\">" +
            "        <h5>" + tk.name +
            "<span class=\"badge badge-secondary\">" + toNumber(tk.balance) + "</span></h5>" +
            "    </div>" +
            "</div>";
        $(tokenObj).insertAfter("#new_token_dialog_btn");
    })
}






function TransactionFee(utxos) {
    var fee = 0;
    if (configs.coin=="BTC") {
        fee = (utxos.length) * 180 + 2 * 34 + 10;
    } else if (configs.coin=="LTC") {
        fee = (utxos.length) * 180 + 2 * 34 + 10;
    } else if (configs.coin=="LTCTEST") {
        fee = (utxos.length) * 180 + 2 * 34 + 10;
    } else if (configs.coin=="BTCTEST") {
        fee = (utxos.length) * 180 + 2 * 34 + 10;
    }

    if (configs.coin=="BTC" || configs.coin=="BTCTEST") {
        if (fee <= 37400) fee = 37400
    } else {
        if (fee <= 100000) fee = 100000
    }
    console.log("current fee: "+fee);
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
    return new Promise(function(resolve, reject) {
        var tx = new bitcoin.TransactionBuilder(configs.network);
        CryptoBalance(configs.address).then(function(bal) {

            console.log("tx bal: " + bal);

            LoadUTXOs(configs.address).then(function(utxos) {

                console.log(utxos);

                $.each(utxos, function (key, out) {
                    tx.addInput(out.txid, out.vout);
                });

                var transactionFee = TransactionFee(utxos);

                console.log("fee: " + transactionFee);
                var remaining = parseInt(bal) - parseInt(send_amount) - transactionFee;

                console.log("sending:   ", send_amount);
                console.log("remaining: ", remaining);
                console.log("to: ", to_address);
                console.log("my addr: ", configs.address);

                tx.addOutput(to_address, parseInt(send_amount));
                tx.addOutput(configs.address, parseInt(remaining));

                $.each(utxos, function (key, out) {
                    tx.sign(key, configs.wallet);
                });

                console.log(tx);

                var tx_hex = tx.build().toHex();

                resolve(tx_hex);

            }).catch(function(err) {
                console.error(err);
                ShowNotification(err);
                $("#sendethbutton").prop("disabled", false);
            });

        });

    });

}

function LoadUTXOs(address) {
    return new Promise(function(resolve, reject) {
        var api = configs.api + "/addr/" + address + "/utxo";
        $.get(api, function (utxos) {
            resolve(utxos)
        });
    });
}

function CopyAddress() {
    clipboardy.writeSync(configs.address);
    ShowNotification("Address Copied: " + configs.address);
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
    shell.openExternal('https://github.com/coinapp-io/desktop')
}

function OpenGithubReleases() {
    shell.openExternal('https://github.com/coinapp-io/desktop/releases')
}

function OpenHunterGithub() {
    shell.openExternal('https://github.com/hunterlong')
}

function OpenMyEtherWallet() {
    shell.openExternal('https://www.myetherwallet.com')
}

function OpenBlockchainTx(txid, coin) {
    var obj = {id: txid, symbol: coin};
    var url = TransactionURL(obj);
    shell.openExternal(url);
}


function FocusOnToken(token, decimals, name, symbol) {
    console.log("Logging Token: " + token);

    tokenContract = new ethers.Contract(token, TOKEN_ABI, configs.wallet);
    configs.tokenAddress = token;
    configs.token = tokenContract;
    configs.tokenDecimals = decimals;
    configs.tokenSymbol = symbol;

    tokenContract.balanceOf(configs.address).then(function(tokenBal) {
        configs.tokenBalance = parseInt(tokenBal) * (0.1 ** decimals);
        configs.bigTokenBalance = tokenBal;

        var split = parseFloat(configs.tokenBalance).toFixed(4).split(".");
        $("#token_bal").html(split[0] + ".<small>" + split[1] + "</small>");

    });

    $("#token_balance_area").removeClass("d-none");
    $("#send_token_area").removeClass("d-none");

    $("#token_balance_area").attr("class", "col-4 offset-2 coinBox");
    $("#crypto_balance_area").attr("class", "col-6 coinBox");
    $("#send_token_area").attr("class", "col-4 offset-2 text-center sendBtns");
    $("#send_crypto_area").attr("class", "col-6 text-center sendBtns");

    // UpdateBalance();
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
    if (isBitcoin()) {
        $("#token_balance_area").hide();
        $("#send_token_area").hide();
        $("#crypto_balance_area").attr("class", "col-md-12 coinBox");
        $("#send_crypto_area").attr("class", "col-md-12 text-center sendBtns");
        $("#tokens_available-tab").remove();
        $("#transaction_nav").attr("class", "nav-item col-12");
        $("#crypto_data").remove();
        $("#crypto_gas_limit").remove();
        $("#crypto_gas_price").remove();
    } else {
        $(".block_number").removeClass("d-none");
        OnEthereumBlock();
    }

    $("#sendethbutton").html("Send "+configs.coin);
    $("#crypto_modal_title").html('Send '+configs.coin);
    $("#cryptos_available").html("<u class=\"ethspend\">0.0</u> "+configs.coin+" Available");
    $("#send_ether_btn").html("Send "+configs.coin);
    $("#crypto_balance_area").html("<b id=\"ethbal\"></b> "+configs.coin);
    ChangeCryptoSymbol(configs.coin);

    var split = parseFloat(configs.balance).toFixed(4).split(".");
    $('#ethbal').html(split[0] + ".<small>" + split[1] + "</small>");

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


function UnlockBTC() {
    return new Promise(function(resolve, reject) {
        var key = $("#privatepass").val();
        myWallet = bitcoin.ECPair.fromWIF(key, configs.network);
        myAddress = myWallet.getAddress();
        configs.wallet = myWallet;
        configs.address = myAddress;
        configs.decimals = 8;
        $(".myaddress").html(myAddress);
        resolve(myWallet);
    });
}



function UnlockETH() {
    return new Promise(function(resolve, reject) {
        var key = $("#privatepass").val();
        if (key.substring(0, 2) !== '0x') {
            key = '0x' + key;
        }
        var provider = new ethers.providers.JsonRpcProvider(configs.api, configs.network);
        configs.provider = provider;
        var myWallet = new Wallet(key);
        myWallet.provider = provider;
        configs.wallet = myWallet;
        configs.address = myWallet.address;
        $(".myaddress").html(configs.address);
        resolve(myWallet);
    });
}



function isBitcoin() {
    var is = false;
    if (configs.coin=="LTC" || configs.coin=="BTC" || configs.coin=="BTCTEST" || configs.coin=="LTCTEST") {
        is = true;
    } else {
        is = false;
    }
    return is;
}



function toNumber(val) {
    var fixed = parseFloat(val).toFixed(6);
    return parseFloat(fixed.toString());
}





function UnlockWalletKeystore() {
    var password = $("#keystorewalletpass").val();

    if (password=="" || keyFile==undefined) return false;

    var buffer = fs.readFileSync(keyFile);
    var walletData = buffer.toString();

    if (password != '' && keyFile != '' && Wallet.isEncryptedWallet(walletData)) {

        Wallet.fromEncryptedWallet(walletData, password).then(function(wallet) {
            console.log("Opened Address: " + wallet.address);
            configs.coin = "ETH";
            configs.api = store.get("geth");
            configs.network = ethers.networks.mainnet;
            var provider = new ethers.providers.JsonRpcProvider(configs.api, configs.network);
            configs.provider = provider;
            var myWallet = wallet;
            myWallet.provider = provider;
            configs.wallet = myWallet;
            configs.address = myWallet.address;

            console.log(configs);

            LoadSavedTokens();

            UpdateBalance().then(function(balance) {
                tokenList = require('../js/tokens-eth.json');
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

        });
    } else {
        ShowNotification("Invalid Keystore JSON File");
    }
    $("#keystorewalletpass").val('');
}



function UnlockPrivateKey() {
        var coin = $( "#unlock_coin_type option:selected").val();
        var key = $("#privatepass").val();
        if (coin=="" || key == "") return false;

        $("#unlock_priv_key").html("<div class='loader'></div>");

        if (coin=="btc") {
            configs.network = bitcoin.networks.bitcoin;
            configs.api = store.get("btc");
        } else if (coin=="ltc") {
            configs.api = store.get("ltc");
            configs.network = bitcoin.networks.litecoin;
        } else if (coin=="btctest") {
            configs.api = store.get("btc");
            configs.network = bitcoin.networks.testnet;
            configs.isTestnet = true;
        } else if (coin=="ltctest") {
            configs.api = store.get("ltc");
            configs.network = bitcoin.networks.testnet;
            configs.isTestnet = true;
        } else if (coin=="eth") {
            configs.api = store.get("geth");
            configs.network = ethers.networks.mainnet;
        } else if (coin=="ropsten") {
            configs.api = store.get("geth");
            configs.network = ethers.networks.testnet;
            configs.isTestnet = true;
        }
        configs.coin = coin.toUpperCase();

        if (isBitcoin()) {
            UnlockBTC().then(function (r) {
                console.log(r);
                UpdateBalance().then(function (balance) {
                    console.log(balance);
                    LoadBitcoinTransactions().then(function (tsx) {
                        LoadUTXOs(configs.address).then(function(utxos) {
                            configs.utxos = utxos;
                        });
                        SuccessAccess();
                        RenderTransactions(configs.myTransactions, 0, 12);
                            // render trnsactions
                        });
                }).catch(function (err) {
                    $("#unlock_priv_key").html("Unlock");
                    ShowNotification(err);
                });
            }).catch(function (err) {
                $("#unlock_priv_key").html("Unlock");
                ShowNotification(err);
            });
            return false;

        } else {

            UnlockETH().then(function() {
                LoadSavedTokens();
                UpdateBalance().then(function(balance) {
                    tokenList = require('../js/tokens-eth.json');
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
            }).catch(function (err) {
                $("#unlock_priv_key").html("Unlock");
                ShowNotification(err.reason);
            });
        }
}



function BeginTokenLoading() {
    tokenWorker.postMessage({"address": configs.address, "tokens": tokenList});
}

var tkCount = 0;

tokenWorker.onmessage = function(e) {
    tkCount++

    if (tkCount >= tokenList.length) {
        console.log("hide now");
        $("#tokens_loading_msg").hide();
        $("#progress_token").hide();
    }

    $("#tokens_loading_msg").html("Loading Tokens (" + tkCount + "/" + tokenList.length + ")");
    var percent = (tkCount / tokenList.length) * 100;
    $("#progress_token_load").css("width", percent + "%");

    if (e.data.balance != 0) {

        var tokenObj = "<div id=\"token_" + e.data.symbol + "\" onclick=\"FocusOnToken('" + e.data.address + "', " + e.data.decimals + ", '" + e.data.name + "', '" + e.data.symbol + "')\" class=\"row token_obj\">\n" +
            "    <div class=\"col-12\">\n" +
            "        <h5>" + e.data.name +
            "<span class=\"badge badge-secondary\">" + parseFloat(e.data.balance).toFixed(6) + "</span></h5>\n" +
            "    </div>\n" +
            "</div>";
        $("#tokens_available").append(tokenObj);
        var data = {address: e.data.contract, symbol: e.data.symbol, decimals: e.data.decimals, name: e.data.name};
        configs.availableTokens.push(data);
        $("#tokens_count").html("(" + configs.availableTokens.length + ")");

    }

};


// function reject() {
//     $("#keystorejsonerror").html("Incorrect Password for Keystore Wallet");
//     $("#keystorejsonerror").show();
//     $("#keystorebtn").prop("disabled", false);
//     $("#keystorebtn").html("Open");
// }


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
        $(".ethavailable").html(parseFloat(configs.balance).toFixed(6));
        $(".token_spend").html(parseFloat(configs.tokenBalance).toFixed(6));
        $("#sendtokenbutton").prop("disabled", true);
        return
    }
    var availableTokens = configs.tokenBalance - amount;
    $(".token_spend").html(availableTokens.toFixed(6));
    var price = parseInt(gasPrice) * 0.000000001;
    var txCost = gasLimit * price;
    var available = configs.balance - txCost;
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

    if (configs.coin=="LTC" || configs.coin=="LTCTEST") {
        $(".ethspend").val(configs.balance);
        available = configs.balance - parseFloat(amount);
        gasPrice = 1;
        gasLimit = 1;
        txCost = 0.000374;
        $("#send_ether_to").attr("placeholder", "LKmC2Gda9LMAWWDYP6wqN2N8qKhnVzbgE5");
    } else if (configs.coin=="BTC" || configs.coin=="BTCTEST") {
        $(".ethspend").val(configs.balance);
        available = configs.balance - parseFloat(amount);
        gasPrice = 1;
        gasLimit = 1;
        txCost = 0.001;
        $("#send_ether_to").attr("placeholder", "1GkYGJ8vmxT8JpEWJWFPUHgwYAAccapD2a");
    } else {
        $(".ethspend").val(configs.balance);
        available = configs.balance - amount - txCost;
    }

    if (bad(amount) || bad(gasLimit) || bad(gasPrice) || bad(amount)) {
        $(".ethspend").html(available.toFixed(6));
        $("#sendethbutton").prop("disabled", true);
        return
    }
    $("#ethtxfee").val(txCost.toFixed(6));
    $(".ethspend").html(available.toFixed(6));
    if (configs.coin=="ETH" || configs.coin=="ROPSTEN") {
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
