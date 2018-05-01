
function GetTokenBalance(contract, wallet, callback) {
    if (process.env.NODE_ENV=='test') {
        var api = "https://api.tokenbalance.com/token/" + contract + "/" + wallet;
    } else {
        var api = "https://api.tokenbalance.com/token/" + contract + "/" + wallet;
    }
    $.get(api, function(bal, status) {
        var balance = bal.balance;
        callback(balance);
    });
}



function CryptoBalance(address, callback) {
    var api = apiEndpoint+"/addr/"+address+"/balance";
    $.get(api, function(bal, status) {
        ltcBalance = parseInt(bal) * 0.00000001;
        btcBalance = ltcBalance;

        var pendingapi = apiEndpoint+"/addr/"+address+"/unconfirmedBalance";
        $.get(pendingapi, function(pendBal, status) {
            pendBal = parseInt(pendBal) * 0.00000001;

            if (pendBal === 0) {
                $("#pending_amount").attr("class", "d-none");
            } else if (pendBal > 0) {
                $("#pending_amount").attr("class", "col-12 text-center text-success");
            } else {
                $("#pending_amount").attr("class", "col-12 text-center text-danger");
            }
            $("#pending_amount").html(pendBal.toFixed(6)+ " Pending");

            if (pendBal < 0) {
                btcBalance = btcBalance + pendBal;
            }

            splits = btcBalance.toString().split(".");
            $('#ethbal').html(splits[0] + ".<small>" + splits[1].substring(0,4) + "</small>");

            if (pendingBalance != undefined && pendingBalance != pendBal) {
                console.log("last balances changed!!!");
                NotifyPendingTransactions(pendBal);
            }

            lastBalance = btcBalance;
            pendingBalance = pendBal;

            if (callback) callback(bal);
        });

    });

}



function NotifyPendingTransactions(pending) {
    LoadBitcoinTransactions(myAddress, CryptoName(), function(txs) {
        $.each(txs, function (key, tx) {
            if (tx.confirms == 0){
                if (pending > 0) {
                    var outTxt = "You received "+tx.value+" " + CryptoName() + "! Hash: "+tx.id;
                    PopupNotification("Received "+tx.value+" "+CryptoName(), outTxt);
                    ShowNotification("You received "+tx.value+" "+CryptoName()+"!");
                }
            } else if (tx.confirms==1) {
                if (pending == 0) {
                    outTxt = tx.value + " " + CryptoName() + " is now confirmed!";
                    PopupNotification("Confirmed Transaction", outTxt);
                    ShowNotification(tx.value + " " + CryptoName() + " Confirmed!");
                }
            }
        });
        RenderTransactions(txs, CryptoName(), 0);
        lastTransactions = txs;
    });
}



function CheckNewTransactions(newTranx, oldTranx) {

    console.log("checking new txs");

    var newTranx = [];

    $.each(newTranx, function (key, out) {
        if (out.id!=oldTranx[key].id) {
            newTranx.push(out);
        }
    });

    console.log("size of difference: ", newTranx.length);

    console.log(newTranx);

    ShowNotification("Your balance has changed!");

    PopupNotification("Received "+CryptoName(), "You just received 1.12345 BTC");

    console.log(allTransactions.length);
    console.log(allTransactions);

    LoadBitcoinTransactions(myAddress, CryptoName(), function(transactions) {
        RenderTransactions(transactions, CryptoName(), 0);
    });


}




function CheckForPendingETH() {
    provider.getBlock('pending').then(function (pens) {
        if (pens.number == lastEthBlock) return;
        pendingEthTransaction = [];
        console.log("Block #"+pens.number+" has "+pens.transactions.length+" transactions.");
        $.each(pens.transactions, function (key, hash) {
            if($.inArray(hash, pendingEthTransaction) === -1) {
                provider.getTransaction(hash).then(function (tx) {
                    if (tx==null) return;
                    var ethval = ethers.utils.formatEther(tx.value);
                    pendBal = parseFloat(ethval);
                    if (tx.from == myAddress) {
                        PopupNotification("Outgoing ETH Pending", ethval + " from " + tx.from);
                        $("#pending_amount").attr("class", "col-12 text-center text-danger");
                    } else if (tx.to == myAddress) {
                        PopupNotification("Incoming ETH", ethval + " from " + tx.from);
                        AddPendingTransaction(tx.hash, ethval, CryptoName(), true);
                        $("#pending_amount").attr("class", "col-12 text-center text-success");
                    }
                    if (tx.from == myAddress || tx.to == myAddress) {
                        console.log(tx);
                        pendingEthTransaction.push(tx.hash);
                        $("#pending_amount").html(pendBal.toFixed(6) + " Pending");
                        provider.once(tx.hash, function(transaction) {
                            console.log('Transaction Minded: ' + transaction.hash);
                            console.log(transaction);
                            LoadEthereumTransactions(myAddress);
                        });
                    }
                });
            }
        });
        lastEthBlock = pens.number;
    });
}



