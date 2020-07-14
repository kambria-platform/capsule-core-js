var WalletInterface = require('../interface/walletInterface');
import MEWconnect from '@myetherwallet/mewconnect-web-client';
var Provider = require('../provider');
var Web3 = require('web3');

const SIGNALER_URL = 'https://connect.mewapi.io';
const ERROR = 'The connection was expired';


class MEW extends WalletInterface {
  /**
   * Constructor
   * @param {*} net 
   * @param {*} options - extra options for specific wallets
   * getAuthentication
   * getApproval
   */
  constructor(net) {
    super(net, 'hybridwallet');

  }

  setAccountByMEW = (callback) => {
    const mewConnect = new MEWconnect.Provider()
    this.provider = mewConnect.makeWeb3Provider(this.net);
    if (!this.provider)
      return callback(ERROR.CANNOT_FOUND_PROVIDER, null);

    this.web3 = new Web3(this.provider);
    return this.provider.enable().then(re => {
      this.web3.killSession = this.killSession;
      return callback(null, this.web3);
    }).catch(er => {
      return callback(er, null);
    });
  }

  killSession = () => { /* Do nothing, just for consistent API */ }
}

module.exports = MEW;