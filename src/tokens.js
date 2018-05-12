function GetTokenBalance(contract, address) {
    return new Promise(function(resolve, reject) {
        if(configs.isTestnet) {
            var api = "https://test.tokenbalance.com/balance/" + contract + "/" + address;
        } else {
            var api = "https://api.tokenbalance.com/balance/" + contract + "/" + address;
        }
        $.ajax({
            url: api,
            type: "get",
            async: false,
            success: function(bal) {
                resolve(bal)
            },
            error: function(data) {
                reject(data)
            }
        });
    });
}




function DownloadTransactionPage(address, page){
    return new Promise(function(resolve, reject) {
        var api = configs.api + "/txs/?address=" + address + "&pageNum=" + page;
        $.get(api, function (data) {
            resolve(data);
        });
    });
}



function DownloadAllBitcoinTransactions(address){
    return new Promise(function(resolve, reject) {
        var transactions = [];
        var myTransactions = [];
        DownloadTransactionPage(address, 0).then(function(tranxs) {
            $.each(tranxs.txs, function(k, v) {
                transactions.push(v);
                var obj = TransactionToObject(v);
                myTransactions.push(obj);
            });
            for (i=1;i<=tranxs.pagesTotal;i++) {
                DownloadTransactionPage(address, i).then(function(txdata) {
                    $.each(txdata.txs, function(k, v) {
                        transactions.push(v);
                        var obj = TransactionToObject(v);
                        myTransactions.push(obj);
                    });
                });
            }
            var out = {myTransactions: myTransactions, transactions: transactions};
            resolve(out);
        });
    });
}





function TransactionToObject(val) {
    var total = val.valueOut;
    var confirms = val.confirmations;
    var fees = val.fees;
    var time = val.time;
    var txId = val.txid;
    var truVal = 0;
    var incoming = true;
    var inAddresses = [];
    $.each(val.vin, function(key, inn) {
        inAddresses.push(inn.addr);
    });
    if($.inArray(configs.address, inAddresses) !== -1) {
        incoming = false;
    }
    $.each(val.vout, function(key, out) {
        if(incoming) {
            if($.inArray(configs.address, out.scriptPubKey.addresses) !== -1) truVal += parseFloat(out.value);
        } else {
            if($.inArray(configs.address, out.scriptPubKey.addresses) === -1) truVal += parseFloat(out.value);
        }
    });
    data = {
        id: txId,
        time: time,
        value: truVal,
        in : incoming,
        confirms: confirms,
        symbol: configs.coin,
        decimals: 8
    };
    return data;
}





function LoadBitcoinTransactions(address, coin) {
    return new Promise(function(resolve, reject) {
        var allTransactions = [];
        DownloadAllBitcoinTransactions(address).then(function(trxs) {
            configs.transactions = trxs;
            console.log("redneiring btc transactions: "+trxs.length);
            $.each(trxs, function(key, val) {
                // console.log(val);
                // var total = val.valueOut;
                // var confirms = val.confirmations;
                // var fees = val.fees;
                // var time = val.time;
                // var txId = val.txid;
                // var truVal = 0;
                // var incoming = true;
                // var inAddresses = [];
                // $.each(val.vin, function(key, inn) {
                //     inAddresses.push(inn.addr);
                // });
                // if($.inArray(configs.address, inAddresses) !== -1) {
                //     incoming = false;
                // }
                // $.each(val.vout, function(key, out) {
                //     if(incoming) {
                //         if($.inArray(configs.address, out.scriptPubKey.addresses) !== -1) truVal += parseFloat(out.value);
                //     } else {
                //         if($.inArray(configs.address, out.scriptPubKey.addresses) === -1) truVal += parseFloat(out.value);
                //     }
                // });
                // data = {
                //     id: txId,
                //     time: time,
                //     value: truVal,
                //     in : incoming,
                //     confirms: confirms,
                //     symbol: configs.coin,
                //     decimals: 8
                // };
                // allTransactions.push(data);
            });
            // if(lastTransactions != undefined) {
            //     console.log("last: " + lastTransactions.length + " current: " + allTransactions.length);
            // }
            // if(lastTransactions != undefined && allTransactions.length != lastTransactions.length) {
            //     console.log(lastTransactions);
            //     console.log("last transaction length changed!!!");
            //     CheckNewTransactions(allTransactions, lastTransactions);
            // }
            // configs.myTransactions = allTransactions;
            // lastTransactions = allTransactions;
            resolve(allTransactions);
        });
    });
}



function AddTransaction(out) {
    if(out.in) {
        var thisClass = "transaction_box";
    } else {
        var thisClass = "transaction_box_neg";
    }
    if(out.confirms == 0) {
        thisClass += " pendingFlash";
    }
    if(out.value == 0) {
        thisClass = "transaction_box_misc";
        trueAmount = 0;
    }
    var txUrl = TransactionURL(out);
    if(out.confirms == 0) {
        var btn = "<button onclick=\"ViewTransaction('" + out.id + "')\" type=\"button\" class=\"btn view_tx_btn float-left\">Pending</button>";
    } else {
        var btn = "<button onclick=\"ViewTransaction('" + out.id + "')\" type=\"button\" class=\"btn view_tx_btn float-left\">View</button>";
    }

    var element = "tx_" + out.id;
    var html = "<div class=\"row " + thisClass + " fadeInEach\" id=\"" + element + "\">\n" + "            <div class=\"col-12 mt-1 mb-1 small_txt text-center\"><i>" + out.id.substring(0, 32) + "...</i></div>\n" + "<div class=\"col-12\">" + btn + " <b class=\"float-right\">" + toNumber(out.value) + " " + out.symbol + "<img src=\""+CoinIcon(out.symbol)+"\"></b></div>" + "        </div>";
    $("#transactions_tab").append(html);
}



