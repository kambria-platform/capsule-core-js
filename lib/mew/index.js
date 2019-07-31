var WalletInterface = require('../interface/walletInterface');
var MEWconnect = require('@myetherwallet/mewconnect-web-client');
var Provider = require('../provider');

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
  constructor(net, options) {
    super(net, 'hybridwallet');

    /**
     * Init options
     */
    let { getAuthentication, getApproval } = options;
    if (!getAuthentication || !getApproval) throw new Error('Invalid options');
    this.getAuthentication = getAuthentication;
    this.getApproval = getApproval;

    this.mewConnectClient = new MEWconnect.Initiator();
    this.mewConnectClient.preventDuplicatedEvents = false;
    this.mewConnectClient.on('RtcClosedEvent', () => {
      console.log('RtcClosedEvent');
    });
    this.mewConnectClient.on('RtcDisconnectEvent', () => {
      console.log('RtcDisconnectEvent');
      this.mewConnectClient.preventDuplicatedEvents = false;
    });
  }

  /**
   * @func setWallet
   * (Internal function) Set up coinbase
   * @param {*} accOpts 
   */
  setWallet = (accOpts, callback) => {
    this.provider = new Provider.HybridWallet(this.net);
    accOpts.approveTransaction = this.getApproval;
    this.provider.init(accOpts, (er, web3) => {
      if (er) return callback(er, null);
      this.web3 = web3;
      return callback(null, web3);
    });
  }

  setAccountByMEW = (callback) => {
    this.mewConnectClient.on('codeDisplay', code => {
      return this.getAuthentication.open(code, (er, re) => {
        // User close authentication modal
        if (er) return callback(er, null);
      });
    });
    this.mewConnectClient.initiatorStart(SIGNALER_URL);
    this.mewConnectClient.on('RtcConnectedEvent', () => {
      if (this.mewConnectClient.preventDuplicatedEvents) return; // Prevent double calls
      this.mewConnectClient.preventDuplicatedEvents = true;
      this.getAuthentication.close();
      let accOpts = {
        getAddress: this.getAddress,
        signTransaction: this.signTransaction,
        killSession: this.killSession
      }
      this.setWallet(accOpts, callback);
    });
  }

  getAccountsByMEW = (callback) => {
    return this.getAddress((er, re) => {
      if (er) return callback(er, null);
      return (null, [re]);
    });
  }

  getAddress = (callback) => {
    if (this.mewConnectClient.connected) {
      this.mewConnectClient.sendRtcMessage('address', '');
      this.mewConnectClient.once('address', data => {
        return callback(null, data.address);
      });
    } else {
      return callback(ERROR, null);
    }
  }

  signTransaction = (txParams, callback) => {
    if (this.mewConnectClient.connected) {
      this.mewConnectClient.sendRtcMessage('signTx', JSON.stringify(txParams));
      this.mewConnectClient.once('signTx', data => {
        return callback(null, data);
      });
    }
    else {
      return callback(ERROR, null);
    }
  }

  killSession = () => {
    if (this.mewConnectClient.connected) {
      this.mewConnectClient.disconnectRTC();
    }
  }
}

module.exports = MEW;