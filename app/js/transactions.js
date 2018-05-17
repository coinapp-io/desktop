// function GetTokenBalance(contract, wallet, callback) {
//
// }
function CryptoBalance(address) {
    return new Promise(function(resolve, reject) {
        var api = configs.api + "/addr/" + address + "/balance";
        $.get(api, function(bal, status) {
            configs.bigBalance = bal;
            configs.balance = parseInt(bal) * 0.00000001;
            console.log("Balance is: " + configs.balance);
            ltcBalance = parseInt(bal) * 0.00000001;
            btcBalance = ltcBalance;
            var pendingapi = configs.api + "/addr/" + address + "/unconfirmedBalance";
            $.get(pendingapi, function(pendBal, status) {
                if(pendBal == 0) resolve(bal);
                configs.pendingBalance = parseInt(pendBal) * 0.00000001;
                pendBal = parseInt(pendBal) * 0.00000001;
                if(pendBal === 0) {
                    $("#pending_amount").attr("class", "d-none");
                } else if(pendBal > 0) {
                    $("#pending_amount").attr("class", "col-12 text-center text-success");
                } else {
                    $("#pending_amount").attr("class", "col-12 text-center text-danger");
                }
                $("#pending_amount").html(toNumber(pendBal) + " Pending");
                if(pendBal < 0) {
                    configs.balance = configs.balance + pendBal;
                }
                splits = configs.balance.toString().split(".");
                if(!splits[1]) splits[1] = "0";
                $('#ethbal').html(splits[0] + ".<small>" + splits[1].substring(0, 4) + "</small>");
                resolve(bal);
                if(pendingBalance != undefined && pendingBalance != pendBal) {
                    console.log("last balances changed!!!");
                    NotifyPendingTransactions(pendBal);
                }
                lastBalance = btcBalance;
                pendingBalance = pendBal;
                // if (callback) callback(bal);
            }).catch(function(e) {
                reject(e)
            });
        }).catch(function(e) {
            reject(e)
        });
    });
}

function NotifyPendingTransactions(pending) {
    // LoadBitcoinTransactions(myAddress, CryptoName()).then(function(txs) {
    //     $.each(txs, function(key, tx) {
    //         if(tx.confirms == 0) {
    //             if(pending > 0) {
    //                 var outTxt = "You received " + tx.value + " " + CryptoName() + "! Hash: " + tx.id;
    //                 PopupNotification("Received " + tx.value + " " + CryptoName(), outTxt);
    //                 ShowNotification("You received " + tx.value + " " + CryptoName() + "!");
    //             }
    //         } else if(tx.confirms == 1) {
    //             if(pending == 0) {
    //                 outTxt = tx.value + " " + CryptoName() + " is now confirmed!";
    //                 PopupNotification("Confirmed Transaction", outTxt);
    //                 ShowNotification(tx.value + " " + CryptoName() + " Confirmed!");
    //             }
    //         }
    //     });
    //     RenderTransactions(txs, 0, 16);
    //     lastTransactions = txs;
    // });
}

function CheckNewTransactions(newTranx, oldTranx) {
    console.log("checking new txs");
    var newTranx = [];
    $.each(newTranx, function(key, out) {
        if(out.id != oldTranx[key].id) {
            newTranx.push(out);
        }
    });
    console.log("size of difference: ", newTranx.length);
    console.log(newTranx);
    ShowNotification("Your balance has changed!");
    PopupNotification("Received " + CryptoName(), "You just received 1.12345 BTC");
    console.log(allTransactions.length);
    console.log(allTransactions);
    // DownloadAllBitcoinTransactions(myAddress, CryptoName(), function(transactions) {
    //     RenderTransactions(transactions, 0, 16);
    // });
}