function SaveTransactions(address) {
    var storeVar = address+"_txs";
    store.set(storeVar, JSON.stringify(configs.transactions))
}


function RenderTransactions(txs, start, end) {
    // $("#transactions_tab").html('');
    return new Promise(function(resolve, reject) {
        if(txs.length == 0) {
            $("#transactions_tab").html("No Transactions!");
        }
        var limitedTxs = txs.slice(start, end);
        $.each(limitedTxs, function(key, out) {
            AddTransaction(out);
        });
        lastTrxScroll = end;
        FadeInTransactions();
        resolve(limitedTxs);
    });
}

function FadeInTransactions() {
    $("#transactions_tab .fadeInEach").each(function(i) {
        $(this).delay(100 * i).fadeIn(300, function() {
            $(this).removeClass("fadeInEach");
        });
    });
}

function AddPendingTransaction(hash, amount, coin, isRecieving = false, pending = true) {
    var obj = {
        id: hash,
        symbol: coin
    };
    var btnText = "View";
    var txUrl = TransactionURL(obj);
    var design = "row transaction_box_neg";
    if(isRecieving) {
        var design = "row transaction_box";
    }
    if (pending) {
        design = design + " pendingFlash";
        btnText = "Pending"
    }
    var element = "tx_" + hash;
    var coinicon = "<img class='mini_icon' src='"+CoinIcon(coin)+"'>";
    var html = "<div class=\"row " + design + "\" id=\"" + element + "\"><div class=\"col-12 mt-1 mb-1 small_txt text-center\"><i>" + hash.substring(0, 32) + "...</i></div>" + "<div class=\"col-12\"><button onclick=\"ViewTransaction('" + hash + "')\" type=\"button\" class=\"btn view_tx_btn float-left\">"+btnText+"</button> <b class=\"float-right\">" + amount + " " + coin.toUpperCase() + "</b>"+coinicon+"</div>" + "        </div>";
    $("#transactions_tab").prepend(html);
}

function TransactionURL(out, coin) {
    if(out.symbol == "ETH" && !configs.isTestnet) {
        return "https://etherscan.io/tx/" + out.id;
    } else if(out.symbol == "ETH" && configs.isTestnet) {
        return "https://ropsten.etherscan.io/tx/" + out.id;
    } else if(out.symbol == "BTC") {
        return "https://blockchain.info/tx/" + out.id;
    } else if(out.symbol == "BTCTEST") {
        return "https://btctest.coinapp.io/tx/" + out.id;
    } else if(out.symbol == "LTCTEST") {
        return "https://ltctest.coinapp.io/tx/" + out.id;
    } else if(out.symbol == "LTC") {
        return "https://live.blockcypher.com/ltc/tx/" + out.id;
    } else {
        return "https://etherscan.io/tx/" + out.id;
    }
}

function FindToken(address) {
    return $.grep(tokenList, function(e) {
        return e.address.toLowerCase() == address.toLowerCase();
    })[0];
}
$('#left_tabs').on('scroll', function() {
    if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight - 10) {
        var nextStep = lastTrxScroll + 6;
        if (lastTrxScroll > configs.myTransactions.length) {
            return false;
        }
        console.log("rendering transactions", lastTrxScroll+1, nextStep, "out of: ", configs.myTransactions.length);
        RenderTransactions(configs.myTransactions, lastTrxScroll + 1, nextStep)
    }
});

function LoadEthereumTransactions(addr) {
    return new Promise(function(resolve, reject) {
        if(configs.coin == "ETH") {
            var url = "http://api.etherscan.io/api?module=account&action=txlist&address=" + addr + "&startblock=0&endblock=99999999&sort=desc";
        } else if(configs.coin == "ROPSTEN") {
            var url = "http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=" + addr + "&startblock=0&endblock=99999999&sort=desc";
        }
        $.get(url, function(data) {
            configs.transactions = data.result;
            $.each(data.result, function(key, val) {
                var incoming = false;
                var symbol = "ETH";
                var txValue = val.value * (0.1 ** 18);
                var decimals = 18;
                if(val.to.toLowerCase() == addr.toLowerCase()) incoming = true;
                if(val.input != "0x" && val.input!=undefined) {

                    var method = GetDataMethod(val.input);
                    if(method == "transfer") {
                        var transfer = DecodeData(val.input);
                        if(transfer.to == addr) incoming = true;
                        var thisTxToken = FindToken(val.to);
                        if(thisTxToken != undefined) {
                            symbol = thisTxToken.symbol;
                            decimals = thisTxToken.decimals;
                            txValue = transfer.value * (0.1 ** decimals);
                        }
                    }
                }
                data = {
                    id: val.hash,
                    time: val.timestamp,
                    value: txValue.toString(),
                    in : incoming,
                    symbol: symbol,
                    decimals: decimals
                };
                allTransactions.push(data);
            });
            configs.myTransactions = allTransactions;
            resolve(allTransactions);
            // RenderTransactions(allTransactions, 0, 16);
        });
    });
}


function GetDataMethod(data) {
    var value;
    if (data.length<138) value = "eth";
    switch (data.slice(0, 10)) {
        case "0xa9059cbb":
            value = "transfer";
            break;
    }
    return value;
}

function DecodeData(data) {
    var method = GetDataMethod(data);
    if(method == "transfer") {
        var tokenValues = ethers.utils.bigNumberify("0x" + data.slice(74, 138));
        var tokensToAddress = ethers.utils.getAddress("0x" + data.slice(34, 74));
        var data = {method: method, to: tokensToAddress, value: tokenValues};
        return data
    }
}