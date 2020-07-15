var Engine = require('./engine').zeroc;
var util = require('../util');

const error = require('../constant/error');

class HardWallet {
  /**
   * @constructor
   * @param {*} net - Network id
   * @param {*} accOpts - accOpts = {
   *   signTransaction: (function) ...
   *   getAddress: (function) ...
   *   path: (string) ...
   *   index: (optional) ...
   * }
   */
  constructor(net) {
    this.network = util.getNetworkId(net, 'number');
  }

  /**
   * @func opts
   * Define optional functions for engine
   */
  opts = () => {
    return {
      dataHandler: () => { /* Turn off default logs */ },
      errorHandler: () => { /* Turn off default logs */ },
      getAccounts: (callback) => {
        return this.getAddress(this.dpath, (er, addr) => {
          if (er) return callback(er, null);
          if (!addr) return callback(null, []);
          return callback(null, [addr.toLowerCase()]);
        })
      },
      approveTransaction: (txParams, callback) => {
        return this.approveTransaction(txParams, (er, approved) => {
          if (er || !approved) return callback(error.USER_DENIED_TX, false);
          return callback(null, true);
        });
      },
      signTransaction: (txParams, callback) => {
        txParams.chainId = this.network;
        this.waitTransaction.open();
        return this.signTransaction(this.dpath, txParams, (er, signature) => {
          this.waitTransaction.close();
          if (er) return callback(er, null);
          let signedTx = util.genRawTx(txParams).raw;
          signedTx.v = Buffer.from(signature.v, 'hex');
          signedTx.r = Buffer.from(signature.r, 'hex');
          signedTx.s = Buffer.from(signature.s, 'hex');
          console.log(5, util.padHex(signedTx.serialize().toString('hex')))
          return callback(null, util.padHex(signedTx.serialize().toString('hex')));
        });
      },
      killSession: () => {
        return this.killSession();
      }
    }
  }

  /**
   * @func init
   * Initialize web3 
   * @param {*} accOpts 
   * @param {*} callback 
   */
  init = (accOpts, callback) => {
    accOpts = accOpts || {};
    const ok = this.setAccount(accOpts);
    this.dpath = util.addDPath(accOpts.path, accOpts.index);
    if (!ok) return callback(error.CANNOT_SET_ACCOUNT, null);
    const engine = new Engine(this.network, this.opts());
    // We used callback to fomalize code interface with other classes
    return callback(null, engine.web3);
  }

  /**
   * @func setAccount
   * Set up coinbase
   * @param {*} getAddress
   * @param {*} approveTransaction
   * @param {*} waitTransaction
   * @param {*} signTransaction
   * @param {*} killSession
   */
  setAccount = (accOpts) => {
    const { getAddress, approveTransaction, waitTransaction, signTransaction, killSession } = accOpts;
    if (!getAddress || typeof getAddress !== 'function') {
      console.error('getAddress must be a function');
      return false;
    }
    if (!approveTransaction || typeof approveTransaction !== 'function') {
      console.error('approveTransaction must be a function');
      return false;
    }
    if (!signTransaction || typeof signTransaction !== 'function') {
      console.error('signTransaction must be a function');
      return false;
    }
    if (!waitTransaction || typeof waitTransaction.open !== 'function' || typeof waitTransaction.close !== 'function') {
      console.error('waitTransaction must be a object of open function and close function');
      return false;
    }
    if (!killSession || typeof killSession !== 'function') {
      console.error('killSession must be a function');
      return false;
    }

    this.getAddress = getAddress;
    this.approveTransaction = approveTransaction;
    this.waitTransaction = waitTransaction;
    this.signTransaction = signTransaction;
    this.killSession = killSession;
    return true;
  }
}

module.exports = HardWallet;