function CheckForPendingETH() {
    provider.getBlock('pending').then(function(pens) {
        if(pens.number == lastEthBlock) return;
        console.log("Block #" + pens.number + " has " + pens.transactions.length + " transactions.");
        $.each(pens.transactions, function(key, hash) {
            if($.inArray(hash, pendingEthTransaction) === -1) {
                provider.getTransaction(hash).then(function(tx) {
                    if(tx == null) return;
                    var ethval = ethers.utils.formatEther(tx.value);
                    pendBal = parseFloat(ethval);
                    if(tx.from == myAddress) {
                        console.log("Outgoing popup for tx: " + tx.hash);
                        $("#pending_amount").attr("class", "col-12 text-center text-danger");
                        AddPendingTransaction(tx.hash, pendBal, "ETH");
                    } else if(tx.to == myAddress) {
                        console.log("incoming popup for tx: " + tx.hash);
                        PopupNotification("Incoming ETH", ethval + " from " + tx.from);
                        AddPendingTransaction(tx.hash, ethval, CryptoName(), true);
                        $("#pending_amount").attr("class", "col-12 text-center text-success");
                    }
                    if(tx.from == myAddress || tx.to == myAddress) {
                        pendingEthTransaction.push(tx.hash);
                        $("#pending_amount").html(pendBal.toFixed(6) + " Pending");
                        WaitForTransaction(tx.hash).then(function(hash) {
                            ShowNotification(hash + " Confirmed")
                        });
                    }
                });
            }
        });
        lastEthBlock = pens.number;
    });
}



function RemovePendingTransaction(hash) {
    $("#tx_"+hash).removeClass("pendingFlash");
    $("#tx_"+hash+" button").html("View");
    var pending = [];
    $.each(configs.pendingTransactions, function(k, v) {
        if (v!=hash) {
            pending.push(v);
        }
    });
    configs.pendingTransactions = pending;
}


function WaitForTransaction(hash) {
    return new Promise(function(resolve, reject) {
        configs.provider.once(hash, function(transaction) {
            console.log('Transaction Minded: ' + transaction.hash);
            resolve(transaction.hash);
        });
    });
}



function OnBitcoinBlock() {
    setInterval(function(){
        var pendingapi = configs.api + "/status?q=getInfo";
        $.get(pendingapi, function(res, status) {
            var blockNumber = res.info.blocks;

            if (blockNumber != configs.block) {
                $(".block_number").html("Block #" + blockNumber);
                $(".block_number").css("color", "#979797");
                setTimeout(function () {
                    $(".block_number").css("color", "#dadada");
                }, 300);
                configs.block = blockNumber;
            }
        });
    },10000);
}



function OnEthereumBlock() {
    configs.provider.on('block', function(blockNumber) {
        console.log('New Block: ' + blockNumber);
        $(".block_number").html("Block #" + blockNumber);
        $(".block_number").css("color", "#979797");
        setTimeout(function() {
            $(".block_number").css("color", "#dadada");
        }, 300);
        configs.provider.getBlock(blockNumber).then(function(block) {
            console.log("Found ", block.transactions.length, " transactions in block #", blockNumber);
            $.each(block.transactions, function(k, tx) {
                configs.provider.getTransaction(tx).then(function (tx_res) {
                    if (!tx_res) return;
                    if (tx_res.to == configs.address) {
                        console.log("found pending tx to me: " + tx);
                        NewTransactionView(tx, toEther(tx_res.value).toString(), tx_res.to, false, false);
                        UpdateBalance()
                        // AddPendingTransaction(tx, toEther(tx_res.value).toString(), configs.coin, true);
                        // WaitForTransaction(tx).then(function(tx) {
                        //     ShowNotification(tx + " Confirmed")
                        // });
                    }
                });
            });
        });
    });
}



function toEther(value) {
    var pow = new BigNumber(0.1);
    pow = pow.pow(18);
    var value = new BigNumber(value).multipliedBy(pow);
    return value;
}




function ScanEthereumBlockTransactions(id) {
    configs.provider.getBlock("pending").then(function(block) {
        $.each(block.transactions, function(k, tx) {
                console.log(tx);
                configs.provider.getTransaction(tx).then(function(tx_res) {
                    console.log(tx_res);
                    if (tx_res.to==configs.address) {
                        configs.pendingTransactions.push(tx);
                        console.log("found pending tx to me: "+tx)
                    }
                })
        });
    });
}



