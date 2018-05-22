const hooks = require('./hooks');
const path = require('path');
var thispath = path.join(__dirname, '../');


const phrase = 'myth like bonus scare over problem client lizard pioneer submit female collect';
const correct_address = "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1";

const ETH_PRIV = "4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d";
const BTC_PRIV = "cVVGgzVgcc5S3owCskoneK8R1BNGkBveiEcGDaxu8RRDvFcaQaSG";
const LTC_PRIV = "cVVGgzVgcc5S3owCskoneK8R1BNGkBveiEcGDaxu8RRDvFcaQaSG";
const correct_BTC = "mnJQyeDFmGjNoxyxKQC6MMFdpx77rYV3Bo";


describe('CoinApp Transaction Viewing', () => {
    let app;

    beforeEach(() => {
        return hooks.startApp().then((startedApp) => {
            app = startedApp
        });
    });
    afterEach(() => {
        return hooks.stopApp(app)
    });


    it('should save settings', () => {
        return app.client.waitUntilWindowLoaded()
            .click("#setup_panel-tab")
            .setValue('#setting_geth_server', "http://localhost:8545")
            .setValue('#setting_btc_server', "http://localhost:3001/api")
            .setValue('#setting_ltc_server', "http://localhost:3005/api")
            .getValue("#setting_geth_server")
            .should.eventually.equal("http://localhost:8545")
            .getValue("#setting_ltc_server")
            .should.eventually.equal("http://localhost:3005/api")
            .getValue("#setting_btc_server")
            .should.eventually.equal("http://localhost:3001/api")
            .click('#save_settings_btn')
    });



    it('should open Litecoin and view transaction', () => {
        return app.client.waitUntilWindowLoaded()
            .setValue('#privatepass', LTC_PRIV)
            .getValue("#privatepass")
            .should.eventually.equal(LTC_PRIV)
            .click("//select/option[@value=\'ltctest\']")
            .click('#unlock_priv_key').pause(5000)
            .getText(".myaddress")
            .should.eventually.equal("mnJQyeDFmGjNoxyxKQC6MMFdpx77rYV3Bo")
            .click('//*[@class="row transaction_box"]/div[2]/button').pause(2000)
            .getText("#tx_view_value")
            .should.eventually.equal("31.2344482 LTCTEST")
            .getText("#tx_view_fee")
            .should.eventually.equal("0.0000518 LTCTEST")
    });


    it('should open Bitcoin and view transaction', () => {
        return app.client.waitUntilWindowLoaded()
            .setValue('#privatepass', BTC_PRIV)
            .getValue("#privatepass")
            .should.eventually.equal(BTC_PRIV)
            .click("//select/option[@value=\'btctest\']")
            .click('#unlock_priv_key').pause(5000)
            .getText(".myaddress")
            .should.eventually.equal("mnJQyeDFmGjNoxyxKQC6MMFdpx77rYV3Bo")
            .click('//*[@class="row transaction_box"]/div[2]/button').pause(2000)
            .getText("#tx_view_value")
            .should.eventually.equal("14.133112 BTCTEST")
            .getText("#tx_view_fee")
            .should.eventually.equal("0.000588 BTCTEST")
    });




});


