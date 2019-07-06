var WalletInterface = require('../interface/walletInterface');
var cache = require('../storage').cache;
var util = require('../util');
var Provider = require('../provider');
var LedgerNanoS = require('./ledgerNanoS');


class Ledger extends WalletInterface {
  constructor(net, type, restrict) {
    super(net, type, restrict);
  }

  /**
   * @func setWallet
   * (Internal function) Set up acc to storage that can be used as a wallet
   * @param {*} accOpts 
   */
  setWallet = (accOpts, callback) => {
    this.provider = new Provider.HardWallet(this.net);
    this.provider.init(accOpts, (er, web3) => {
      if (er) return callback(er, null);
      this.web3 = web3;
      return callback(null, web3);
    });
  }

  /**
   * LEDGER Nano S
   */

  /**
   * @func setAccountByLedgerNanoS
   * Set account by Ledger Nano S
   * @param {*} path - root derivation path (m/44'/60'/0'/0 as default)
   * @param {*} index - (optional)
   */
  setAccountByLedgerNanoS = (path, index, callback) => {
    let getAddress = (dpath, callback) => {
      let loadedAddressFromCache = cache.get('ledgerNanoS-address-' + dpath);
      if (loadedAddressFromCache) return callback(null, loadedAddressFromCache);
      return TrezorOne.getAddress(dpath, callback);
    }
    let account = {
      getAddress: getAddress,
      signTransaction: LedgerNanoS.signTransaction,
      path: path,
      index: index
    }
    this.setWallet(account, callback);
  }

  /**
   * @func getAccountsByLedgerNanoS
   * Get list of accounts by Ledger Nano S
   * @param {*} path - root derivation path (m/44'/60'/0'/0 as default)
   * @param {*} limit 
   * @param {*} page 
   */
  getAccountsByLedgerNanoS = (path, limit, page, callback) => {
    let done = (root) => {
      let addresses = util.deriveChild(limit, page, root.publicKey, root.chainCode).map(item => {
        cache.set('ledgerNanoS-address-' + util.addDPath(path, item.index), item.address);
        return item.address;
      });
      return callback(null, addresses);
    }

    let loadedRootFromCache = cache.get('ledgerNanoS-root-' + path);
    if (loadedRootFromCache) return done(loadedRootFromCache);
    LedgerNanoS.getPublickey(path, (er, root) => {
      if (er) return callback(er, null);

      return done(root);
    });
  }
}

module.exports = Ledger;