function FindTransaction(id) {
    return $.grep(configs.transactions, function(e) {
        return e.hash.toLowerCase() == id.toLowerCase();
    })[0];
}



function FindBTCTransaction(id) {
    return $.grep(configs.transactions, function(e) {
        return e.txid.toLowerCase() == id.toLowerCase();
    })[0];
}


function CloseTransactionView() {
    $(".transaction_view").addClass('d-none');
}


function ViewTransaction(id) {
    if (isBitcoin()) {
        // OpenBlockchainTx(id, configs.coin)
        ViewBitcoinTransaction(id);
    } else {
        ViewEthereumTransaction(id)
    }
    $(".transaction_view").scrollTop(0);
}



function ViewBitcoinTransaction(id) {
    var tx = FindBTCTransaction(id);

    console.log(tx);

    $(".transaction_view").removeClass('d-none');
    $("#trx_view_inputs").html('');
    $("#trx_view_outputs").html('');

    $.each(tx.vin, function(k, inn) {
        var color = "secondary";
        if (configs.address == inn.addr) {
            color = "danger";
        }
        var box = "<div class=\"alert alert-"+color+"\" role=\"alert\">"+inn.addr.substring(0, 12)+"...<span class=\"float-right\">"+toNumber(inn.value)+"</span></div>";
        $("#trx_view_inputs").append(box);
    });

    $.each(tx.vout, function(k, vout) {
        var color = "secondary";
        if (configs.address == vout.scriptPubKey.addresses[0]) {
            color = "success";
        }
        var box = "<div class=\"alert alert-"+color+"\" role=\"alert\">"+vout.scriptPubKey.addresses[0].substring(0, 12)+"...<span class=\"float-right\">"+toNumber(vout.value)+"</span></div>";
        $("#trx_view_outputs").append(box);
    });

    var url = TransactionURL({symbol: configs.coin, id: tx.txid});
    var tx_link = "<a href=\"#\" onclick=\"OpenURL('"+url+"')\">"+tx.txid+"</a>";

    $("#tx_view_hash").html(tx_link);
    $("#tx_view_status").html(tx.confirmations+" confirmations");
    $("#tx_view_height").html(tx.blockheight);
    $("#tx_view_value").html(toNumber(tx.valueOut)+" "+configs.coin);
    $("#tx_view_fee").html(tx.fees+" "+configs.coin);

}



function ViewEthereumTransaction(id) {
    configs.wallet.provider.getTransaction(id).then(function(tx) {
        console.log(tx);
        $(".transaction_view").removeClass('d-none');
        var fee = FormatDecimals(tx.gasPrice.mul(tx.gasLimit), 18);
        var value = FormatDecimals(tx.value, 18);
        var tx_link = "<a href=\"#\" onclick=\"OpenURL('https://etherscan.io/tx/" + id + "')\">" + id + "</a>";
        var to_link = "<a href=\"#\" onclick=\"OpenURL('https://etherscan.io/address/" + tx.to + "')\">" + tx.to + "</a> <img class=\"mini_icon\" onclick=\"OpenQRCodeAddress('" + tx.to + "');\" src=\"../../images/icons/qrcode.png\">";
        var from_link = "<a href=\"#\" onclick=\"OpenURL('https://etherscan.io/address/" + tx.from + "')\">" + tx.from + "</a> <img class=\"mini_icon\" onclick=\"OpenQRCodeAddress('" + tx.from + "');\" src=\"../../images/icons/qrcode.png\">";

        if (tx.txreceipt_status == 1) {
            var tx_status = "<span class='text-success'>Success</span>";
        } else {
            var tx_status = "<span class='text-danger'>Error</span>";
        }

        var method = GetDataMethod(tx.data);

        var symbol = "ETH";
        var coinicon = "<img class='mini_icon' src='" + CoinIcon("ETH") + "'>";
        var coinLink = symbol;
        if (method == "transfer") {
            var transfer = DecodeData(tx.data);
            to_link = "<a href=\"#\" onclick=\"OpenURL('https://etherscan.io/address/" + transfer.to + "')\">" + transfer.to + "</a> <img class=\"mini_icon\" onclick=\"OpenQRCodeAddress('" + transfer.to + "');\" src=\"../../images/icons/qrcode.png\">";
            var tk = FindToken(tx.to);
            coinicon = "<img class='mini_icon' src='" + CoinIcon(tk.symbol) + "'>";
            symbol = tk.symbol;
            value = FormatDecimals(transfer.value, tk.decimals);
            coinLink = "<a href=\"#\" onclick=\"OpenURL('https://etherscan.io/token/" + tx.to + "')\">" + symbol + "</a>";
        }

        var gweiGasPrice = FormatDecimals(tx.gasPrice, 9);

        $("#tx_view_hash").html(tx_link);
        $("#tx_view_status").html(tx_status);
        $("#tx_view_height").html(tx.blockNumber);
        $("#tx_view_to").html(to_link);
        $("#tx_view_from").html(from_link);
        $("#tx_view_value").html(toNumber(value) + " " + coinLink + coinicon);
        $("#tx_view_limit").html(tx.gasLimit.toString());
        $("#tx_view_used").html(tx.gasUsed);
        $("#tx_view_price").html(gweiGasPrice.toString() + " gwei");
        $("#tx_view_fee").html(fee.toString() + " ETH");
        $("#tx_view_nonce").html(tx.nonce);
        $("#tx_view_method").val(GetDataMethod(tx.data));
        $("#tx_view_data").val(tx.data);
    });
}




