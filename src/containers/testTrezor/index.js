import React, { Component } from 'react';
import { Trezor } from 'capsule-core-js';

const DEFAULT_STATE = {
  network: null,
  account: null,
  balance: null,
  txId: null,
}

class TestTrezor extends Component {
  constructor() {
    super();
    this.state = { ...DEFAULT_STATE };
  }

  get = (web3) => {
    web3.version.getNetwork((er, re) => {
      if (er) return console.error(er);
      return this.setState({ network: re });
    });
    web3.eth.getAccounts((er, re) => {
      if (er) return console.error(er);
      this.setState({ account: re[0] });

      web3.eth.getBalance(re[0], (er, re) => {
        if (er) return console.error(er);
        return this.setState({ balance: re.toString() });
      });
    });
  }

  connect = () => {
    this.trezor = new Trezor(4, 'hardwallet', true);
    this.trezor.setAccountByTrezorOne("m/44'/60'/0'/0", 0, (er, web3) => {
      if (er) return console.error(er);
      return this.get(web3);
    });
  }

  sendTx = () => {
    this.trezor.web3.eth.sendTransaction({
      from: this.state.account,
      to: '0x5a926b235e992d6ba52d98415e66afe5078a1690',
      value: '1000000000000000'
    }, (er, txId) => {
      if (er) return console.error(er);
      return console.log(txId);
    });
  }

  render() {
    return (
      <div>
        <h1>Trezor Test</h1>
        <button onClick={this.connect}>Connect</button>
        <button onClick={this.sendTx}>Send</button>
        <p>Network: {this.state.network}</p>
        <p>Account: {this.state.account}</p>
        <p>Balance: {this.state.balance}</p>
      </div>
    );
  }
}

export default TestTrezor;