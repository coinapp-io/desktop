
function TransactionURL(hash) {
    if (process.env.NODE_ENV=='test'){
        return "https://ropsten.etherscan.io/tx/"+hash;
    } else {
        return "https://etherscan.io/tx/"+hash;
    }
    return "https://etherscan.io/tx/"+hash;
}


function EthereumURL(address) {
    if (process.env.NODE_ENV=='test'){
        return "https://ropsten.etherscan.io/address/"+address;
    } else {
        return "https://etherscan.io/address/"+address;
    }
    return "https://etherscan.io/address/"+address;
}

function ETHtoFloat(eth) {
    return parseFloat(ethers.utils.formatEther(eth.toString()));
}

function TokenToFloat(balance, decimals) {
    return ethers.utils.formatUnits(balance.toString(), parseInt(decimals)).toString();
}