function BalanceText(amount) {
    var n = parseFloat(amount);
    var ethValue = n.toLocaleString(undefined, {minimumFractionDigits: 4});
    var messageEl = $('#ethbal');
    var split = parseFloat(ethValue).toFixed(4).split(".");
    messageEl.html(split[0] + ".<small>" + split[1] + "</small>");
}



function UpdateBalance() {
    return new Promise(function(resolve, reject) {
        console.log("Updating "+configs.coin+" Balance.");
        if(isBitcoin()) {
            CryptoBalance(configs.address).then(function(balance) {
                BalanceText(balance);
                resolve(balance);
            }).catch(function(e) {
                reject(e.responseText);
            });
        } else {
            configs.wallet.provider.getBalance(configs.address).then(function(balance) {
                var etherString = ethers.utils.formatEther(balance);
                configs.balance = etherString;
                configs.bigBalance = balance;
                BalanceText(etherString);
                resolve(balance);
            });
        }
        //
        //
        // if (configs.address == 'undefined') reject(myAddress);
        // $(".myaddress").html(myAddress);
        //
        // if (configs.coin=="BTC") {
        //         CryptoBalance(myAddress);
        // } else if (configs.coin=="LTC") {
        //     resolve(configs.coin);
        // } else if (configs.coin=="ETH") {
        //
        //     provider.getBalance(myAddress).then(function (balance) {
        //         var etherString = ethers.utils.formatEther(balance);
        //         configs.balance = etherString;
        //         configs.bigBalance = balance;
        //         var n = parseFloat(etherString);
        //         var ethValue = n.toLocaleString(
        //             undefined, // use a string like 'en-US' to override browser locale
        //             {
        //                 minimumFractionDigits: 4
        //             }
        //         );
        //         var messageEl = $('#ethbal');
        //         var split = parseFloat(ethValue).toFixed(4).split(".");
        //         ethBalance = parseFloat(ethValue);
        //         messageEl.html(split[0] + ".<small>" + split[1] + "</small>");
        //         resolve(balance);
        //     });
        //
        // }
        //
        // if (usingBtc) {
        //     CryptoBalance(myAddress);
        //     return
        // } else if (usingLtc) {
        //     CryptoBalance(myAddress);
        //     return
        // } else {
        //
        //     provider.getBalance(myAddress).then(function (balance) {
        //         var etherString = ethers.utils.formatEther(balance);
        //         var n = parseFloat(etherString);
        //         var ethValue = n.toLocaleString(
        //             undefined, // use a string like 'en-US' to override browser locale
        //             {
        //                 minimumFractionDigits: 4
        //             }
        //         );
        //         var messageEl = $('#ethbal');
        //         var split = parseFloat(ethValue).toFixed(4).split(".");
        //         ethBalance = parseFloat(ethValue);
        //         messageEl.html(split[0] + ".<small>" + split[1] + "</small>");
        //     });
        //
        //     GetTokenBalance(TOKEN_ADDRESS, myAddress, function (balance) {
        //         if (bad(balance)) return;
        //         tokenBalance = parseFloat(balance);
        //         var split = parseFloat(balance).toFixed(4).split(".");
        //         $("#token_bal").html(split[0] + ".<small>" + split[1] + "</small>");
        //     });
        //
        //     $.each(availableTokens, function (key, val) {
        //         GetTokenBalance(val, myAddress, function (balance) {
        //             if (bad(balance)) return;
        //             var tokenObj = "<div id=\"token_" + val.symbol + "\" onclick=\"FocusOnToken('" + val.address + "', " + val.decimals + ", '" + val.name + "', '" + val.symbol + "')\" class=\"row token_obj\">\n" +
        //                 "    <div class=\"col-12\">\n" +
        //                 "        <h5>" + val.name +
        //                 "<span class=\"badge badge-secondary\">" + balance + "</span></h5>\n" +
        //                 "    </div>\n" +
        //                 "</div>";
        //             $("#tokens_available").append(tokenObj);
        //         });
        //     });
        //
        //     CheckForPendingETH();
        //
        // }
    });
}

