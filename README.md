# Introduction

🚀 CapsuleJS serves a friendly interface of several Ethereum wallets and that might help developers can instantly power their Dapps. CapsuleJS is an opensource and you can feel free to use it as well as contribute it.

* [View release log](./RELEASE.md)

# How to use?

## Install

```
npm install --save capsule-js
```

### Usage:

# API

## Metamask module

```
import { Metamask } from 'capsule-wallet';

var net = 4 \\ Your network id
var type = 'softwallet' \\ Don't modify it
var restrictMode = true \\ If true, this mode won't allow network changing. If false, vice versa.

var metamask = new Metamask(net, type, restrictMode);
metamask.setAccountByMetamask(function (er, re) {
  if (er) return console.error(er);

  console.log('Provider instance is:', metamask);
});
```

## MEW (MyEtherwallet) module

```
import { MEW } from 'capsule-wallet';

var net = 4 \\ Your network id
var type = 'hybridwallet' \\ Don't modify it
var restrictMode = true \\ If true, this mode won't allow network changing. If false, vice versa.

var getAuthentication = function(qrcode, callback) {
  // This function is to show off the QRcode to user
  // User must use MEW application on their phone to scan the QRcode and establish the connection
  // When the connection is established, callback will be called
}

var mew = new MEW(net, type, restrictMode);
mew.setAccountByMEW(getAuthentication, (er, re) => {
  if (er) return console.error(er);

  console.log('Provider instance is:', mew);
});
```

## Isoxys module

Isoxys is a group of software wallets. It includes mnemonic, keystore and private key. All of them are sensitive data, so we do not recommend to use it.

```
import { Isoxys } from 'capsule-wallet';

var net = 4 \\ Your network id
var type = 'softwallet' \\ Don't modify it
var restrictMode = true \\ If true, this mode won't allow network changing. If false, vice versa.

var getPassphrase = function(callback) {
  // This function to show off the input form
  // User must enter a temporary passphrase to protect the data in this session
  // When user entered passphrase, return callback(null, passphrase)
  // If denied, return callback('Reason msg', null)
}

var isoxys = new Isoxys(net, type, restrictMode);


// Privatekey

var privatekey = ... // Private key
isoxys.getAccountByPrivatekey(privatekey, (er, address) => {
  if (er) return console.error(er);

  console.log('Address:', address);
});

var privatekey = ... // Private key
isoxys.setAccountByPrivatekey(privatekey, getPassphrase, (er, re) => {
  if (er) return console.error(er);

  console.log('Provider instance is:', isoxys);
});


// Mnemonic

var mnemonic = ... // Mnemonic string
var password = ... // Mnemonic password
var path = ... // Derivation path
var limit = ... // The number of records in a page (pagination)
var page = ... // Page index (pagination)
isoxys.getAccountsByMnemonic(mnemonic, password, path, limit, page, (er, addresses) => {
  if (er) return console.error(er);

  console.log('Address list:', addresses);
});

var mnemonic = ... // Mnemonic string
var password = ... // Mnemonic password
var path = ... // Derivation path
var index = ... // Derivation child index
isoxys.setAccountByMnemonic(mnemonic, password, path, index, getPassphrase, (er, re) => {
  if (er) return console.error(er);

  console.log('Provider instance is:', isoxys);
});


// Keystore

var input = ... // Json object of keystore
var password = .. // Keystore password
isoxys.getAccountByKeystore(input, password, (er, address) => {
  if (er) return console.error(er);

  console.log('Address:', address);
});

var input = ... // Json object of keystore
var password = .. // Keystore password
isoxys.setAccountByKeystore(input, password, getPassphrase, (er, re) => {
  if (er) return console.error(er);

  console.log('Provider instance is:', isoxys);
});
```

## Ledger module

```
import { Ledger } from 'capsule-wallet';

var net = 4 \\ Your network id
var type = 'hardwallet' \\ Don't modify it
var restrictMode = true \\ If true, this mode won't allow network changing. If false, vice versa.

var ledger = new Ledger(net, type, restrictMode);

var path = ... // Derivation path
var limit = ... // The number of records in a page (pagination)
var page = ... // Page index (pagination)
ledger.getAccountsByLedgerNanoS(path, limit, page, (er, addresses) => {
  if (er) return console.error(er);

  console.log('Address list:', addresses);
});

var path = ... // Derivation path
var index = ... // Derivation child index
ledger.setAccountByLedgerNanoS(path, index, (er, re) => {
  if (er) return console.error(er);

  console.log('Provider instance is:', ledger);
});
```

## Trezor module

```
import { Trezor } from 'capsule-wallet';

var net = 4 \\ Your network id
var type = 'hardwallet' \\ Don't modify it
var restrictMode = true \\ If true, this mode won't allow network changing. If false, vice versa.

var trezor = new Trezor(net, type, restrictMode);

var path = ... // Derivation path
var limit = ... // The number of records in a page (pagination)
var page = ... // Page index (pagination)
trezor.getAccountsByTrezorOne(path, limit, page, (er, addresses) => {
  if (er) return console.error(er);

  console.log('Address list:', addresses);
});

var path = ... // Derivation path
var index = ... // Derivation child index
trezor.setAccountByTrezorOne(path, index, (er, re) => {
  if (er) return console.error(er);

  console.log('Provider instance is:', trezor);
});
```

## Fetch account info

After received a `provider` instance. You can fetch account info by `fetch` function.

```
provider.fetch().then(result => {
  console.log('Result:', result);
}).catch(error => {
  console.log('Error:', error);
});
```

## Watch changes of account info

After received a `provider` instance. You can watch account info if any changes by `watch` function.

```
provider.watch().then(watcher => {
  watcher.event.on('data', result => {
    console.log('Result:', result);
  });
  watcher.event.on('error', error => {
    console.log('Error:', error);
  });
}).catch(er => {
  console.log('Error:', error);
});
```

To stop watching,

```
watcher.stopWatching();
```

# Examples

```
import React, { Component } from 'react';
import { Isoxys } from 'capsule-wallet';

const NETWORK = 'rinkeby';
const TYPE = 'softwallet';
const RESTRICT = true;

const accOpts = {
  mnemonic: 'expand lake',
  password: null,
  path: "m/44'/60'/0'/0",
  i: 0
}

class Example extends Component {
  constructor() {
    super();

    this.isoxys = new Isoxys(NETWORK, TYPE, RESTRICT);
  }

  componentDidMount() {
    var self = this;
    this.isoxys.setAccountByMnemonic(accOpts.mnemonic, accOpts.password, accOpts.path, accOpts.index, this.getPassphrase, (er, re) => {
      if (er) return console.error(er);

      console.log('Provider instance is:', self.isoxys);
    });
  }

  getPassphrase(callback) {
    var passphrase = window.prompt('Please enter passphrase:');
    if (!passphrase) return callback('User denied signing transaction', null);
    return callback(null, passphrase);
  }
}

export default Example;
```

## How to test?

### E2E test

```
npm test
```

## Appendix

### Cheatsheet

|   #   | Commands        | Descriptions                  |
| :---: | --------------- | ----------------------------- |
|   1   | `npm install`   | Install module packages       |
|   2   | `npm run build` | Build libraries in production |
|   3   | `npm test`      | Run test                      |