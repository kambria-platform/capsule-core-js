var WalletInterface = require('../interface/walletInterface');
var cache = require('../storage').cache;
var util = require('../util');
var Provider = require('../provider');
var TrezorOne = require('./trezorOne');

class Trezor extends WalletInterface {
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
   * Trezor One
   */

  /**
   * @func setAccountByTrezorOne
   * Set account by Trezor One
   * @param {*} path - root derivation path (m/44'/60'/0'/0 as default)
   * @param {*} index - (optional)
   */
  setAccountByTrezorOne = (path, index, callback) => {
    let getAddress = (dpath, callback) => {
      let loadedAddressFromCache = cache.get('trezorOne-address-' + dpath);
      if (loadedAddressFromCache) return callback(null, loadedAddressFromCache);
      return TrezorOne.getAddress(dpath, (er, address) => {
        if (er) return callback(er, null);
        
        cache.set('trezorOne-address-' + dpath, address);
        return callback(null, address);
      });
    }
    let account = {
      getAddress: getAddress,
      signTransaction: TrezorOne.signTransaction,
      path: path,
      index: index
    }
    this.setWallet(account, callback);
  }

  /**
   * @func getAccountsByTrezorOne
   * Get list of accounts by Trezor One
   * @param {*} path - root derivation path (m/44'/60'/0'/0 as default)
   * @param {*} limit 
   * @param {*} page 
   */
  getAccountsByTrezorOne = (path, limit, page, callback) => {
    let done = (root) => {
      let addresses = util.deriveChild(limit, page, root.publicKey, root.chainCode).map(item => {
        cache.set('trezorOne-address-' + util.addDPath(path, item.index), item.address);
        return item.address;
      });
      return callback(null, addresses);
    }

    let loadedRootFromCache = cache.get('trezorOne-root-' + path);
    if (loadedRootFromCache) return done(loadedRootFromCache);
    TrezorOne.getPublickey(path, (er, root) => {
      if (er) return callback(er, null);

      cache.set('trezorOne-root-' + path, root);
      return done(root);
    });
  }
}

module.exports = Trezor;