function NewTransactionView(hash, amount, to, sent, pending) {
    var title = "Transaction Sent";
    var desc = "You sent " + amount + " " + configs.coin + " to " + to;
    if (!sent) {
        title = "Transaction Received";
        desc = "You received " + amount + " " + configs.coin;
    }
    PopupNotification(title, desc);
    console.log("new transaction: " + hash);
    $("#sendethbutton").prop("disabled", false);
    $('#ethermodal').modal('hide');
    $(".txidLink").html(hash);
    $(".txidLink").attr("onclick", "OpenBlockchainTx('" + hash + "', '" + configs.coin + "')");
    $("#senttxamount").html(amount);
    $("#txtoaddress").html(to);
    $("#txtype").html(configs.coin);
    if (sent) $('#trxsentModal').modal('show');
    $("#send_ether_amount").val('0');
    $("#send_ether_to").val('');
    AddPendingTransaction(hash, amount, configs.coin, !sent, pending);
}


function DefaultTxFees() {
    var amount;
    switch(configs.coin) {
        case "BTC":
            amount = 135;
            break;
        case "BTCTEST":
            amount = 443;
            break;
        case "LTC":
            amount = 443;
            break;
        case "LTCTEST":
            amount = 443;
            break;
    }
    $("#btc_byte_price").val(amount);
}

function SendEthereum() {
    var to = $('#send_ether_to').val();
    var amount = $('#send_ether_amount').val();
    var gasLimit = $("#ethgaslimit").val();
    var gasPrice = $("#ethgasprice").val();
    var data = $("#eth_data").val();
    gasPrice = parseInt(gasPrice) * 1000000000;
    var thisTxfee = $("#ethtxfee").val();
    var BTCamount = FormatBigDecimals(amount, 8);
    $("#sendethbutton").prop("disabled", true);
    if(isBitcoin()) {
        SendCoins(to, BTCamount, thisTxfee).then(function(raw) {
            BroadcastTransaction(raw).then(function(hash) {
                NewTransactionView(hash.txid, amount, to, true, true);
                configs.pendingTransactions.push(hash.txid);
            }).catch(function(e) {
                console.error(e);
                ShowNotification(e);
                $("#sendethbutton").prop("disabled", false);
            });
        });
    } else {
        var amountWei = ethers.utils.parseEther(amount);
        var targetAddress = ethers.utils.getAddress(to);
        console.log(targetAddress);
        console.log("Amount wei: " + amountWei);
        configs.wallet.getTransactionCount('pending').then(function(nonce) {
            var transaction = {
                gasLimit: parseInt(gasLimit),
                gasPrice: gasPrice,
                to: targetAddress,
                data: data,
                value: amountWei,
                nonce: nonce
            };
            rawTrx = configs.wallet.sign(transaction);
            console.log("raw tranaction: " + rawTrx);
            configs.provider.sendTransaction(rawTrx).then(function(hash) {
                NewTransactionView(hash, amount, to, true, true);
                ReduceBalance(amount);
                configs.pendingTransactions.push(hash);
                WaitForTransaction(hash).then(function(hash) {
                    RemovePendingTransaction(hash);
                    ShowNotification(hash + " Confirmed")
                });
                // UpdateBalance();
            });
        });
    }
}


