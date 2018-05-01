
function OpenPhrase() {
    var words = $("#phrase").val();
    if (words!='') GenerateFromPhrase(words);
}


function GenerateFromPhrase(phrase) {
    if (!bip39.validateMnemonic(phrase)) {
        $("#phrase").val('');
        ShowNotification("That Mnemonic phrase is not correct");
        return
    }
    var mnemonicSeed = bip39.mnemonicToSeed(phrase);
    var mnemonicHex = bip39.mnemonicToSeedHex(phrase);
    btcHD = bitcoin.HDNode.fromSeedBuffer(mnemonicSeed);
    xpriv = btcHD.toBase58();
    console.log(xpriv);
    ethHD = hdkey.fromExtendedKey(xpriv);
    usingHD = true;
    path = "m/44'/60'/0'/0/0";
    UpdateWalletFromHD(path);
    $("#hd_path_setting").removeClass("d-none");
    SuccessAccess();
}


function UpdateWalletFromHD(path) {
    if (usingBtc) {
        var privKey = BTCprivate(path);
    } else if (usingLtc) {
        var privKey = BTCprivate(path);
    } else {
        var privKey = ETHprivate(path);
    }
    console.log(privKey);
    $("#privatepass").val(privKey);
    OpenPrivateKey();
}


function XPRIV() {
    return btcHD.toBase58();
}

function BTCaddress(path) {
    return btcHD.derivePath(path).getAddress()
}

function ETHaddress(path) {
    var addr = ethHD.derivePath(path).getWallet().getAddress();
    var out = "0x"+addr.toString('hex');
    return out;
}

function ETHprivate(path) {
    var addr = ethHD.derivePath(path).getWallet().getPrivateKey();
    var out = "0x"+addr.toString('hex');
    return out;
}


function BTCprivate(path) {
    addr = btcHD.derivePath(path).getWallet().getPrivateKey();
    return addr.toString('hex');
}



// phrase = "nerve heart bicycle thing holiday theme fury orient discover custom tell account shy elite grid like gallery license piece also cannon exist target same";
//
// GenerateFromPhrase(phrase);

// console.log(XPRIV());
//
// console.log(BTCaddress("m/0"));
//
// console.log(ETHaddress("m/0"));


//var node = bitcoin.HDNode.fromBase58(xpriv, bitcoin.networks.testnet)
//node.keyPair.toWIF()

//fixturehd.privateExtendedKey()

//fixturehd.getWallet().getPrivateKeyString(

//  HDKey.fromExtendedKey()

// mnemonicToSeedHex