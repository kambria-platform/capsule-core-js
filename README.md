# Introduction

🚀 Capsule-Core-JS serves a friendly interface of several Ethereum wallets and that might help developers can instantly power their Dapps. Capsule-Core-JS is an opensource and you can feel free to use it as well as contribute it.

* [View release log](./RELEASE.md)

# How to use?

## Install

```
npm install --save capsule-core-js
```

### Usage:

# API

## NonWallet module

In case you would like to fetch some info from blockchain without account association, `NonWallet` is for you.

```
import { NonWallet } from 'capsule-core-js';

var net = 4 \\ Your network id

var nonWallet = new NonWallet(net);
nonWallet.init((er, web3) => {
  if (er) return console.error(er);

  console.log('Provider instance is:', nonWallet);
});
```

## Metamask module

```
import { Metamask } from 'capsule-core-js';

var net = 4 \\ Your network id

var metamask = new Metamask(net);
metamask.setAccountByMetamask((er, web3) => {
  if (er) return console.error(er);

  console.log('Provider instance is:', metamask);
});
```

## MEW (MyEtherwallet) module

```
import { MEW } from 'capsule-core-js';

var net = 4 \\ Your network id

var getApproval = (txParams, callback) => {
  // This function is show off the approval with transaction's params
  // When user approve, return callback(null, true)
  // If denied, return callback(null, false)
}

var getAuthentication = {
  open: (qrcode, callback) => {
    // This function is to show off the QRcode to user
    // User must use MEW application on their phone to scan the QRcode and establish the connection
    // When the connection is established, callback will be called
  },
  close: () => {
    // Turn off the modal
  }
}

const options = {
  getApproval,
  getAuthentication
}

var mew = new MEW(net, options);

mew.getAccountsByMEW((er, web3) => {
  if (er) return console.error(er);

  console.log('Provider instance is:', mew);
});

mew.setAccountByMEW((er, web3) => {
  if (er) return console.error(er);

  console.log('Provider instance is:', mew);
});
```

## Trust (MyEtherwallet) module

```
import { Trust } from 'capsule-core-js';

var net = 4 \\ Your network id

var getApproval = (txParams, callback) => {
  // This function is show off the approval with transaction's params
  // When user approve, return callback(null, true)
  // If denied, return callback(null, false)
}

var getAuthentication = {
  open: (qrcode, callback) => {
    // This function is to show off the QRcode to user
    // User must use Trust wallet on their phone to scan the QRcode and establish the connection
    // When the connection is established, callback will be called
  },
  close: () => {
    // Turn off the modal
  }
}

const options = {
  getApproval,
  getAuthentication
}

var trust = new Trust(net, options);

trust.getAccountsByTrustWallet((er, web3) => {
  if (er) return console.error(er);

  console.log('Provider instance is:', mew);
});

trust.setAccountByTrustWallet((er, web3) => {
  if (er) return console.error(er);

  console.log('Provider instance is:', mew);
});
```


## Isoxys module

Isoxys is a group of software wallets. It includes mnemonic, keystore and private key. All of them are sensitive data, so we do not recommend to use it.

```
import { Isoxys } from 'capsule-core-js';

var net = 4 \\ Your network id

var getApproval = (txParams, callback) => {
  // This function is show off the approval with transaction's params
  // When user approve, return callback(null, true)
  // If denied, return callback(null, false)
}

var getPassphrase = (callback) => {
  // This function is to show off the input form
  // User must enter a temporary passphrase to protect the data in this session
  // When user entered passphrase, return callback(null, passphrase)
  // If denied, return callback('Reason msg', null)
}

const options = {
  getApproval,
  getPassphrase
}

var isoxys = new Isoxys(net, options);


// Privatekey

var privatekey = ... // Private key
isoxys.getAccountByPrivatekey(privatekey, (er, address) => {
  if (er) return console.error(er);

  console.log('Address:', address);
});

var privatekey = ... // Private key
isoxys.setAccountByPrivatekey(privatekey, (er, web3) => {
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
isoxys.setAccountByMnemonic(mnemonic, password, path, index, (er, web3) => {
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
isoxys.setAccountByKeystore(input, password, (er, web3) => {
  if (er) return console.error(er);

  console.log('Provider instance is:', isoxys);
});
```

