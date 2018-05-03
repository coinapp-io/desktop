


function GetTokenBalance(contract, address, callback) {
    var api = "https://api.tokenbalance.com/balance/" + contract + "/" + address;
    $.ajax({
        url: api,
        type: "get",
        async: false,
        success: function (bal) {
            callback(bal)
        },
        error: function (data) {
            callback(bal)
        }
    });
}



function LoadBitcoinTransactions(address, coin) {
    return new Promise(function(resolve, reject) {
        var api = configs.api + "/txs/?address=" + configs.address;
        $.get(api, function (data) {
            btcTransactions = data;
            allTransactions = [];

            $.each(data.txs, function (key, val) {
                var total = val.valueOut;
                var confirms = val.confirmations;
                var fees = val.fees;
                var time = val.time;
                var txId = val.txid;
                var truVal = 0;
                var incoming = true;
                var inAddresses = [];

                $.each(val.vin, function (key, inn) {
                    inAddresses.push(inn.addr);
                });
                if ($.inArray(configs.address, inAddresses) !== -1) {
                    incoming = false;
                }

                $.each(val.vout, function (key, out) {
                    if (incoming) {
                        if ($.inArray(configs.address, out.scriptPubKey.addresses) !== -1) truVal += parseFloat(out.value);
                    } else {
                        if ($.inArray(configs.address, out.scriptPubKey.addresses) === -1) truVal += parseFloat(out.value);
                    }
                });

                data = {
                    id: txId,
                    time: time,
                    value: truVal,
                    in: incoming,
                    confirms: confirms,
                    symbol: configs.coin,
                    decimals: 8
                };
                allTransactions.push(data);
            });

            if (lastTransactions != undefined) {
                console.log("last: " + lastTransactions.length + " current: " + allTransactions.length);
            }

            if (lastTransactions != undefined && allTransactions.length != lastTransactions.length) {
                console.log(lastTransactions);
                console.log("last transaction length changed!!!");
                CheckNewTransactions(allTransactions, lastTransactions);
            }

            // if (callback) {
            //     callback(allTransactions);
            // } else {
            //     RenderTransactions(allTransactions, 0, 16);
            // }

            configs.myTransactions = allTransactions;

            resolve(allTransactions);

            lastTransactions = allTransactions;

        });
    });

}



function RenderTransactions(txs, start, end) {
    // $("#transactions_tab").html('');
    return new Promise(function(resolve, reject) {

        if (txs.length == 0) {
            $("#transactions_tab").html("No Transactions!");
        }

        var limitedTxs = txs.slice(start, end);

        $.each(limitedTxs, function (key, out) {

            if (out.in) {
                var thisClass = "transaction_box";
            } else {
                var thisClass = "transaction_box_neg";
            }
            if (out.confirms == 0) {
                thisClass += " pendingFlash";
            }

            if (out.value == 0) {
                thisClass = "transaction_box_misc";
                trueAmount = 0;
            }

            var txUrl = TransactionURL(out, out.symbol);

            if (out.confirms == 0) {
                var btn = "<button onclick=\"OpenURL('" + txUrl + "')\" type=\"button\" class=\"btn view_tx_btn float-left\">Pending</button>";
            } else {
                var btn = "<button onclick=\"OpenURL('" + txUrl + "')\" type=\"button\" class=\"btn view_tx_btn float-left\">View</button>";
            }

            var element = "tx_"+out.id;

            var html = "<div class=\"row " + thisClass + " fadeInEach\" id=\""+element+"\">\n" +
                "            <div class=\"col-12 mt-1 mb-1 small_txt text-center\"><b>" + out.id.substring(0, 32) + "...</b></div>\n" +
                "<div class=\"col-12\">" + btn + " <b class=\"float-right\">" + parseFloat(out.value).toFixed(4) + " " + out.symbol + "</b></div>" +
                "        </div>";
            $("#transactions_tab").append(html);
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


function AddPendingTransaction(hash, amount, coin, isRecieving=false) {
    var txUrl = TransactionURL(hash, coin);
    var design = "row transaction_box_neg pendingFlash";
    if (isRecieving) {
        var design = "row transaction_box pendingFlash";
    }
    var element = "tx_"+hash;
    var html = "<div class=\"row "+design+"\" id=\""+element+"\">" +
        "            <div class=\"col-12 mt-1 mb-1 small_txt text-center\"><b>"+hash.substring(0,32)+"...</b></div>" +
        "<div class=\"col-12\"><button onclick=\"OpenURL('"+txUrl+"')\" type=\"button\" class=\"btn view_tx_btn float-left\">Pending</button> <b class=\"float-right\">" + amount + " "+coin.toUpperCase()+"</b></div>" +
        "        </div>";
    $("#transactions_tab").prepend(html);
}



function TransactionURL(out, coin) {
    if (coin=="ETH") {
        return "https://etherscan.io/tx/"+out.id;
    } else if (coin=="BTC") {
        if (process.env.NODE_ENV=='test') {
            return "https://btctest.coinapp.io/tx/"+out.id;
        } else {
            return "https://blockchain.info/tx/"+out.id;
        }
    } else if (coin=="LTC") {
        if (process.env.NODE_ENV=='test') {
            return "https://ltctest.coinapp.io/tx/"+out.id;
        } else {
            return "https://live.blockcypher.com/ltc/tx/" + out.id;
        }
    }
}



function FindToken(address) {
    return $.grep(tokenList, function(e){ return e.address.toLowerCase() == address.toLowerCase(); })[0];
}




$('#left_tabs').on('scroll', function() {
    if($(this).scrollTop() + $(this).innerHeight()>=$(this)[0].scrollHeight - 10) {
        var nextStep = lastTrxScroll + 6;
        RenderTransactions(allTransactions, lastTrxScroll+1, nextStep)
    }
});





function LoadEthereumTransactions(addr) {
    return new Promise(function(resolve, reject) {
        var url = "http://api.etherscan.io/api?module=account&action=txlist&address=" + addr + "&startblock=0&endblock=99999999&sort=desc";
        $.get(url, function (data) {
            $.each(data.result, function (key, val) {
                var incoming = false;
                var symbol = "ETH";
                var txValue = val.value * (0.1 ** 18);
                var decimals = 18;
                if (val.to.toLowerCase() == addr.toLowerCase()) incoming = true;

                if (val.input != "0x") {
                    var method = val.input.slice(0, 10);

                    if (method == "0xa9059cbb") {

                        var tokenValues = ethers.utils.bigNumberify("0x" + val.input.slice(74, 138));
                        var tokensToAddress = ethers.utils.getAddress("0x" + val.input.slice(34, 74));

                        if (tokensToAddress == addr) incoming = true;

                        var thisTxToken = FindToken(val.to);
                        if (thisTxToken != undefined) {
                            symbol = thisTxToken.symbol;
                            decimals = thisTxToken.decimals;
                            txValue = tokenValues * (0.1 ** decimals);
                        }
                    }

                }

                data = {
                    id: val.hash,
                    time: val.timestamp,
                    value: txValue.toString(),
                    in: incoming,
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



function DecodeData(data) {
    var method = val.input.slice(0, 10);



}