function UpdateBalance() {
    console.log("address: "+myAddress);
    if (myAddress=='undefined') return;
    $(".myaddress").html(myAddress);

    if (usingBtc) {
        CryptoBalance(myAddress);
        return
    } else if (usingLtc) {
        CryptoBalance(myAddress);
        return
    } else {

        provider.getBalance(myAddress).then(function (balance) {
            var etherString = ethers.utils.formatEther(balance);
            console.log("ETH Balance: " + etherString);
            var n = parseFloat(etherString);
            var ethValue = n.toLocaleString(
                undefined, // use a string like 'en-US' to override browser locale
                {
                    minimumFractionDigits: 4
                }
            );
            var messageEl = $('#ethbal');
            var split = parseFloat(ethValue).toFixed(4).split(".");
            ethBalance = parseFloat(ethValue);
            messageEl.html(split[0] + ".<small>" + split[1] + "</small>");
        });

        GetTokenBalance(TOKEN_ADDRESS, myAddress, function(balance) {
            if (bad(balance)) return;
            tokenBalance = parseFloat(balance);
            var split = parseFloat(balance).toFixed(4).split(".");
            $("#token_bal").html(split[0] + ".<small>" + split[1] + "</small>");
        });

        $.each(availableTokens, function (key, val) {
            GetTokenBalance(val, myAddress, function(balance) {
                if (bad(balance)) return;
                var tokenObj = "<div id=\"token_" + val.symbol + "\" onclick=\"FocusOnToken('" + val.address + "', " + val.decimals + ", '" + val.name + "', '" + val.symbol + "')\" class=\"row token_obj\">\n" +
                    "    <div class=\"col-12\">\n" +
                    "        <h5>" + val.name +
                    "<span class=\"badge badge-secondary\">" + balance + "</span></h5>\n" +
                    "    </div>\n" +
                    "</div>";
                $("#tokens_available").append(tokenObj);
            });
        });

        CheckForPendingETH();

    }
}


