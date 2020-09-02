var ethUtil = require('ethereumjs-util');
var Engine = require('./engine').zeroc;
var util = require('../util');

const error = require('../constant/error');

class LiteWallet {
  /**
   * @constructor
   * @param {*} net - Network id
   * @param {*} accOpts - accOpts = {
   *   address: ...
   *   privateKey: ...
   * }
   */
  constructor(net) {
    this.network = util.getNetworkId(net, 'number');
    this.acc = null;
  }

  /**
   * @func opts
   * Define optional functions for engine
   */
  opts = () => {
    return {
      dataHandler: () => { /* Turn off default logs */ },
      errorHandler: () => { /* Turn off dÎefault logs */ },
      getAccounts: (callback) => {
        let accounts = this.getAddress();
        return callback(null, accounts);
      },
      approveTransaction: (txParams, callback) => {
        return callback(null, true);
      },
      signTransaction: (txParams, callback) => {
        const priv = this.getPrivateKey();
        if (!priv) return callback(error.CANNOT_UNLOCK_ACCOUNT, null);
        txParams.chainId = this.network;
        const signedTx = util.signRawTx(txParams, priv);
        return callback(null, signedTx);
      },
      killSession: () => {
        // Interface consistency
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
    return this.setAccount(accOpts, (er, re) => {
      if (er || !re) return callback(error.CANNOT_SET_ACCOUNT, null);
      return callback(null, engine.web3);
    });
  }

  /**
   * @func setAccount
   * Set up coinbase (internal function)
   * @param {string} address
   * @param {string} privateKey
   */
  setAccount = (accOpts, callback) => {
    let { address, privateKey } = accOpts;
    if (!address || !privateKey) return callback(error.CANNOT_GET_ACCOUNT, null);

    address = address.toLowerCase();
    privateKey = privateKey.toLowerCase();
    if (!this.validatePrivateKey(address, privateKey)) return callback(error.CANNOT_GET_ACCOUNT, null);

    this.acc = { address, privateKey };
    return callback(null, this.acc);
  }

  /**
   * @func validatePrivateKey
   * Double check the pair of address/privatekey
   * @param {*} addr 
   * @param {*} priv 
   */
  validatePrivateKey = (addr, priv) => {
    try {
      if (!addr || !priv) return false;
      priv = new Buffer(priv, 'hex');
      let valid = ethUtil.isValidPrivate(priv);
      let _addr = '0x' + ethUtil.privateToAddress(priv).toString('hex');
      valid = valid && (_addr === addr);
      return valid;
    } catch (er) {
      if (er) return false;
    }
  }

  /**
   * Get addresses
   */
  getAddress = () => {
    if (!this.acc || typeof this.acc !== 'object') return [];
    return [this.acc.address];
  }
  getPrivateKey = () => {
    if (!this.acc || typeof this.acc !== 'object') return null;
    return this.acc.privateKey;
  }
}

module.exports = LiteWallet;