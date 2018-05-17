#!/usr/bin/env bash

PWD=`pwd`

node --version
npm --version

npm install

npm run fetch-list

npm run icon

npm run release

echo "Signed Build for Mac and Linux is complete."