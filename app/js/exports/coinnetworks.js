module.exports = {
    bitcoin: {
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bech32: 'bc',
        bip32: {
            public: 0x0488b21e,
            private: 0x0488ade4
        },
        pubKeyHash: 0x00,
        scriptHash: 0x05,
        wif: 0x80
    },
    testnet: {
        messagePrefix: '\x18Bitcoin Signed Message:\n',
        bech32: 'tb',
        bip32: {
            public: 0x043587cf,
            private: 0x04358394
        },
        pubKeyHash: 0x6f,
        scriptHash: 0xc4,
        wif: 0xef
    },
    litecoin: {
        messagePrefix: '\x19Litecoin Signed Message:\n',
        bip32: {
            public: 0x019da462,
            private: 0x019d9cfe
        },
        pubKeyHash: 0x30,
        scriptHash: 0x32,
        wif: 0xb0
    },
    litecointest: {
        messagePrefix: '\x19Litecoin Signed Message:\n',
        bip32: {
            public: 0x043587cf,
            private: 0x04358394
        },
        pubKeyHash: 0x6f,
        scriptHash: 0xc4, //  for segwit (start with 2)
        wif: 0xef
    },
    dogecoin: {
        messagePrefix: '\x19Dogecoin Signed Message:\n',
        bip32: {
            public: 0x02facafd,
            private: 0x02fac398
        },
        pubKeyHash: 0x1e,
        scriptHash: 0x16,
        wif: 0x9e
    },
    zcash: {
        messagePrefix: '\x19Zcash Signed Message:\n',
        bip32: {
            public: 0x0488b21e,
            private: 0x0488ade4
        },
        pubKeyHash: 0x00,
        scriptHash: 0x05,
        wif: 0x80
    },
    zcash_test: {
        messagePrefix: '\x19Zcash Signed Message:\n',
        bip32: {
            public: 0x043587cf,
            private: 0x04358394
        },
        pubKeyHash: 0x6f,
        scriptHash: 0xc4,
        wif: 0xef
    }
}
