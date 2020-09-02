import React, { Component } from 'react';
import { LiteWallet } from 'capsule-core-js';


const DEFAULT_STATE = {
  network: null,
  account: '0x4f4a2740e90accf84dec5ad51dfe78cbb23f8ea2',
  balance: null,
}

class TestLiteWallet extends Component {
  constructor() {
    super();
    this.state = DEFAULT_STATE;
  }

  get = (web3) => {
    this.web3 = web3;
    web3.eth.net.getId((er, re) => {
      if (er) return console.error(er);
      return this.setState({ network: re });
    });
    web3.eth.getBalance(this.state.account, (er, re) => {
      if (er) return console.error(er);
      return this.setState({ balance: re.toString() });
    });
  }

  connectByLiteWallet = () => {
    const opts = {
      address: this.state.account,
      privateKey: '9c5074452915564f3aadc51dc55f6152707552f5f38090877e7819b3f43ed7b9'
    }
    this.liteWallet = new LiteWallet(4);
    this.liteWallet.init(opts, (er, web3) => {
      if (er) return console.error(er);
      return this.get(web3);
    });
  }

  sendTx = () => {
    if (this.web3) this.web3.eth.sendTransaction({
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
        <h1>LiteWallet Test</h1>
        <button onClick={this.connectByLiteWallet}>Connect by LiteWallet</button>
        <p>Network: {this.state.network}</p>
        <p>Account: {this.state.account}</p>
        <p>Balance: {this.state.balance}</p>
        <button onClick={this.sendTx}>Send</button>
      </div>
    );
  }
}

export default TestLiteWallet;