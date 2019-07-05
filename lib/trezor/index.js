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
    let account = {
      getAddress: TrezorOne.getAddress,
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
    TrezorOne.getPublickey(path, (er, root) => {
      if (er) return callback(er, null);

      let addresses = util.deriveChild(limit, page, root.publicKey, root.chainCode).map(item => {
        let dpath = util.addDPath(path, item.index);
        cache.set('trezorOne-address-' + dpath, item.address);
        return item.address;
      });
      return callback(null, addresses);
    });
  }
}

module.exports = Trezor;