function AddBalance(amount) {
    configs.bigBalance = configs.bigBalance.plus(amount);
    splits = configs.pendingBalance.toString().split(".");
    if(!splits[1]) splits[1] = "0";
    $('#ethbal').html(splits[0] + ".<small>" + splits[1].substring(0, 4) + "</small>");
}


function ReduceBalance(amount) {
    configs.pendingBalance = configs.balance - amount;
    splits = configs.pendingBalance.toString().split(".");
    if(!splits[1]) splits[1] = "0";
    $('#ethbal').html(splits[0] + ".<small>" + splits[1].substring(0, 4) + "</small>");
}


function UpdateTokenBalanceText(amount) {
    splits = amount.toString().split(".");
    if(!splits[1]) splits[1] = "0";
    $('#token_bal').html(splits[0] + ".<small>" + splits[1].substring(0, 4) + "</small>");
}

function toBigInt(val) {
    return ethers.utils.bigNumberify(parseInt(val).toString())
}


function GetNonce() {
    return new Promise(function(resolve, reject) {
        configs.wallet.getTransactionCount('pending').then(function (nonce) {
            configs.nonce = nonce;
            resolve(nonce);
        });
    });
}



function SendToken() {
    var to = $('#send_to_token').val();
    var amount = $('#send_amount_token').val();
    var gasLimit = parseInt($('#tokengaslimit').val());
    $("#sendtokenbutton").prop("disabled", true);
    var price = parseInt($("#tokengasprice").val());
    price = parseInt(price) * 1000000000;
    var bigamount = FormatBigDecimals(amount, configs.tokenDecimals);
    $("#sendtokenbutton").prop("disabled", true);
    console.log("decimals: " + configs.tokenDecimals);
    console.log("sending tokens: " + amount);
    console.log("sending tokens big: " + bigamount);
    console.log("sending to: " + to);
    var trueamount = toBigInt(bigamount);
    var decBalance = FormatBigDecimals(configs.tokenBalance, configs.tokenDecimals);
    var targetAddress = ethers.utils.getAddress(to);
    if(to != '' && bigamount != '' && parseFloat(bigamount) <= decBalance) {
        configs.wallet.getTransactionCount('pending').then(function(nonce) {
            var trxOptions = {
                gasLimit: gasLimit,
                gasPrice: price,
                nonce: nonce,
                value: 0
            };
            var contractTransfer = configs.token.transfer(targetAddress, trueamount, trxOptions);
            contractTransfer.then(function(txid) {
                $("#sendtokenbutton").prop("disabled", false);
                $('#token_modal').modal('hide');
                $(".txidLink").html(txid.hash);
                $(".txidLink").attr("onclick", "OpenEtherScan('" + txid.hash + "')");
                $("#senttxamount").html(amount);
                $("#txtoaddress").html(to);
                $("#txtype").html(configs.tokenSymbol);
                $('#trxsentModal').modal('show');
                PopupNotification("Transaction Sent", "You sent " + amount + " " + configs.tokenSymbol);
                AddPendingTransaction(txid.hash, amount, configs.tokenSymbol);
                configs.pendingTransactions.push(txid.hash);
                WaitForTransaction(txid.hash).then(function(hash) {
                    ShowNotification(hash + " Confirmed");
                });
                UpdateBalance();
            });
        });
    }
}