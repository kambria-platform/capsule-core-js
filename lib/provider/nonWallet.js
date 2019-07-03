var Engine = require('./engine').queryc;
var util = require('../util');


class NonWallet {
  /**
   * @constructor
   * @param {*} net - Network id
   */
  constructor(net) {
    this.network = util.getNetworkId(net, 'number');
  }

  /**
   * @func init
   * Initialize web3 
   * @param {*} callback 
   */
  init = (callback) => {
    let engine = new Engine(this.network);
    // We used callback to fomalize code interface with other classes
    return callback(null, engine.web3);
  }
}

module.exports = NonWallet;