## Ledger module

```
import { Ledger } from 'capsule-core-js';

var net = 4 \\ Your network id

var getApproval = (txParams, callback) => {
  // This function is show off the approval with transaction's params
  // When user approve, return callback(null, true)
  // If denied, return callback(null, false)
}

var getWaiting = {
  open: () => {
    // Open waiting modal
  },
  close: () => {
    // Close waiting modal
  }
}

const options = {
  getApproval,
  getWaiting
}

var ledger = new Ledger(net, options);

var path = ... // Derivation path
var limit = ... // The number of records in a page (pagination)
var page = ... // Page index (pagination)
ledger.getAccountsByLedgerNanoS(path, limit, page, (er, addresses) => {
  if (er) return console.error(er);

  console.log('Address list:', addresses);
});

var path = ... // Derivation path
var index = ... // Derivation child index
ledger.setAccountByLedgerNanoS(path, index, (er, web3) => {
  if (er) return console.error(er);

  console.log('Provider instance is:', ledger);
});
```

## Trezor module

```
import { Trezor } from 'capsule-core-js';

var net = 4 \\ Your network id

var getApproval = (txParams, callback) => {
  // This function is show off the approval with transaction's params
  // When user approve, return callback(null, true)
  // If denied, return callback(null, false)
}

var getWaiting = {
  open: () => {
    // Open waiting modal
  },
  close: () => {
    // Close waiting modal
  }
}

const options = {
  getApproval,
  getWaiting
}

var trezor = new Trezor(net, options);

var path = ... // Derivation path
var limit = ... // The number of records in a page (pagination)
var page = ... // Page index (pagination)
trezor.getAccountsByTrezorOne(path, limit, page, (er, addresses) => {
  if (er) return console.error(er);

  console.log('Address list:', addresses);
});

var path = ... // Derivation path
var index = ... // Derivation child index
trezor.setAccountByTrezorOne(path, index, (er, web3) => {
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
let watcher = provider.watch((er, re) => {
  if(er) return console.error(er);

  // Called only when having a change.
  console.log(re);
});
```

To stop watching,

```
watcher.stopWatching();
```

# Examples

```
import React, { Component } from 'react';
import { Isoxys } from 'capsule-core-js';

const NETWORK = 'rinkeby';

const accOpts = {
  mnemonic: 'expand lake',
  password: null,
  path: "m/44'/60'/0'/0",
  i: 0
}

class Example extends Component {
  constructor() {
    super();

    this.options = {
      getApprove: this.getApprove,
      getPassphrase: this.getPassphrase
    }
    this.isoxys = new Isoxys(NETWORK, this.options);
  }

  componentDidMount() {
    this.isoxys.setAccountByMnemonic(accOpts.mnemonic, accOpts.password, accOpts.path, accOpts.index, (er, re) => {
      if (er) return console.error(er);

      console.log('Provider instance is:', this.isoxys);
    });
  }

  getApprove = (txParams, callback) => {
    var approved = window.confirm(JSON.stringify(tx, txParams));
    if (approved) return callback(null, true);
    return callback(null, false);
  }

  getPassphrase = (callback) => {
    var passphrase = window.prompt('Please enter passphrase:');
    if (!passphrase) return callback('User denied signing transaction', null);
    return callback(null, passphrase);
  }
}

export default Example;
```

## How to test?

Because this package supports many wallets that were built for many enviroments, many purposes by many parties. As a complex result, a general test scheme is very difficult. We might implement e2e tests by utilizing React as a redering machine for running Selenium, Mocha and Chai.

The related folder for testing comprises `public`, `src` (React folders) and `test` (Test descriptions).

### E2E test

```
npm test
```

### Tool test

```
npm start
```

## Appendix

### Cheatsheet

|   #   | Commands        | Descriptions                  |
| :---: | --------------- | ----------------------------- |
|   1   | `npm install`   | Install module packages       |
|   2   | `npm run build` | Build libraries in production |
|   3   | `npm test`      | Run e2e test                  |
|   4   | `npm start`     | Run tool test                 |