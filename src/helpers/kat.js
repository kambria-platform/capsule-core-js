import ABI from './KAT.json';

class KAT {
  constructor(web3) {
    this.web3 = web3;
    this.contract = new this.web3.eth.Contract(ABI, '0x9dddff7752e1714c99edf940ae834f0d57d68546');
  }

  balanceOf = (address) => {
    return new Promise((resolve, reject) => {
      if (!address) return reject('Invalid input');
      return this.contract.methods.balanceOf(address).call((er, balance) => {
        if (er) return reject(er);
        return resolve(balance);
      });
    });
  }

  transfer = (to, value) => {
    return new Promise((resolve, reject) => {
      return this.web3.eth.getAccounts((er, accounts) => {
        if (er) return reject(er);
        return this.contract.methods.transfer(to, value)
          .send({ from: accounts[0] })
          .on('transactionHash', txId => {
            return resolve(txId);
          })
          .on('error', er => {
            return reject(er);
          });
      });
    });
  }
}

export default KAT;