const CoinTransaction = require('../../app/js/exports/cointransaction');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
global.before(() => {
    chai.should();
    chai.use(chaiAsPromised);
});



describe("CoinTransaction() Functions", function() {

    it('create an ethereum transaction', function() {
        let newTx = CoinTransaction.NewTransaction("eth", "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1", "0xEac8E27930E7D20795FBB465D0e48D48b9F8137e", 10000000000);
        return expect(newTx).to.be.fulfilled
            .then(function(d) {
                expect(d.to).to.equal("0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1");
                expect(d.value).to.equal("0x2540be400");
            });
    });


    it('create an erc20 token transaction', function() {
        let newTx = CoinTransaction.NewTokenTransaction("eth", "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1", "0xEac8E27930E7D20795FBB465D0e48D48b9F8137e", "0xEac8E27930E7D20795FBB465D0e48D48b9F8137e", 10000000000, 8);
        return expect(newTx).to.be.fulfilled
            .then(function(d) {
                console.log("tx data:", d);
                expect(d.to).to.equal("0xEac8E27930E7D20795FBB465D0e48D48b9F8137e");
                expect(d.data).to.equal("0xa9059cbb00000000000000000000000090f8bf6a479f320ead074411a4b0e7944ea8c9c10000000000000000000000000000000000000000000000000de0b6b3a7640000");
            });
    });


    it('create an bitcoin transaction', function() {
        let newTx = CoinTransaction.NewTransaction("btc", "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1", "0xEac8E27930E7D20795FBB465D0e48D48b9F8137e", 10000000000);
        return expect(newTx).to.be.fulfilled
            .then(function(d) {
                expect(d.to).to.equal("0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1");
                expect(d.value).to.equal("0x2540be400");
            });
    });

    // it('create an token transaction', function() {
    //     let tx =  CoinTransaction.NewTokenTransaction("ropsten", "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1", "0xEac8E27930E7D20795FBB465D0e48D48b9F8137e", "0xEac8E27930E7D20795FBB465D0e48D48b9F8137e", 10000);
    //     expect(tx.value).to.equal("0x0");
    //     expect(tx.data).to.equal("0xa9059cbb000000000000000000000000eac8e27930e7d20795fbb465d0e48d48b9f8137e000000000000000000000000000000000000000000000000000000e8d4a51000");
    // });


});

