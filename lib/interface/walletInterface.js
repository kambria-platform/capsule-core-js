var util = require('../util');
const ERROR = require('../constant/error');

class WalletInterface {

  /**
   * Constructor
   * @param {*} net - network id
   * @param {*} type - softwallet/hardwallet/hybridwallet
   */
  constructor(net, type) {
    this.net = util.getNetworkId(net, 'number');
    this.type = type;
    this.provider = null;
    this.web3 = null;
    this.filter = null;

    this.user = {
      network: this.net,
      account: null,
      balance: null,
    };
  }

  /**
   * Check valid address
   * @param {*} address 
   */
  isAddress = (address) => {
    if (!this.web3) return new Error(ERROR.CANNOT_FOUND_PROVIDER);
    return this.web3.utils.isAddress(address);
  }

  /**
   * Get network id
   */
  getNetwork = () => {
    return new Promise((resolve, reject) => {
      if (!this.web3) return reject(ERROR.CANNOT_FOUND_PROVIDER);
      return resolve(this.web3.eth.net.getId());
    });
  }

  /**
   * Get account info
   */
  getAccount = () => {
    return new Promise((resolve, reject) => {
      if (!this.web3) return reject(ERROR.CANNOT_FOUND_PROVIDER);
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
      if (!this.web3) return reject(ERROR.CANNOT_FOUND_PROVIDER);
      if (!this.isAddress(address)) return reject(ERROR.INVALID_ADDRESS);
      this.web3.eth.getBalance(address, 'latest', (er, re) => {
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
      let data = {};
      this.getNetwork().then(re => {
        data.network = util.getNetworkId(re, 'number');
        return this.getAccount();
      }).then(re => {
        data.account = re;
        if (!data.account) return reject(ERROR.CANNOT_GET_ACCOUNT);
        return this.getBalance(data.account);
      }).then(re => {
        data.balance = re;
        return resolve(data);
      }).catch(er => {
        return reject(er);
      });
    });
  }

  /**
   * Watch any changes of provider
   */
  _watch = (callback) => {
    this.fetch().then(re => {
      let changedFlag = false;
      // Network changed
      if (this.user.network !== util.getNetworkId(re.network, 'number')) return callback(ERROR.INVALID_NETWORK, null);
      // Account changed
      if (this.user.account !== re.account) {
        this.user.account = re.account;
        changedFlag = true;
      }
      // Balance changed
      if (this.user.balance !== re.balance) {
        this.user.balance = re.balance;
        changedFlag = true;
      }
      // Only call back when having a change
      if (changedFlag) return callback(null, JSON.parse(JSON.stringify(this.user)));
    }).catch(er => {
      return callback(er, null);
    });
  }
  watch = (callback) => {
    // Check web3 instance
    if (!this.web3) {
      callback(ERROR.CANNOT_FOUND_PROVIDER, null);
      return null;
    }
    if (!this.filter) this.filter = this.web3.eth.subscribe('newBlockHeaders');
    // Called for the first time
    this._watch(callback);
    // Called when new blocks coming
    this.filter.on('data', () => {
      this._watch(callback);
    });
    // Web3ProviderEngine does not support synchronous
    return { stopWatching: () => this.filter.unsubscribe() };
  }

  /**
   * Logout
   */
  logout = () => {
    // Stop watching
    if (this.filter) this.filter.unsubscribe(() => { });
    // Kill the session
    this.web3.killSession();
    // Clear global vars
    this.web3 = null;
    this.provider = null;
  }
}

module.exports = WalletInterface;