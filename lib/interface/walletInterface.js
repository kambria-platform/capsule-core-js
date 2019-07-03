var EventEmitter = require('events');
var util = require('../util');

const ERROR = require('../constant/error');
const CHANGE = require('../constant/change');

class WalletInterface {

  /**
   * Constructor
   * @param {*} net - network id
   * @param {*} type - softwallet/hardwallet/hybridwallet
   * @param {*} restricted - disallow network change
   */
  constructor(net, type, restricted) {
    class Emitter extends EventEmitter { }
    this.emitter = new Emitter();

    this.net = net ? util.getNetworkId(net, 'number') : 1;
    this.type = type;
    this.restricted = restricted;
    this.provider = null;
    this.web3 = null;


    this.user = {
      network: this.net,
      account: null,
      balance: null,
      change: null
    };
  }

  /**
   * Check valid address
   * @param {*} address 
   */
  isAddress = (address) => {
    return this.web3.isAddress(address);
  }

  /**
   * Get network id
   */
  getNetwork = () => {
    return new Promise((resolve, reject) => {
      this.web3.version.getNetwork((er, re) => {
        if (!window.capsuleWallet.isConnected) return reject(ERROR.USER_LOGOUT);
        if (er) return reject(er);
        return resolve(re);
      });
    });
  }

  /**
   * Get account info
   */
  getAccount = () => {
    return new Promise((resolve, reject) => {
      if (!window.capsuleWallet.isConnected) return reject(ERROR.USER_LOGOUT);
      this.web3.eth.getAccounts((er, re) => {
        if (er) return reject(er);
        if (re.length <= 0 || !re[0] || !this.isAddress(re[0])) return reject(ERROR.CANNOT_GET_ACCOUNT);
        return resolve(re[0]);
      });
    });
  }

  /**
   * Get account balance
   * @param {*} address 
   */
  getBalance = (address) => {
    return new Promise((resolve, reject) => {
      if (!window.capsuleWallet.isConnected) return reject(ERROR.USER_LOGOUT);
      if (!this.isAddress(address)) return reject(ERROR.INVALID_ADDRESS);
      this.web3.eth.getBalance(address, (er, re) => {
        if (er) return reject(er);
        return resolve(Number(re));
      });
    });
  }

  /**
   * Fetch info of user
   */
  fetch = () => {
    return new Promise((resolve, reject) => {
      this.getNetwork().then(re => {
        this.user.network = util.getNetworkId(re, 'number');
        return this.getAccount();
      }).then(re => {
        this.user.account = re;
        if (!this.user.account) return reject(ERROR.CANNOT_GET_ACCOUNT);
        return this.getBalance(this.user.account);
      }).then(re => {
        this.user.balance = re;
        let data = JSON.parse(JSON.stringify(this.user));
        return resolve(data);
      }).catch(er => {
        return reject(er);
      });
    });
  }

  /**
   * Watch any changes of provider
   */
  watch = () => {
    return new Promise((resolve) => {
      var watchCurrentAccount = setInterval(() => {
        if (!window.capsuleWallet.isConnected) return stopWatching();

        // Watch switching network event
        this.getNetwork().then(re => {
          if (this.restricted) {
            if (this.user.network !== util.getNetworkId(re, 'number')) {
              return this.emitter.emit('error', ERROR.INVALID_NETWORK);
            }
          }
          else {
            if (this.user.network !== util.getNetworkId(re, 'number')) {
              this.user.network = re;
              this.user.change = CHANGE.NETWORK;
              let data = JSON.parse(JSON.stringify(this.user));
              return this.emitter.emit('data', data);
            }
          }
        }).catch(er => {
          return this.emitter.emit('error', er);
        });
        // Watch switching account event
        this.getAccount().then(re => {
          if (this.user.account !== re) {
            this.user.account = re;
            this.user.change = CHANGE.ACCOUNT;
            let data = JSON.parse(JSON.stringify(this.user));
            return this.emitter.emit('data', data);
          }
        }).catch(er => {
          this.user.account = null;
          return this.emitter.emit('error', er);
        });
        // Watch changing balance event
        if (this.user.account) this.getBalance(this.user.account).then(re => {
          if (this.user.balance !== re) {
            this.user.balance = re;
            this.user.change = CHANGE.BALANCE;
            let data = JSON.parse(JSON.stringify(this.user));
            return this.emitter.emit('data', data);
          }
        }).catch(er => {
          this.user.balance = null;
          return this.emitter.emit('error', er);
        });
      }, 3000);

      var stopWatching = () => {
        clearInterval(watchCurrentAccount);
        this.emitter.removeAllListeners();
      }

      return resolve({ stopWatching: stopWatching, event: this.emitter });
    });
  }
}

module.exports = WalletInterface;