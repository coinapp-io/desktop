const hooks = require('./hooks');

describe('Coin App UI Testing', () => {
    let app;

beforeEach(() => {
    return hooks.startApp().then((startedApp) => {app = startedApp});
});
afterEach(() => {
    return hooks.stopApp(app)
});

const phrase = 'myth like bonus scare over problem client lizard pioneer submit female collect';
const correct_address = "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1";

const ETH_PRIV = "4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d";
const BTC_PRIV = process.env.BTC_PRIV;
const LTC_PRIV = process.env.LTC_PRIV;

//
// Bitcoin Testnet Donations:  myPmiKz2RF3ihCCW8mQacYX8TC5yxem7aD
// Litecoin Testnet Donations: muvvhtaYDV1SpRPARHdtruG3nBv38MtS3C
//

it('opens a window', () => {
    return app.client.waitUntilWindowLoaded()
        .getWindowCount().should.eventually.equal(1)
});


it('should save settings', () => {
return app.client.waitUntilWindowLoaded()
    .click("#setup_panel-tab")
    .setValue('#setting_geth_server', "http://localhost:8545")
    .setValue('#setting_btc_server', "https://btctest.coinapp.io/api")
    .setValue('#setting_ltc_server', "https://ltctest.coinapp.io/api")
    .getValue("#setting_geth_server")
    .should.eventually.equal("http://localhost:8545")
    .getValue("#setting_ltc_server")
    .should.eventually.equal("https://ltctest.coinapp.io/api")
    .getValue("#setting_btc_server")
    .should.eventually.equal("https://btctest.coinapp.io/api")
    .click('#save_settings_btn')
});



it('should open token sending modal and send tokens', () => {
    return app.client.waitUntilWindowLoaded()
        .setValue('#privatepass', ETH_PRIV)
        .getValue("#privatepass")
        .should.eventually.equal(ETH_PRIV)
        .click("//select/option[@value=\'ropsten\']")
        .click('#unlock_priv_key').pause(4000)
        .getText(".myaddress")
        .should.eventually.equal(correct_address)
        .click('#tokens_available-tab').pause(2000)
        .click('#new_token_dialog_btn').pause(2000)
        .setValue('#new_token_address', "0xe78a0f7e598cc8b0bb87894b0f60dd2a88d6a8ab").pause(4000)
        .getText("#new_token_alert")
        .should.eventually.equal("Correct Token for: BASIC")
        .click('#savetokenbutton').pause(2000)
        .click("#token_BASIC").pause(3000)
        .getText("#token_bal")
        .should.eventually.equal("10000000.0000")
        .click("#send_tokens_btn").pause(1000)
        .setValue('#send_to_token', "0xffcf8fdee72ac11b5c542428b35eef5769c409f0").pause(1000)
        .setValue('#send_amount_token', "1234567.999").pause(1000)
        .getText(".token_spend")
        .should.eventually.equal("8765432.001000")
        .setValue('#tokengasprice', "21").pause(1000)
        .getText(".ethavailable")
        .should.eventually.equal("99.998635")
        .click("#sendtokenbutton").pause(5000)
        .getText("#senttxamount")
        .should.eventually.equal("1234567.999")
        .getText("#txtoaddress")
        .should.eventually.equal("0xffcf8fdee72ac11b5c542428b35eef5769c409f0")
        .click("#trxsentModal")
});





it('should load settings', () => {
return app.client.waitUntilWindowLoaded()
    .click("#setup_panel-tab")
    .getValue("#setting_geth_server")
    .should.eventually.equal("http://localhost:8545")
    .getValue("#setting_ltc_server")
    .should.eventually.equal("https://ltctest.coinapp.io/api")
    .getValue("#setting_btc_server")
    .should.eventually.equal("https://btctest.coinapp.io/api")
});

// it('should open token modal and send tokens', () => {
//     return app.client.waitUntilWindowLoaded()
//         .setValue('#privatepass', priv)
//         .getValue("#privatepass")
//         .should.eventually.equal(priv)
//         .click('#unlock_priv_key').pause(3000)
//         .getText(".myaddress")
//         .should.eventually.equal(correct_address)
//         .click('#send_tokens_btn').pause(3000)
//         .getValue("#tokengaslimit")
//         .should.eventually.equal("65000")
//         .setValue("#send_to_token", "0x004F3E7fFA2F06EA78e14ED2B13E87d710e8013F").pause(500)
//         .setValue("#send_amount_token", "123456.76543").pause(500)
//         .setValue("#tokengaslimit", "80000").pause(500)
//         .setValue("#tokengasprice", "5").pause(500)
//         .getText("u.ethavailable")
//         .should.eventually.equal("78.876000")
//         .getText("u.token_spend")
//         .should.eventually.equal("9876543.234570")
//         .getValue("#tokentxfee")
//         .should.eventually.equal("0.000400")
//         .click('#sendtokenbutton').pause(8000)
//         .getText(".txidLink")
//         .should.eventually.equal("0x6292924881590cfd180531064f92e36e02754572951890b65cb49dbd3b05f4df")
//         .getText("#senttxamount")
//         .should.eventually.equal("123456.76543")
//         .getText("#txtoaddress")
//         .should.eventually.equal("0x004F3E7fFA2F06EA78e14ED2B13E87d710e8013F")
// });


it('should insert a ETH ROPSTEN private key', () => {
    return app.client.waitUntilWindowLoaded()
        .setValue('#privatepass', ETH_PRIV)
        .getValue("#privatepass")
        .should.eventually.equal(ETH_PRIV)
        .click("//select/option[@value=\'ropsten\']")
        .click('#unlock_priv_key').pause(10000)
        .getText(".myaddress")
        .should.eventually.equal(correct_address)
});


it('should insert a BTC TESTNET private key', () => {
    return app.client.waitUntilWindowLoaded()
        .setValue('#privatepass', "cVVGgzVgcc5S3owCskoneK8R1BNGkBveiEcGDaxu8RRDvFcaQaSG")
        .getValue("#privatepass")
        .should.eventually.equal("cVVGgzVgcc5S3owCskoneK8R1BNGkBveiEcGDaxu8RRDvFcaQaSG")
        .click("//select/option[@value=\'btctest\']")
        .click('#unlock_priv_key').pause(4000)
        .getText(".myaddress")
        .should.eventually.equal("mnJQyeDFmGjNoxyxKQC6MMFdpx77rYV3Bo")
});


it('should insert a LTC TESTNET private key', () => {
    return app.client.waitUntilWindowLoaded()
        .setValue('#privatepass', "cVVGgzVgcc5S3owCskoneK8R1BNGkBveiEcGDaxu8RRDvFcaQaSG")
        .getValue("#privatepass")
        .should.eventually.equal("cVVGgzVgcc5S3owCskoneK8R1BNGkBveiEcGDaxu8RRDvFcaQaSG")
        .click("//select/option[@value=\'ltctest\']")
        .click('#unlock_priv_key').pause(4000)
        .getText(".myaddress")
        .should.eventually.equal("mnJQyeDFmGjNoxyxKQC6MMFdpx77rYV3Bo")
});


it('should save settings for LIVE NET settings', () => {
    return app.client.waitUntilWindowLoaded()
        .click("#setup_panel-tab")
        .setValue('#setting_geth_server', "https://eth.coinapp.io")
        .setValue('#setting_btc_server', "https://btc.coinapp.io/api")
        .setValue('#setting_ltc_server', "https://ltc.coinapp.io/api")
        .getValue("#setting_geth_server")
        .should.eventually.equal("https://eth.coinapp.io")
        .getValue("#setting_ltc_server")
        .should.eventually.equal("https://ltc.coinapp.io/api")
        .getValue("#setting_btc_server")
        .should.eventually.equal("https://btc.coinapp.io/api")
        .click('#save_settings_btn')
});


it('should insert a ETH private key', () => {
    return app.client.waitUntilWindowLoaded()
        .setValue('#privatepass', ETH_PRIV)
        .getValue("#privatepass")
        .should.eventually.equal(ETH_PRIV)
        .click("//select/option[@value=\'eth\']")
        .click('#unlock_priv_key').pause(4000)
        .getText(".myaddress")
        .should.eventually.equal(correct_address)
});


it('should insert a BTC private key', () => {
    return app.client.waitUntilWindowLoaded()
        .setValue('#privatepass', "KzsR1xok4mGjbMXUY8wuYwx3z6nShsGPaxaXPTxH1YZ3csWyPNzz")
        .getValue("#privatepass")
        .should.eventually.equal("KzsR1xok4mGjbMXUY8wuYwx3z6nShsGPaxaXPTxH1YZ3csWyPNzz")
        .click("//select/option[@value=\'btc\']")
        .click('#unlock_priv_key').pause(4000)
        .getText(".myaddress")
        .should.eventually.equal("16JBSn4LBnpnEUoPhDcYnX7VeZizm4iFFj")
});


it('should insert a LTC private key', () => {
    return app.client.waitUntilWindowLoaded()
        .setValue('#privatepass', "T7JJQrvjiX8Xmd5k8XdwUdFCViy3jLGYSMgymbBMwoA9RESSx25k")
        .getValue("#privatepass")
        .should.eventually.equal("T7JJQrvjiX8Xmd5k8XdwUdFCViy3jLGYSMgymbBMwoA9RESSx25k")
        .click("//select/option[@value=\'ltc\']")
        .click('#unlock_priv_key').pause(4000)
        .getText(".myaddress")
        .should.eventually.equal("LLNWymPhGRHY5pPoMsqjAnjHz3jWqZuwJJ")
});


it('should save settings back to TESTNET', () => {
    return app.client.waitUntilWindowLoaded()
        .click("#setup_panel-tab")
        .setValue('#setting_geth_server', "http://localhost:8545")
        .setValue('#setting_btc_server', "https://btctest.coinapp.io/api")
        .setValue('#setting_ltc_server', "https://ltctest.coinapp.io/api")
        .getValue("#setting_geth_server")
        .should.eventually.equal("http://localhost:8545")
        .getValue("#setting_ltc_server")
        .should.eventually.equal("https://ltctest.coinapp.io/api")
        .getValue("#setting_btc_server")
        .should.eventually.equal("https://btctest.coinapp.io/api")
        .click('#save_settings_btn')
});



it('should open ether sending modal and send ETH', () => {
    return app.client.waitUntilWindowLoaded()
        .setValue('#privatepass', ETH_PRIV)
        .getValue("#privatepass")
        .should.eventually.equal(ETH_PRIV)
        .click("//select/option[@value=\'ropsten\']")
        .click('#unlock_priv_key').pause(4000)
        .getText(".myaddress")
        .should.eventually.equal(correct_address)
        .click('#send_ether_btn').pause(7000)
        .getValue("#ethgaslimit")
        .should.eventually.equal("21000")
        .setValue('#send_ether_to', "0xffcf8fdee72ac11b5c542428b35eef5769c409f0").pause(500)
        .setValue('#send_ether_amount', "1.12345").pause(500)
        .setValue('#ethgaslimit', "50000").pause(500)
        .setValue('#ethgasprice', "5").pause(500)
        .getValue("#ethtxfee")
        .should.eventually.equal("0.00025")
        .getText(".ethspend")
        .should.eventually.equal("98.875217")
        .click('#sendethbutton').pause(8000)
        // .getText(".txidLink")
        // .should.eventually.equal("0x106121baa49de38090ccdd35071ed7c7757639f783eba0ae5b8e126ee443e278")
        .getText("#senttxamount")
        .should.eventually.equal("1.12345")
        .getText("#txtoaddress")
        .should.eventually.equal("0xffcf8fdee72ac11b5c542428b35eef5769c409f0")
});


it('should get my eth balance', () => {
    return app.client.waitUntilWindowLoaded()
        .setValue('#privatepass', ETH_PRIV)
        .getValue("#privatepass")
        .should.eventually.equal(ETH_PRIV)
        .click("//select/option[@value=\'ropsten\']")
        .click('#unlock_priv_key').pause(4000)
        .getText(".myaddress")
        .should.eventually.equal(correct_address)
        .getText("#ethbal")
        .should.eventually.equal("98.8754")
});


it('should open litecoin sending modal and send LTC', () => {
    return app.client.waitUntilWindowLoaded()
        .setValue('#privatepass', LTC_PRIV)
        .getValue("#privatepass")
        .should.eventually.equal(LTC_PRIV)
        .click("//select/option[@value=\'ltctest\']")
        .click('#unlock_priv_key').pause(4000)
        .getText(".myaddress")
        .should.eventually.equal("myPmiKz2RF3ihCCW8mQacYX8TC5yxem7aD")
        .click('#send_ether_btn').pause(7000)
        .setValue('#send_ether_to', "myPmiKz2RF3ihCCW8mQacYX8TC5yxem7aD").pause(500)
        .setValue('#send_ether_amount', "0.123").pause(500)
        .click('#sendethbutton').pause(12000)
        .getText(".txidLink")
        .should.eventually.not.equal("")
        .getText("#senttxamount")
        .should.eventually.equal("0.123")
        .getText("#txtoaddress")
        .should.eventually.equal("myPmiKz2RF3ihCCW8mQacYX8TC5yxem7aD")
});


it('should open bitcoin sending modal and send BTC', () => {
    return app.client.waitUntilWindowLoaded()
        .setValue('#privatepass', BTC_PRIV)
        .getValue("#privatepass")
        .should.eventually.equal(BTC_PRIV)
        .click("//select/option[@value=\'btctest\']")
        .click('#unlock_priv_key').pause(8000)
        .getText(".myaddress")
        .should.eventually.equal("mmnZGkQ6bJbVbmuRpXUvgzgB1NPoBFg8xd")
        .click('#send_ether_btn').pause(7000)
        .setValue('#send_ether_to', "mmnZGkQ6bJbVbmuRpXUvgzgB1NPoBFg8xd").pause(500)
        .setValue('#send_ether_amount', "0.012345").pause(500)
        .click('#sendethbutton').pause(12000)
        .getText(".txidLink")
        .should.eventually.not.equal("")
        .getText("#senttxamount")
        .should.eventually.equal("0.012345")
        .getText("#txtoaddress")
        .should.eventually.equal("mmnZGkQ6bJbVbmuRpXUvgzgB1NPoBFg8xd")
});


it('should insert a phrase', () => {
return app.client.waitUntilWindowLoaded()
    .setValue('#phrase', phrase)
    .getValue("#phrase")
    .should.eventually.equal(phrase)
    .click('#open_hd_wallet').pause(10000)
    .getText(".myaddress")
    .should.eventually.equal(correct_address)
});


it('should insert a phrase and see hd path', () => {
return app.client.waitUntilWindowLoaded()
    .setValue('#phrase', phrase)
    .getValue("#phrase")
    .should.eventually.equal(phrase)
    .click('#open_hd_wallet')
    .getText(".myaddress")
    .should.eventually.equal(correct_address)
});

});