describe('CoinApp Transaction Testing', () => {
    let app;

    beforeEach(() => {
        return hooks.startApp().then((startedApp) => {
            app = startedApp
        });
    });
    afterEach(() => {
        return hooks.stopApp(app)
    });


    it('should save settings', () => {
        return app.client.waitUntilWindowLoaded()
            .click("#setup_panel-tab")
            .setValue('#setting_geth_server', "http://localhost:8545")
            .setValue('#setting_btc_server', "http://localhost:3001/api")
            .setValue('#setting_ltc_server', "http://localhost:3005/api")
            .getValue("#setting_geth_server")
            .should.eventually.equal("http://localhost:8545")
            .getValue("#setting_ltc_server")
            .should.eventually.equal("http://localhost:3005/api")
            .getValue("#setting_btc_server")
            .should.eventually.equal("http://localhost:3001/api")
            .click('#save_settings_btn')
    });


    it('should open token sending modal and send tokens', () => {
        return app.client.waitUntilWindowLoaded()
            .setValue('#privatepass', ETH_PRIV)
            .getValue("#privatepass")
            .should.eventually.equal(ETH_PRIV)
            .click("//select/option[@value=\'ropsten\']")
            .click('#unlock_priv_key').pause(8000)
            .getText(".myaddress")
            .should.eventually.equal(correct_address)
            .click('#tokens_available-tab').pause(2000)
            .click('#new_token_dialog_btn').pause(2000)
            .setValue('#new_token_address', "0xe78a0f7e598cc8b0bb87894b0f60dd2a88d6a8ab").pause(4000)
            .getText("#new_token_alert")
            .should.eventually.equal("Correct Token for: BASIC")
            .click('#savetokenbutton').pause(2000)
            .click("#token_0xe78a0f7e598cc8b0bb87894b0f60dd2a88d6a8ab").pause(3000)
            .getText("#token_bal")
            .should.eventually.equal("10000000.0")
            .click("#send_tokens_btn").pause(1000)
            .setValue('#send_to_token', "0xffcf8fdee72ac11b5c542428b35eef5769c409f0").pause(1000)
            .setValue('#send_amount_token', "1234567.999").pause(1000)
            .getText(".token_spend")
            .should.eventually.equal("8765432.001")
            .setValue('#tokengasprice', "21").pause(1000)
            .getText(".ethavailable")
            .should.eventually.equal("99.998845")
            .click("#sendtokenbutton").pause(8000)
            .getText("#senttxamount")
            .should.eventually.equal("1234567.999")
            .getText("#txtoaddress")
            .should.eventually.equal("0xffcf8fdee72ac11b5c542428b35eef5769c409f0")
            .click("#trxsentModal")
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
            .should.eventually.equal("98.875216925")
            .click('#sendethbutton').pause(8000)
            // .getText(".txidLink")
            // .should.eventually.equal("0x106121baa49de38090ccdd35071ed7c7757639f783eba0ae5b8e126ee443e278")
            .getText("#senttxamount")
            .should.eventually.equal("1.12345")
            .getText("#txtoaddress")
            .should.eventually.equal("0xffcf8fdee72ac11b5c542428b35eef5769c409f0")
    });


    it('should open litecoin sending modal and send LTC', () => {
        return app.client.waitUntilWindowLoaded()
            .setValue('#privatepass', LTC_PRIV)
            .getValue("#privatepass")
            .should.eventually.equal(LTC_PRIV)
            .click("//select/option[@value=\'ltctest\']")
            .click('#unlock_priv_key').pause(40000)
            .getText(".myaddress")
            .should.eventually.equal("mnJQyeDFmGjNoxyxKQC6MMFdpx77rYV3Bo")
            .click('#send_ether_btn').pause(7000)
            .setValue('#send_ether_to', "mnJQyeDFmGjNoxyxKQC6MMFdpx77rYV3Bo").pause(500)
            .setValue('#send_ether_amount', "0.123").pause(500)
            .click('#sendethbutton').pause(20000)
            .getText(".txidLink")
            .should.eventually.not.equal("")
            .getText("#senttxamount")
            .should.eventually.equal("0.123")
            .getText("#txtoaddress")
            .should.eventually.equal("mnJQyeDFmGjNoxyxKQC6MMFdpx77rYV3Bo")
    });


    it('should open bitcoin sending modal and send BTC', () => {
        return app.client.waitUntilWindowLoaded()
            .setValue('#privatepass', BTC_PRIV)
            .getValue("#privatepass")
            .should.eventually.equal(BTC_PRIV)
            .click("//select/option[@value=\'btctest\']")
            .click('#unlock_priv_key').pause(20000)
            .getText(".myaddress")
            .should.eventually.equal("mnJQyeDFmGjNoxyxKQC6MMFdpx77rYV3Bo")
            .click('#send_ether_btn').pause(7000)
            .setValue('#send_ether_to', "mnJQyeDFmGjNoxyxKQC6MMFdpx77rYV3Bo").pause(500)
            .setValue('#send_ether_amount', "0.012345").pause(500)
            .click('#sendethbutton').pause(12000)
            .getText(".txidLink")
            .should.eventually.not.equal("")
            .getText("#senttxamount")
            .should.eventually.equal("0.012345")
            .getText("#txtoaddress")
            .should.eventually.equal("mnJQyeDFmGjNoxyxKQC6MMFdpx77rYV3Bo")
    });



    it('should get my eth balance', () => {
        return app.client.waitUntilWindowLoaded()
            .setValue('#privatepass', ETH_PRIV)
            .getValue("#privatepass")
            .should.eventually.equal(ETH_PRIV)
            .click("//select/option[@value=\'ropsten\']")
            .click('#unlock_priv_key').pause(6000)
            .getText(".myaddress")
            .should.eventually.equal(correct_address)
            .getText("#ethbal")
            .should.eventually.equal("98.8754")
    });



});





describe('Coin App UI Testing', () => {
    let app;

    beforeEach(() => {
        return hooks.startApp().then((startedApp) => {app = startedApp});
    });
    afterEach(() => {
        return hooks.stopApp(app)
    });


    it('opens a window', () => {
        return app.client.waitUntilWindowLoaded()
            .getWindowCount().should.eventually.equal(1)
    });


    it('should save settings', () => {
    return app.client.waitUntilWindowLoaded()
        .click("#setup_panel-tab")
        .setValue('#setting_geth_server', "http://localhost:8545")
        .setValue('#setting_btc_server', "http://localhost:3001/api")
        .setValue('#setting_ltc_server', "http://localhost:3005/api")
        .getValue("#setting_geth_server")
        .should.eventually.equal("http://localhost:8545")
        .getValue("#setting_ltc_server")
        .should.eventually.equal("http://localhost:3005/api")
        .getValue("#setting_btc_server")
        .should.eventually.equal("http://localhost:3001/api")
        .click('#save_settings_btn')
    });


    it('should load settings', () => {
        return app.client.waitUntilWindowLoaded()
            .click("#setup_panel-tab")
            .getValue("#setting_geth_server")
            .should.eventually.equal("http://localhost:8545")
            .getValue("#setting_ltc_server")
            .should.eventually.equal("http://localhost:3005/api")
            .getValue("#setting_btc_server")
            .should.eventually.equal("http://localhost:3001/api")
    });



    it('should insert a ETH ROPSTEN private key', () => {
        return app.client.waitUntilWindowLoaded()
            .setValue('#privatepass', ETH_PRIV)
            .getValue("#privatepass")
            .should.eventually.equal(ETH_PRIV)
            .click("//select/option[@value=\'ropsten\']")
            .click('#unlock_priv_key').pause(4000)
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
            .click('#unlock_priv_key').pause(8000)
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
            .setValue('#setting_btc_server', "http://localhost:3001/api")
            .setValue('#setting_ltc_server', "http://localhost:3005/api")
            .getValue("#setting_geth_server")
            .should.eventually.equal("http://localhost:8545")
            .getValue("#setting_ltc_server")
            .should.eventually.equal("http://localhost:3005/api")
            .getValue("#setting_btc_server")
            .should.eventually.equal("http://localhost:3001/api")
            .click('#save_settings_btn')
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