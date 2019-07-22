var WalletInterface = require('../interface/walletInterface');
var MEWconnect = require('@myetherwallet/mewconnect-web-client');
var Provider = require('../provider');

const SIGNALER_URL = 'https://connect.mewapi.io';
const ERROR = 'The connection was expired';


class MEW extends WalletInterface {
  constructor(net, type, restrict) {
    super(net, type, restrict);

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

  setAccountByMEW = (getAuthentication, callback) => {
    this.mewConnectClient.on('codeDisplay', code => {
      return getAuthentication.open(code, (er, re) => {
        // User close authentication modal
        if (er) return callback(er, null);
      });
    });
    this.mewConnectClient.initiatorStart(SIGNALER_URL);
    this.mewConnectClient.on('RtcConnectedEvent', () => {
      if (this.mewConnectClient.preventDuplicatedEvents) return; // Prevent double calls
      this.mewConnectClient.preventDuplicatedEvents = true;
      getAuthentication.close();
      this.provider = new Provider.HybridWallet(this.net);
      let accOpts = {
        getAddress: this.getAddress,
        signTransaction: this.signTransaction,
        killSession: this.killSession
      }
      this.provider.init(accOpts, (er, web3) => {
        if (er) return callback(er, null);
        this.web3 = web3;
        return callback(null, web3);
      });
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