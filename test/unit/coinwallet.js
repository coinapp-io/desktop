const CoinWallet = require('../../app/js/exports/coinwallet');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
global.before(() => {
    chai.should();
    chai.use(chaiAsPromised);
});

describe("CoinWallet() Functions", function() {

    it('make new Etheruem wallet', function() {
        let wallet = CoinWallet.NewWallet("eth", "4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d");
        return expect(wallet).to.be.fulfilled
            .then(function(d) {
                expect(d.balance()).to.be.fulfilled
                    .then(function(bal) {
                        return expect(bal).to.equal("0");
                    });
                expect(d.address).to.equal("0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1");
            });
    });


    it('make new Ropsten wallet', function() {
        let wallet = CoinWallet.NewWallet("ropsten", "4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d");
        return expect(wallet).to.be.fulfilled
            .then(function(d) {
                expect(d.balance()).to.be.fulfilled
                    .then(function(bal) {
                        return expect(bal.toString()).to.equal("2842741872253934072");
                    });
                expect(d.address).to.equal("0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1");
            });
    });

    it('make new Bitcoin wallet', function() {
        let wallet = CoinWallet.NewWallet("btc", "L1vv1jRRbenk1CN8tBkFhqTUbw78VBs8FaAEnZFVksS42z3YXnyt");
        return expect(wallet).to.be.fulfilled
            .then(function(d) {
                expect(d.utxos()).to.be.fulfilled
                    .then(function(utxos) {
                        return expect(utxos.length).to.equal(0);
                    });
                expect(d.address).to.equal("1L99qwuiz75wShPAZT1kzvQQYy27w4hUw5");
            });
    });

    it('make new Bitcoin Test wallet', function() {
        let wallet = CoinWallet.NewWallet("btctest", "cVVGgzVgcc5S3owCskoneK8R1BNGkBveiEcGDaxu8RRDvFcaQaSG");
        return expect(wallet).to.be.fulfilled
            .then(function(d) {
                expect(d.utxos()).to.be.fulfilled
                    .then(function(utxos) {
                        return expect(utxos.length).to.equal(0);
                    });
                expect(d.address).to.equal("mnJQyeDFmGjNoxyxKQC6MMFdpx77rYV3Bo");
            });
    });

    it('make new Litecoin wallet', function() {
        let wallet = CoinWallet.NewWallet("ltc", "T9GW6YBuQiqQ5sY6kokKCAb3MBsy94jisPapwoe7juxDYfgKvDye");
        return expect(wallet).to.be.fulfilled
            .then(function(d) {
                expect(d.utxos()).to.be.fulfilled
                    .then(function(utxos) {
                        return expect(utxos.length).to.equal(0);
                    });
                expect(d.address).to.equal("LMHKBWBKXhfqpTg6cJoti1zyUvMYSSLkKP");
            });
    });

    it('make new Litecoin Test wallet', function() {
        let wallet = CoinWallet.NewWallet("ltctest", "cVVGgzVgcc5S3owCskoneK8R1BNGkBveiEcGDaxu8RRDvFcaQaSG");
        return expect(wallet).to.be.fulfilled
            .then(function(d) {
                expect(d.utxos()).to.be.fulfilled
                    .then(function(utxos) {
                        return expect(utxos.length).to.equal(0);
                    });
                expect(d.address).to.equal("mnJQyeDFmGjNoxyxKQC6MMFdpx77rYV3Bo");
            });
    });

});

