#!/usr/bin/env bash

if [[ "$TRAVIS_OS_NAME" == "linux" ]]; then
  export DISPLAY=:99.0
  sh -e /etc/init.d/xvfb start
  sleep 3
fi

npm install -g ganache-cli

node --version
npm --version
npm install

ganache-cli -d 75.12345 --seed visit exotic maximum -a 10 > /dev/null &

sleep 30

# 0xe78a0f7e598cc8b0bb87894b0f60dd2a88d6a8ab
curl -X POST -H 'Content-Type: application/json' -d @test/newcoin.json http://localhost:8545

export NODE_ENV='test'

mocha