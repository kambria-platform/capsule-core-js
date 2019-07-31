var WalletInterface = require('../interface/walletInterface');
var { cache } = require('../storage');
var util = require('../util');
var Provider = require('../provider');
var LedgerNanoS = require('./ledgerNanoS');


class Ledger extends WalletInterface {
  /**
   * Constructor
   * @param {*} net 
   * @param {*} options - extra options for specific wallets
   * getWaiting
   * getApproval
   */
  constructor(net, options) {
    super(net, 'hardwallet');

    /**
     * Init options
     */
    let { getWaiting, getApproval } = options;
    if (!getWaiting || !getApproval) throw new Error('Invalid options');
    this.getWaiting = getWaiting;
    this.getApproval = getApproval;
  }

  /**
   * @func setWallet
   * (Internal function) Set up acc to storage that can be used as a wallet
   * @param {*} accOpts 
   */
  setWallet = (accOpts, callback) => {
    this.provider = new Provider.HardWallet(this.net);
    accOpts.waitTransaction = this.getWaiting;
    accOpts.approveTransaction = this.getApproval;
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
      return LedgerNanoS.getAddress(dpath, (er, address) => {
        if (er) return callback(er, null);

        cache.set('ledgerNanoS-address-' + dpath, address);
        return callback(null, address);
      });
    }
    let killSession = () => {
      cache.removeAll();
    }
    let account = {
      getAddress: getAddress,
      signTransaction: LedgerNanoS.signTransaction,
      killSession: killSession,
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

      cache.set('ledgerNanoS-root-' + path, root);
      return done(root);
    });
  }
}

module.exports = Ledger;