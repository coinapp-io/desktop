function ParseTokenList() {
    if (alreadyCheckTokens) { return false }
    var count = 1;
    $.each(tokenList, function() {
        var name = this.name;
        var address = this.address;
        var decimals = this.decimals;
        var symbol = this.symbol;

        GetTokenBalance(address, myAddress, function(balance) {
            count+=1;
            $("#tokens_loading_msg").html("Loading Tokens ("+count+"/"+tokenList.length+")");
            var percent = (count / tokenList.length) * 100;
            $("#progress_token_load").css("width", percent+"%");
            if (count>=tokenList.length) {
                console.log("hide now");
                $("#tokens_loading_msg").hide();
                $("#progress_token").hide();
                alreadyCheckTokens = true;
                return false;
            }

            if (bad(balance)) {
                return
            }

            var tokenObj = "<div id=\"token_" + symbol + "\" onclick=\"FocusOnToken('" + address + "', " + decimals + ", '" + name + "', '" + symbol + "')\" class=\"row token_obj\">\n" +
                "    <div class=\"col-12\">\n" +
                "        <h5>" + name +
                "<span class=\"badge badge-secondary\">" + parseFloat(balance).toFixed(6) + "</span></h5>\n" +
                "    </div>\n" +
                "</div>";
            $("#tokens_available").append(tokenObj);
            var data = {address: address, symbol: symbol, decimals: decimals, name: name};
            availableTokens.push(data);
            $("#tokens_count").html("("+availableTokens.length+")");

        });

        console.log(count, tokenList.length);


    });

}


function LoadBitcoinTransactions(address, coin, callback) {
    var api = apiEndpoint+"/txs/?address="+address;
    $.get(api, function(data) {
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
            if($.inArray(myAddress, inAddresses) !== -1) {
                incoming = false;
            }

            $.each(val.vout, function (key, out) {
                if (incoming) {
                    if ($.inArray(myAddress, out.scriptPubKey.addresses) !== -1) truVal += parseFloat(out.value);
                } else {
                    if ($.inArray(myAddress, out.scriptPubKey.addresses) === -1) truVal += parseFloat(out.value);
                }
            });

            data = {id: txId, time: time, value: truVal, in: incoming, confirms: confirms};
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

        if (callback) {
            callback(allTransactions);
        } else {
            RenderTransactions(allTransactions, coin.toUpperCase(), 0);
        }

        lastTransactions = allTransactions;

    });

}



function RenderTransactions(txs, coin, decimals) {
    $("#transactions_tab").html('');

    if (txs.length==0) {
        $("#transactions_tab").html("No Transactions!");
    }

    $.each(txs, function (key, out) {
        var trueAmount = 0;
        var thisClass = "transaction_box";
        if (out.in) {
            thisClass = "transaction_box";
        } else {
            thisClass = "transaction_box_neg";
        }
        if (out.confirms==0) {
            thisClass += " pendingFlash";
        }
        if (decimals != 0) {
            trueAmount = (trueAmount * (Math.pow(0.1, decimals))).toFixed(6)
        } else {
            trueAmount = parseFloat(out.value).toFixed(6);
        }
        if (trueAmount==0) {
            thisClass = "transaction_box_misc";
            trueAmount = 0;
        }

        var txUrl = TransactionURL(out.id, coin);

        if (out.confirms == 0) {
            var btn = "<button onclick=\"OpenURL('"+txUrl+"')\" type=\"button\" class=\"btn view_tx_btn float-left\">Pending</button>";
        } else {
            var btn = "<button onclick=\"OpenURL('"+txUrl+"')\" type=\"button\" class=\"btn view_tx_btn float-left\">View</button>";
        }

        var html = "<div class=\"row "+thisClass+" fadeInEach\">\n" +
            "            <div class=\"col-12 mt-1 mb-1 small_txt text-center\"><b>"+out.id.substring(0,32)+"...</b></div>\n" +
            "<div class=\"col-12\">"+btn+" <b class=\"float-right\">" + trueAmount + " "+coin+"</b></div>" +
            "        </div>";
        $("#transactions_tab").append(html);
    });

    FadeInTransactions();
}



function FadeInTransactions() {
    $("#transactions_tab .fadeInEach").each(function(i) {
        $(this).delay(200 * i).fadeIn(500);
    });
}


function AddPendingTransaction(hash, amount, coin, isRecieving=false) {
    var txUrl = TransactionURL(hash, coin);
    var design = "row transaction_box_neg pendingFlash";
    if (isRecieving) {
        var design = "row transaction_box pendingFlash";
    }
    var html = "<div class=\"row "+design+"\">\n" +
        "            <div class=\"col-12 mt-1 mb-1 small_txt text-center\"><b>"+hash.substring(0,32)+"...</b></div>\n" +
        "<div class=\"col-12\"><button onclick=\"OpenURL('"+txUrl+"')\" type=\"button\" class=\"btn view_tx_btn float-left\">Pending</button> <b class=\"float-right\">" + amount + " "+coin.toUpperCase()+"</b></div>" +
        "        </div>";
    $("#transactions_tab").prepend(html);
}


function TransactionURL(tx, coin) {
    if (coin=="ETH") {
        return "https://etherscan.io/tx/"+tx;
    } else if (coin=="BTC") {
        if (process.env.NODE_ENV=='test') {
            return "https://btctest.coinapp.io/tx/"+tx;
        } else {
            return "https://blockchain.info/tx/"+tx;
        }
    } else if (coin=="LTC") {
        if (process.env.NODE_ENV=='test') {
            return "https://ltctest.coinapp.io/tx/"+tx;
        } else {
            return "https://live.blockcypher.com/ltc/tx/" + tx;
        }
    }
}


function LoadEthereumTransactions(addr) {
    var allTransactions = [];
    var url = "http://api.etherscan.io/api?module=account&action=txlist&address="+addr+"&startblock=0&endblock=99999999&sort=desc";
    $.get(url, function (data) {
        console.log(data);
        $.each(data.result, function (key, val) {
            var incoming = false;
            if (val.to==addr) incoming = true;
            data = {id: val.hash, time: val.timestamp, value: val.value, in: incoming};
            allTransactions.push(data);
        });
        RenderTransactions(allTransactions, "ETH", 18);
    });
}