var tokenList = [];
var address;
var testest = [];
onmessage = function(e) {
    console.log(e)
    tokenList = e.data.tokens;
    address = e.data.address;
    ParseTokenList();
};
var HttpClient = function() {
    this.get = function(aUrl, obj, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() {
            if(anHttpRequest.readyState == 4 && anHttpRequest.status == 200) aCallback(anHttpRequest.responseText, obj);
        }
        anHttpRequest.open("GET", aUrl, true);
        anHttpRequest.send(null);
    }
}

function ParseTokenList() {
    var count = 1;
    for(i = 0; i < tokenList.length; i++) {
        var name = tokenList[i].name;
        var contract = tokenList[i].address;
        var decimals = tokenList[i].decimals;
        var symbol = tokenList[i].symbol;
        var obj = {
            address: contract,
            symbol: symbol,
            decimals: decimals,
            name: name,
            balance: 0
        };
        var client = new HttpClient();
        var url = 'https://api.tokenbalance.com/balance/' + contract + '/' + address;
        client.get(url, obj, function(response, obj) {
            obj.balance = response;
            postMessage(obj);
        });
    }
}