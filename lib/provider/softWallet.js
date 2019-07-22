var ethUtil = require('ethereumjs-util');
var cryptoJS = {
  AES: require('crypto-js/aes'),
  PBKDF2: require('crypto-js/pbkdf2'),
  enc: { Utf8: require('crypto-js/enc-utf8') },
  lib: { WordArray: require('crypto-js/lib-typedarrays') }
}
var Engine = require('./engine').zeroc;
var { sessionStorage } = require('../storage');
var util = require('../util');

const error = require('../constant/error');

class SoftWallet {
  /**
   * @constructor
   * @param {*} net - Network id
   * @param {*} accOpts - accOpts = {
   *   address: ...
   *   privateKey: ...
   *   getPassphrase: ...
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
      errorHandler: () => { /* Turn off dÎefault logs */ },
      getAccounts: (callback) => {
        let accounts = this.getAddress();
        return callback(null, accounts);
      },
      approveTransaction: (txParams, callback) => {
        return callback(null, true);
      },
      signTransaction: (txParams, callback) => {
        txParams.chainId = this.network;
        this.getPassphrase((er, passphrase) => {
          if (er || !passphrase) return callback(error.CANNOT_UNLOCK_ACCOUNT, null);
          let priv = this.unlockAccount(passphrase);
          if (!priv) return callback(error.CANNOT_UNLOCK_ACCOUNT, null);
          let signedTx = util.signRawTx(txParams, priv);
          return callback(null, signedTx);
        });
      },
      killSession: () => {
        sessionStorage.remove();
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
    this.getPassphrase = accOpts.getPassphrase;
    let engine = new Engine(this.network, this.opts());
    if (!accOpts.address || !accOpts.privateKey) return callback(null, engine.web3);
    this.setAccount(accOpts.address, accOpts.privateKey, accOpts.getPassphrase, (er, re) => {
      if (er) return callback(error.CANNOT_SET_ACCOUNT, null);
      return callback(null, engine.web3);
    });
  }

  /**
   * @func setAccount
   * Set up coinbase (internal function)
   * @param {string} address 
   * @param {string} privateKey 
   * @param {function} passphrase 
   */
  setAccount = (address, privateKey, getPassphrase, callback) => {
    if (!address || !privateKey) return callback('Address or Private Key must be not null', null);
    if (!this.validatePrivateKey(address, privateKey)) return callback('Invalid address or private key', null);
    if (!getPassphrase || typeof getPassphrase !== 'function') return callback('getPassphrase must be not a function', null);

    address = address.toLowerCase();
    privateKey = privateKey.toLowerCase();
    getPassphrase((er, passphrase) => {
      if (er) return callback(er, null);
      if (!passphrase) return callback(er, 'User denied unlocking account');

      passphrase = passphrase.toString();
      let salt = cryptoJS.lib.WordArray.random(128 / 8);
      let password = this.constructPassword(passphrase, salt);
      if (!password) return callback('Cannot set up password', null);

      let encryptedPriv = cryptoJS.AES.encrypt(privateKey, password).toString();
      let acc = {
        ADDRESS: address,
        ENCRYPTED_PRIVATEKEY: encryptedPriv,
        SALT: salt
      };

      sessionStorage.set(acc);
      return callback(null, acc);
    });
  }

  /**
   * @func validatePrivateKey
   * Double check the pair of address/privatekey
   * @param {*} addr 
   * @param {*} priv 
   */
  validatePrivateKey = (addr, priv) => {
    if (!addr || !priv) return false;
    priv = new Buffer(priv, 'hex');
    let valid = true;
    valid = valid && ethUtil.isValidPrivate(priv);
    let _addr = '0x' + ethUtil.privateToAddress(priv).toString('hex');
    valid = valid && (_addr === addr);
    return valid;
  }

  /**
   * @func constructPassword
   * Construct password from passphrase and salt
   * @param {*} passphrase 
   * @param {*} salt 
   */
  constructPassword = (passphrase, salt) => {
    if (!passphrase || !salt) return null;
    let password = cryptoJS.PBKDF2(passphrase, salt, { keySize: 512 / 32, iterations: 1000 });
    return password.toString();
  }

  /**
   * @func unlockAccount
   * Internal function, that acctually does unlocking acc.
   * @param {*} passphrase 
   */
  unlockAccount = (passphrase) => {
    try {
      let password = this.constructPassword(passphrase, this.getSalt());
      let enpriv = this.getEncryptedPrivateKey();
      if (!password || !enpriv) return null;
      let priv = cryptoJS.AES.decrypt(enpriv, password);
      if (!priv) return null;
      priv = priv.toString(cryptoJS.enc.Utf8);
      return priv;
    } catch (er) { return null; } // Try catch unexpected Error
  }

  /**
   * Functions for reading sessionStorage
   */
  getAddress = () => {
    let acc = sessionStorage.get();
    if (!acc || typeof acc !== 'object') return [];
    return [acc.ADDRESS];
  }
  getEncryptedPrivateKey = () => { // the encrypted form of private key
    let acc = sessionStorage.get();
    if (!acc || typeof acc !== 'object') return null;
    return acc.ENCRYPTED_PRIVATEKEY;
  }
  getSalt = () => {
    let acc = sessionStorage.get();
    if (!acc || typeof acc !== 'object') return null;
    return acc.SALT;
  }
}

module.exports = SoftWallet;