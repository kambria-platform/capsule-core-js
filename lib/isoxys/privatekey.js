var ethUtil = require('ethereumjs-util');
var util = require('../util');

/**
 * Softwallet type
 */
let Privatekey = {}

Privatekey.privatekeyToAccount = (priv) => {
  if (!priv) return null;
  if (typeof priv === 'string') priv = new Buffer(priv, 'hex');
  else if (!Buffer.isBuffer(priv)) return null;
  if (!ethUtil.isValidPrivate(priv)) return null;
  let addr = ethUtil.privateToAddress(priv);
  return { address: util.padHex(addr.toString('hex')), privateKey: priv.toString('hex') }
}

module.exports = Privatekey;