function SendEthereum(callback) {
    var to = $('#send_ether_to').val();
    var amount = $('#send_ether_amount').val();
    var gasLimit = $("#ethgaslimit").val();
    var gasPrice = $("#ethgasprice").val();

    if (usingLtc) {
        send_amount = parseFloat(amount) * 100000000;
        SendCoins(to, send_amount, function(raw) {
                console.log(raw);
            BroadcastTransaction(raw, function(hash) {
                PopupNotification("Transaction Sent", "You sent "+amount+" LTC to "+to);
                console.log("new transaction: "+hash.txid);
                $("#sendethbutton").prop("disabled", false);
                $('#ethermodal').modal('hide');
                $(".txidLink").html(hash.txid);
                $(".txidLink").attr("onclick", "OpenBlockchainTx('" + hash.txid + "', 'LTC')");
                $("#senttxamount").html(amount);
                $("#txtoaddress").html(to);
                $("#txtype").html("LTC");
                $('#trxsentModal').modal('show');
                $("#send_ether_amount").val('0');
                $("#send_ether_to").val('');
                AddPendingTransaction(hash.txid, amount, "LTC");

            });
        });
        return
    } else if (usingBtc) {
        send_amount = parseFloat(amount) * 100000000;
        SendCoins(to, send_amount, function(raw) {
            console.log(raw);

            BroadcastTransaction(raw, function(hash) {
                PopupNotification("Transaction Sent", "You sent "+amount+" BTC to "+to);
                console.log("new transaction: "+hash.txid);
                $("#sendethbutton").prop("disabled", false);
                $('#ethermodal').modal('hide');
                $(".txidLink").html(hash.txid);
                $(".txidLink").attr("onclick", "OpenBlockchainTx('" + hash.txid + "', 'BTC')");
                $("#senttxamount").html(amount);
                $("#txtoaddress").html(to);
                $("#txtype").html("BTC");
                $('#trxsentModal').modal('show');
                $("#send_ether_amount").val('0');
                $("#send_ether_to").val('');
                AddPendingTransaction(hash.txid, amount, "BTC");
            });


        });
        return
    }


    var data = $('#eth_data').val();
    var price = parseInt(gasPrice) * 1000000000;
    if (data == "") {
        data = "0x";
    }

    var txCost = gasLimit * price;

    console.log("Balance: " + ethBalance);
    console.log("Gas Price: " + price);
    console.log("Amount Send: " + amount);
    console.log("Total Fee: " + txCost);
    console.log("To: " + to);

    $("#sendethbutton").prop("disabled", true);

    if (to != '' && amount != '' && parseFloat(amount) <= ethBalance) {

        myWallet.provider = new ethers.providers.JsonRpcProvider(geth);

        var amountWei = ethers.utils.parseEther(amount);
        var targetAddress = ethers.utils.getAddress(to);

        console.log(targetAddress);
        console.log("Amount wei: " + amountWei);

        myWallet.getTransactionCount('pending').then(function(nonce) {
            var transaction = {
                gasLimit: parseInt(gasLimit),
                gasPrice: price,
                to: targetAddress,
                data: data,
                value: amountWei,
                nonce: nonce
            };
            rawTrx = myWallet.sign(transaction);
            console.log("raw tranaction: "+rawTrx);

            provider.sendTransaction(rawTrx).then(function(hash) {
                PopupNotification("Transaction Sent", "You sent "+amount+" ETH to "+to);
                console.log("Ether was sent! Transaction: " + hash);
                $("#sendethbutton").prop("disabled", false);
                $('#ethermodal').modal('hide');
                $(".txidLink").html(hash);
                $(".txidLink").attr("onclick", "OpenBlockchainTx('" + hash + "', 'ETH')");
                $("#senttxamount").html(amount);
                $("#txtoaddress").html(to);
                $("#txtype").html("ETH");
                $('#trxsentModal').modal('show');
                $("#send_ether_amount").val('0');
                $("#send_ether_to").val('');
                AddPendingTransaction(hash, amount, "ETH");
                UpdateBalance();
            });
        });
    }
}



function SendToken(callback) {
    var to = $('#send_to_token').val();
    var amount = $('#send_amount_token').val();
    var gasLimit = parseInt($('#tokengaslimit').val());
    $("#sendtokenbutton").prop("disabled", true);
    var price = parseInt($("#tokengasprice").val());

    price = parseInt(price) * 1000000000;

    var bigamount = amount * (10 ** tokenDecimals);

    console.log("decimals: "+tokenDecimals);
    console.log("sending tokens: "+amount);
    console.log("sending tokens big: "+bigamount);
    console.log("sending to: "+to);

    var trueamount = ethers.utils.bigNumberify(bigamount.toString());
    var decBalance = tokenBalance * (10 ** tokenDecimals);
    var targetAddress = ethers.utils.getAddress(to);

    if (to != '' && bigamount != '' && parseFloat(bigamount) <= decBalance) {
        myWallet.getTransactionCount('pending').then(function (nonce) {
            tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, myWallet);
            var trxOptions = {
                gasLimit: gasLimit,
                gasPrice: price,
                nonce: nonce,
                value: 0
            };
            var contractTransfer = tokenContract.transfer(targetAddress, trueamount, trxOptions);
            contractTransfer.then(function (txid) {
                $("#sendtokenbutton").prop("disabled", false);
                $('#token_modal').modal('hide');
                $(".txidLink").html(txid.hash);
                $(".txidLink").attr("onclick", "OpenEtherScan('" + txid.hash + "')");
                $("#senttxamount").html(amount);
                $("#txtoaddress").html(to);
                $("#txtype").html(tokenSymbol);
                $('#trxsentModal').modal('show');
                PopupNotification("Transaction Sent", "You sent " + amount + " "+tokenSymbol);
                AddPendingTransaction(txid.hash, amount, tokenSymbol);
                UpdateBalance();
            });
        });
    }
}
