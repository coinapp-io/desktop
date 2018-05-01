#!/usr/bin/env bash

wget -q https://raw.githubusercontent.com/MyEtherWallet/ethereum-lists/master/tokens/tokens-eth.json

mv tokens-eth.json js/tokens-eth.json

echo "New ERC20 token list has been downloaded"