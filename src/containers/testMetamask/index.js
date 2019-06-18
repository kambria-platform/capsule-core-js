import React, { Component } from 'react';
import { Metamask } from 'capsule-core-js';

const DEFAULT_STATE = {
  network: null,
  account: null,
  balance: null,
  txId: null,
}

class TestMetamask extends Component {
  constructor() {
    super();
    this.state = DEFAULT_STATE;

    this.get = this.get.bind(this);
    this.connect = this.connect.bind(this);
  }

  get(web3) {
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

  connect() {
    this.metamask = new Metamask(4, 'softwallet', true);
    this.metamask.setAccountByMetamask((er, web3) => {
      if (er) return console.error(er);

      return this.get(web3);
    });
  }

  render() {
    return (
      <div>
        <h1>Metamask Test</h1>
        <button onClick={this.connect}>Connect</button>
        <p>Network: {this.state.network}</p>
        <p>Account: {this.state.account}</p>
        <p>Balance: {this.state.balance}</p>
      </div>
    );
  }
}

export default TestMetamask;