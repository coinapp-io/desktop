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
    if(address.length == 42) {
        QueryTokenContract(address);
    }
});


$(".updateable_token_ether").on("input", UpdateTokenFees);

$(".updateable_ether").on("input change", UpdateEthFees);

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
                var trueBal = FormatDecimals(tokenBal, dec);
                $("#new_token_balance").val(trueBal);
                tmpToken.name().then(function(name) {
                    var coinicon = "<img class='mini_icon' src='"+CoinIcon(sym)+"'>";
                    $("#new_token_alert").html("Correct Token for: " + name+" "+coinicon);
                    $("#new_token_name").val(name);
                });
            });
        }).catch(function(err) {
            $("#new_token_decimals").prop('readonly', false);
            $("#new_token_symbol").prop('readonly', false);
            $("#new_token_address").removeClass("is-valid");
            $("#new_token_address").addClass("is-invalid");
            $("#new_token_alert").html("Token has no Symbol");
        });
    }).catch(function(err) {
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

    if (address.length != 42 || decimals=='' || symbol == '') {
        return false;
    }

    $("#save_token_btn").prop("disabled", true);
    // store.set("saved_tokens", JSON.stringify(configs.savedTokens));
    tk = {
        address: address,
        decimals: decimals,
        symbol: symbol,
        name: name,
        balance: balance
    };
    configs.savedTokens.push(tk);
    store.set("saved_tokens", JSON.stringify(configs.savedTokens));

    AddTokenDiv(tk.symbol, tk.address, tk.decimals, tk.name, tk.balance, true);

    $("#new_token_address").val('');
    $('#add_token_modal').modal('hide');
    $("#save_token_btn").prop("disabled", false);
    $("#new_token_alert").html("");
    $("#new_token_decimals").prop('readonly', false);
    $("#new_token_symbol").prop('readonly', false);
    $("#new_token_address").removeClass("is-valid");
    $("#new_token_address").removeClass("is-invalid");
}



function CloseSettings() {
    $(".settings_page").addClass("d-none");
}



function OpenSettings() {
    $(".transaction_view").addClass('d-none');
    $(".settings_page").removeClass("d-none");
}



function CoinIcon(coin) {
    switch (coin.toUpperCase()) {
        case "ETH": return "../images/icons/eth.png"
        case "BTC": return "../images/icons/btc.png"
        case "BTCTEST": return "../images/icons/btc.png"
        case "LTC": return "../images/icons/ltc.png"
        case "LTCTEST": return "../images/icons/ltc.png"
        case "OMG": return "../images/icons/omg.png"
        case "ZRX": return "../images/icons/zrx.png"
        case "SNT": return "../images/icons/snt.png"
        case "ENG": return "../images/icons/eng.png"
        case "WAX": return "../images/icons/wax.png"
        case "GMT": return "../images/icons/gmt.png"
        case "STORJ": return "../images/icons/storj.png"
        case "TRX": return "../images/icons/trx.png"
        case "CAT": return "../images/icons/cat.png"
        case "DNT": return "../images/icons/dnt.png"
        case "REP": return "../images/icons/rep.png"
        case "LISK": return "../images/icons/lisk.png"
        case "BNT": return "../images/icons/bnt.png"
        case "STEEM": return "../images/icons/steem.png"
        case "DTC": return "../images/icons/dtc.png"
        case "CVC": return "../images/icons/cvc.png"
        case "KIN": return "../images/icons/kin.png"
        case "VIU": return "../images/icons/viu.png"
        case "VEN": return "../images/icons/ven.png"
        case "BNB": return "../images/icons/bnb.png"
        case "SALT": return "../images/icons/salt.png"
        default: return "../images/icons/eth.png"
    }
}



function LoadSavedTokens() {
    console.log(configs.savedTokens);
    $.each(configs.savedTokens, function(k, tk) {
        AddTokenDiv(tk.symbol, tk.address, tk.decimals, tk.name, tk.balance, true);
    });
}

function QuickBTCFee(amount, price) {
    feeutil.BASE_SATOSHI_PER_BYTE = price;
    var total = 0;
    var usingUtxos = [];
    $.each(configs.utxos, function(k, utxo) {
        var sats = utxo.amount;
        if(total <= amount) {
            usingUtxos.push(utxo);
        }
        total += sats;
    });
    const satoshi = feeutil.p2pkh_tx_calc_fee(usingUtxos.length, 2);

    var amount = new BigNumber(satoshi);
    var pow = new BigNumber(0.1).pow(8)
    amount = amount.multipliedBy(pow);
    return amount.toString()
}

function TransactionFee(utxos) {
    feeutil.BASE_SATOSHI_PER_BYTE = 225;
    const satoshi = feeutil.p2pkh_tx_calc_fee(configs.utxos.length, 2);
    console.log(satoshi);
    var fee = 0;
    if(configs.coin == "BTC") {
        fee = (utxos.length) * 180 + 2 * 34 + 10;
    } else if(configs.coin == "LTC") {
        fee = (utxos.length) * 180 + 2 * 34 + 10;
    } else if(configs.coin == "LTCTEST") {
        fee = (utxos.length) * 180 + 2 * 34 + 10;
    } else if(configs.coin == "BTCTEST") {
        fee = (utxos.length) * 180 + 2 * 34 + 10;
    }
    console.log("Calculated fee: " + fee);
    if(configs.coin == "BTC") {
        if(fee <= 100000) fee = 100000
    } else if(configs.coin == "BTCTEST") {
        if(fee <= 5000000) fee = 5000000
    } else if(configs.coin == "LTC") {
        if(fee <= 100000) fee = 100000
    } else if(configs.coin == "LTCTEST") {
        if(fee <= 37400) fee = 37400
    }
    console.log("current fee: " + fee);
    return fee
}

function PendingBalance() {
    if(usingBtc) {
        return btcBalance
    } else if(usingLtc) {
        return ltcBalance
    } else {
        return ethBalance
    }
}

function SendCoins(to_address, send_amount, tranx_fee) {
    return new Promise(function(resolve, reject) {
        var tx = new bitcoin.TransactionBuilder(configs.network);
        CryptoBalance(configs.address).then(function(bal) {
            LoadUTXOs(configs.address).then(function(utxos) {
                $.each(utxos, function(key, out) {
                    tx.addInput(out.txid, out.vout);
                });
                // var transactionFee = QuickBTCFee(send_amount);
                console.log("fee input: " + tranx_fee);
                tranx_fee = FormatBigDecimals(tranx_fee, 8);
                console.log("fee input: " + tranx_fee);
                var remaining = parseInt(bal) - parseInt(send_amount) - tranx_fee;
                console.log("sending:   ", send_amount);
                console.log("remaining: ", remaining);
                console.log("to: ", to_address);
                console.log("my addr: ", configs.address);
                tx.addOutput(to_address, parseInt(send_amount));
                tx.addOutput(configs.address, parseInt(remaining));
                $.each(utxos, function(key, out) {
                    tx.sign(key, configs.wallet);
                });
                var tx_hex = tx.build().toHex();
                console.log("raw: " + tx_hex);
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
        $.get(api, function(utxos) {
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


function HideEthElements() {
    $(".eth_element").each(function() {
        $(this).remove();
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
    var obj = {
        id: txid,
        symbol: coin
    };
    var url = TransactionURL(obj);
    shell.openExternal(url);
}

function FocusOnToken(token, decimals, name, symbol) {
    console.log("Focusing on Token: " + token);
    tokenContract = new ethers.Contract(token, TOKEN_ABI, configs.wallet);
    configs.tokenAddress = token;
    configs.token = tokenContract;
    configs.tokenDecimals = decimals;
    configs.tokenSymbol = symbol;
    tokenContract.balanceOf(configs.address).then(function(tokenBal) {
        var bal = new BigNumber(tokenBal.toString());
        var pow = new BigNumber(0.1).pow(decimals);
        bal = bal.multipliedBy(pow);
        configs.tokenBalance = bal.toString();
        configs.bigTokenBalance = tokenBal;
        // var split = configs.tokenBalance.split(".");
        // if (!split[1]) {
        //     split[1] = "000";
        // }
        // $("#token_bal").html(split[0] + ".<small>" + split[1] + "</small>");
        //

        UpdateTokenBalanceText(configs.tokenBalance);

    });
    $(".transaction_view").addClass('d-none');
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

// converts 123.456 to 123456000
function FormatBigDecimals(amount, decimals) {
    return ethers.utils.parseUnits(amount.toString(), parseInt(decimals))
}


// converts 12345670000 to 1234.567
function FormatDecimals(amount, decimals) {
    return ethers.utils.formatUnits(amount.toString(), parseInt(decimals))
}


$(".setting_change").change(function(e) {
    var id = $(this).data("id");
    var element = $("#"+id);
    element.prop("readonly", false);

    console.log($(this).val(), "#"+id);

    switch ($(this).val()) {
        case "localhostETH":
            element.val("http://127.0.0.1:8545");
            element.prop("readonly", true);
            break;
        case "coinappETH":
            element.val("https://eth.coinapp.io");
            element.prop("readonly", true);
            break;
        case "coinappROPSTEN":
            element.val("https://ropsten.coinapp.io");
            element.prop("readonly", true);
            break;
        case "etherscan":
            element.val("https://api.etherscan.io/api");
            element.prop("readonly", true);
            break;
        case "coinappBTC":
            element.val("https://btc.coinapp.io/api");
            element.prop("readonly", true);
            break;
        case "coinappBTCTEST":
            element.val("https://btctest.coinapp.io/api");
            element.prop("readonly", true);
            break;
        case "coinappLTC":
            element.val("https://ltc.coinapp.io/api");
            element.prop("readonly", true);
            break;
        case "coinappLTCTEST":
            element.val("https://ltctest.coinapp.io/api");
            element.prop("readonly", true);
            break;
    }
});


$("#hdpath_coin").change(function() {
    coin = $('#hdpath_coin option:selected').val();
    if(coin == "eth") {
        usingBtc = false;
        usingLtc = false;
    } else if(coin == "btc") {
        usingBtc = true;
        usingLtc = false;
    } else if(coin == "ltc") {
        usingBtc = false;
        usingLtc = true;
    }
    UpdatePath(ParsePath());
});

function ParsePath() {
    path = $('#hdpath_options option:selected').val();
    index = $("#hd_path_index").val();
    return path + index;
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
    if(isBitcoin()) {
        $("#token_balance_area").hide();
        $("#send_token_area").hide();
        $("#crypto_balance_area").attr("class", "col-md-12 coinBox");
        $("#send_crypto_area").attr("class", "col-md-12 text-center sendBtns");
        $("#tokens_available-tab").remove();
        $("#transaction_nav").attr("class", "nav-item col-12");
        $("#crypto_data").remove();
        $("#crypto_gas_limit").remove();
        $("#crypto_gas_price").remove();
        DefaultTxFees();
        // $("#ethtxfee").prop("readonly", false);
        $(".block_number").removeClass("d-none");
        OnBitcoinBlock();

        HideEthElements();

    } else {
        $(".block_number").removeClass("d-none");
        OnEthereumBlock();
    }
    ChangeInitText(configs.address, "#ffffff");
    // $("#sendethbutton").html("Send " + configs.coin);
    $("#crypto_modal_title").html('Send ' + configs.coin);
    $("#cryptos_available").html("<u onclick=\"UseFullBalance()\" class=\"ethspend\">0.0</u> " + configs.coin + " Available");
    $("#send_ether_btn").html("Send " + configs.coin);
    $("#crypto_balance_area").html("<b id=\"ethbal\"></b> " + configs.coin);
    ChangeCryptoSymbol(configs.coin);
    var split = parseFloat(configs.balance).toFixed(4).split(".");
    $('#ethbal').html(split[0] + ".<small>" + split[1] + "</small>");
    $("#access_container").hide();
    $("#token_container").removeAttr("hidden");
    $(".tokens_list").removeAttr("hidden");
    $(".main-container").css("left", "220px");
    $(".main-container").css("width", "620px");
    $(".settings_icon").show();
    $("#export_functions_tab").removeClass("disabled");
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

function ShowNotification(text, time = 2500) {
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
    if(coin == "btc") {
        if(process.env.NODE_ENV == 'test') {
            coinNetwork = bitcoin.networks.testnet;
        } else {
            coinNetwork = bitcoin.networks.bitcoin;
        }
    } else if(coin == "ltc") {
        if(process.env.NODE_ENV == 'test') {
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
        const { address } = bitcoin.payments.p2pkh({ network: configs.network, pubkey: myWallet.publicKey })
        console.log(address);
        myAddress = address;
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
        if(key.substring(0, 2) !== '0x') {
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
    if(configs.coin == "LTC" || configs.coin == "BTC" || configs.coin == "BTCTEST" || configs.coin == "LTCTEST") {
        is = true;
    } else {
        is = false;
    }
    return is;
}

function toNumber(val) {
    var fixed = parseFloat(val).toFixed(8);
    return parseFloat(fixed.toString());
}


function toBigNumber(val) {
    return new BigNumber(val.toString());
}


function UnlockWalletKeystoreForm() {
    var keyFile = $("#keystore_file").val();
    var password = $("#keystorewalletpass").val();
    if(password == "" || keyFile == undefined) return false;

    UnlockWalletKeystore(keyFile[0].files[0].path, password).then(function(wallet) {
        console.log("Opened Address: " + wallet.address);
        configs.coin = "ETH";
        configs.api = store.get("geth");
        configs.network = ethers.networks.testnet;
        var provider = new ethers.providers.JsonRpcProvider(configs.api, configs.network);
        configs.provider = provider;
        var myWallet = wallet;
        myWallet.provider = provider;
        configs.wallet = myWallet;
        configs.address = myWallet.address;
        $(".myaddress").html(configs.address);
        LoadSavedTokens();
        UpdateBalance().then(function (balance) {
            tokenList = require('./tokens-eth.json');
            LoadEthereumTransactions(configs.address).then(function (tsx) {
                SuccessAccess();
                SaveTransactions(configs.address);
                RenderTransactions(configs.myTransactions, 0, 12).then(function (t) {
                    BeginTokenLoading();
                    // render trnsactions
                });
            }).catch(function (err) {
                ShowNotification(err);
            });
        });
    });
    $("#keystorewalletpass").val('');
}



function UseFullBalance() {
    $("#send_ether_amount").val(0);
    var fee = $("#ethtxfee").val();
    var max = new BigNumber(configs.balance.toString()).minus(fee);
    $("#send_ether_amount").val(max.toString());
    UpdateEthFees();
}


function UseFullTokenBalance() {
    var max = new BigNumber(configs.tokenBalance.toString());
    $("#send_amount_token").val(max.toString());
    UpdateTokenFees();
}


function OpenQRCodeAddress(address="") {
    if (address=="") address = configs.address;
    QRCode.toDataURL(address, function (err, url) {
        $('#qrcode_address').modal('show');
        $("#qr_code_data").html(address);
        $("#qrcode_img").attr("src", url);
    });
}



function UnlockPrivateKey() {
    var coin = $("#unlock_coin_type option:selected").val();
    var key = $("#privatepass").val();
    if(coin == "" || key == "") return false;
    $("#unlock_priv_key").html("<div class='loader'></div>");
    if(coin == "btc") {
        configs.network = networks.bitcoin;
        configs.api = store.get("btc");
    } else if(coin == "ltc") {
        configs.api = store.get("ltc");
        configs.network = networks.litecoin;
    } else if(coin == "btctest") {
        configs.api = store.get("btc");
        configs.network = networks.testnet;
        configs.isTestnet = true;
    } else if(coin == "ltctest") {
        configs.api = store.get("ltc");
        configs.network = networks.testnet;
        configs.isTestnet = true;
    } else if(coin == "eth") {
        configs.api = store.get("geth");
        configs.network = ethers.networks.mainnet;
    } else if(coin == "ropsten") {
        configs.api = store.get("geth");
        configs.network = ethers.networks.testnet;
        configs.isTestnet = true;
    }
    configs.coin = coin.toUpperCase();
    if(isBitcoin()) {
        UnlockBTC().then(function(r) {
            SuccessAccess();
            UpdateBalance().then(function(balance) {
                DownloadAllBitcoinTransactions(configs.address).then(function(tsx) {
                    configs.transactions = tsx.transactions;
                    configs.myTransactions = tsx.myTransactions;
                    RenderTransactions(tsx.myTransactions, 0, 12);
                    ChangeSecondText("Balance: "+parseFloat(configs.balance).toFixed(4)+" "+configs.coin);
                    LoadUTXOs(configs.address).then(function(utxos) {
                        configs.utxos = utxos;
                    });
                });
            }).catch(function(err) {
                configs = {};
                $("#unlock_priv_key").html("Unlock");
                ShowNotification("Can't fetch balance from API URL!\n" + err);
            });
        }).catch(function(err) {
            configs = {};
            $("#unlock_priv_key").html("Unlock");
            ShowNotification(err);
        });
        return false;
    } else {
        UnlockETH().then(function() {
            LoadSavedTokens();
            UpdateBalance().then(function(balance) {
                tokenList = require('../../app/js/tokens-eth.json');
                LoadEthereumTransactions(configs.address).then(function(tsx) {
                    SuccessAccess();
                    RenderTransactions(configs.myTransactions, 0, 12).then(function(t) {
                        BeginTokenLoading();
                        ChangeSecondText("Balance: "+parseFloat(configs.balance).toFixed(4)+" "+configs.coin);
                        // render trnsactions
                    });
                }).catch(function(err) {
                    ShowNotification(err);
                });
            });
        }).catch(function(err) {
            $("#unlock_priv_key").html("Unlock");
            ShowNotification(err.reason);
        });
    }
}





function ExportEthereumKeystore() {
    var password = $("#keystore_pass").val();
    dialog.showSaveDialog({defaultPath: configs.address.substring(0, 10)+'-keystore.json'},function (fileName) {
        configs.wallet.encrypt(password).then(function(data) {
            var stream = fs.createWriteStream(fileName);
            stream.once('open', function(fd) {
                stream.write(data);
                stream.end();
            });
        });
    });
    return false;
}





function DeleteToken(address) {
    var newList = [];
    $.each(configs.savedTokens, function (k, tk) {
        if (tk.address != address) {
            newList.push(tk);
        }
    });
    var tokenObj = $("#token_"+address);
    tokenObj.slideUp('fast', function() {
        tokenObj.remove();
    });
    console.log(newList);
    configs.savedTokens = newList;
    store.set("saved_tokens", JSON.stringify(configs.savedTokens));
    return newList
}


function AddTokenDiv(symbol, address, decimals, name, balance, after) {
    var closeButton = "";
    if (after) {
        console.log(symbol + " has close");
        closeButton = "<button type=\"button\" id=\"delete_token\" onclick=\"DeleteToken('" + address + "');\" class=\"close\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>";
    }
    var tokenObj = "<div id=\"token_" + address + "\" onclick=\"FocusOnToken('" + address + "', " + decimals + ", '" + name + "', '" + symbol + "')\" class=\"row token_obj\">" +
        "<div class=\"col-12\"><img src=\""+CoinIcon(symbol)+"\"><h5 class=\"text-truncate\">" + name + "<span>"+toNumber(balance) + "</span>" +
        "</h5></div>"+closeButton+"</div>";

    if (after) {
        $(tokenObj).insertAfter("#new_token_dialog_btn");
    } else {
        $("#tokens_available").append(tokenObj);
    }
}




function BeginTokenLoading() {
    // var available = store.get('available_tokens');
    // if (available) {
    //     configs.availableTokens = JSON.parse(available);
    //     console.log("loaded traxs", configs.availableTokens);
    // } else {
    //     available = [];
    // }
    available = [];
    tokenWorker.postMessage({
        "address": configs.address,
        "tokens": tokenList,
        "available": available,
    });
}



function SaveAvailableTokens() {
    console.log(configs.availableTokens);
    store.set('available_tokens', JSON.stringify(configs.availableTokens));
}



var tkCount = 0;
tokenWorker.onmessage = function(e) {
    tkCount++
    if(tkCount >= tokenList.length) {
        console.log("All Token Balances loaded");
        $("#tokens_loading_msg").hide();
        $("#progress_token").hide();
        SaveAvailableTokens();
    }
    $("#tokens_loading_msg").html("Loading Tokens (" + tkCount + "/" + tokenList.length + ")");
    var percent = (tkCount / tokenList.length) * 100;
    $("#progress_token_load").css("width", percent + "%");
    if(e.data.balance != 0) {

        console.log(e.data.symbol+ "  has "+e.data.balance);

        var data = {
            address: e.data.address,
            symbol: e.data.symbol,
            decimals: e.data.decimals,
            name: e.data.name,
            balance: e.data.balance
        };
        configs.availableTokens.push(data);

        AddTokenDiv(e.data.symbol, e.data.address, e.data.decimals, e.data.name, e.data.balance, false);

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
        if(fileNames === undefined) return;
        keyFile = fileNames[0];
        console.log(keyFile);
        $("#keystore_file").val(keyFile);
    });
}

function ConfirmButton(elem) {
    $(elem).html("CONFIRM");
    $(elem).attr("class", "btn btn-success")
}

function UpdateTokenFees() {
    var amount = $("#send_amount_token").val();
    var gasLimit = $("#tokengaslimit").val();
    var gasPrice = $("#tokengasprice").val();
    var fee = CalculateTXFee(gasLimit, gasPrice);
    var availableTokens = new BigNumber(configs.tokenBalance);
    if(amount<0|| bad(gasLimit) || bad(gasPrice)) {
        $(".ethavailable").html(configs.balance.toString());
        $(".token_spend").html(configs.tokenBalance.toString());
        $("#sendtokenbutton").prop("disabled", true);
        return
    }
    availableTokens = availableTokens.minus(amount);
    $(".token_spend").html(availableTokens.toString());
    var available = new BigNumber(configs.balance.toString()).minus(fee);
    $("#tokentxfee").val(fee.toString());
    $(".ethavailable").html(available.toString());
    var correctAddr = isEthAddress($("#send_to_token").val());
    if(correctAddr && availableTokens >= 0 && available >= 0) {
        $("#sendtokenbutton").prop("disabled", false);
    } else {
        $("#sendtokenbutton").prop("disabled", true);
    }
}



function CalculateTXFee(limit, price) {
    var price = new BigNumber(price).multipliedBy("0.000000001");
    var amount = new BigNumber(limit).multipliedBy(price);
    return amount;
}



function UpdateEthFees() {
    var toAddress = $("#send_ether_to").val();
    var amount = parseFloat($("#send_ether_amount").val());
    var gasLimit = parseInt($("#ethgaslimit").val());
    var gasPrice = parseInt($("#ethgasprice").val());
    var bytePrice = parseInt($("#btc_byte_price").val());
    var txCost = CalculateTXFee(gasLimit, gasPrice);
    var available;
    $(".ethspend").val(configs.balance.toString());
    $("#sendethbutton").prop("disabled", true);
    if(configs.coin == "LTC" || configs.coin == "LTCTEST") {
        $("#btc_byte_price").parent().removeClass("d-none");
        gasPrice = 1;
        gasLimit = 1;
        txCost = QuickBTCFee(parseFloat(amount), bytePrice);
        available = new BigNumber(configs.balance.toString()).minus(amount).minus(txCost);
        $("#send_ether_to").attr("placeholder", "LKmC2Gda9LMAWWDYP6wqN2N8qKhnVzbgE5");
    } else if(configs.coin == "BTC" || configs.coin == "BTCTEST") {
        $("#btc_byte_price").parent().removeClass("d-none");
        gasPrice = 1;
        gasLimit = 1;
        txCost = QuickBTCFee(parseFloat(amount), bytePrice);
        available = new BigNumber(configs.balance.toString()).minus(amount).minus(txCost);
        $("#send_ether_to").attr("placeholder", "1GkYGJ8vmxT8JpEWJWFPUHgwYAAccapD2a");
    } else {
        available = new BigNumber(configs.balance.toString()).minus(amount).minus(txCost);
    }
    if(toAddress=='' || amount < 0 || bad(gasLimit) || bad(gasPrice)) {
        $(".ethspend").html(available.toString());
        $("#sendethbutton").prop("disabled", true);
        return false;
    }
    $("#ethtxfee").val(txCost.toString());
    $(".ethspend").html(available.toString());
    if(configs.coin == "ETH" || configs.coin == "ROPSTEN") {
        var correctAddr = isEthAddress($("#send_ether_to").val());
    } else {
        var correctAddr = true;
    }

    console.log(available.toString());

    if(correctAddr && available >= 0) {
        $("#sendethbutton").prop("disabled", false);
    } else {
        $("#sendethbutton").prop("disabled", true);
    }
}