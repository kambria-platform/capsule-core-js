var Engine = require('./engine').zeroc;
var util = require('../util');

const error = require('../constant/error');

class HybridWallet {
  /**
   * @constructor
   * @param {*} net - Network id
   * @param {*} accOpts - accOpts = {
   *   signTransaction: (function) ...
   *   getAddress: (function) ...
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
        this.getAddress((er, addr) => {
          if (er) return callback(er, null);
          if (!addr) return callback(null, []);
          return callback(null, [addr.toLowerCase()]);
        })
      },
      approveTransaction: (txParams, callback) => {
        return callback(null, true);
      },
      signTransaction: (txParams, callback) => {
        txParams.chainId = this.network;
        if (!txParams.data) txParams.data = '';
        this.signTransaction(JSON.stringify(txParams), (er, signature) => {
          if (er) return callback(er, null);
          let signedTx = util.genSignedTx(signature);
          return callback(null, signedTx);
        });
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
    let engine = new Engine(this.network, this.opts());
    let ok = this.setAccount(accOpts.getAddress, accOpts.signTransaction);
    if (!ok) return callback(error.CANNOT_SET_ACCOUNT, null);
    // We used callback to fomalize code interface with other classes
    return callback(null, engine.web3);
  }

  /**
   * @func setAccount
   * Set up coinbase
   * @param {*} getAddress 
   * @param {*} signTransaction 
   */
  setAccount = (getAddress, signTransaction) => {
    if (!getAddress || typeof getAddress !== 'function') {
      console.error('getAddress must be a function');
      return false;
    }
    if (!signTransaction || typeof signTransaction !== 'function') {
      console.error('signTransaction must be a function');
      return false;
    }

    this.getAddress = getAddress;
    this.signTransaction = signTransaction;
    return true;
  }
}

module.exports = HybridWallet;