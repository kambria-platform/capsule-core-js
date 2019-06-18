import React, { Component } from 'react';
import { Metamask } from 'capsule-js';

const DEFAULT_STATE = {
  visible: false,
  network: null,
  account: null,
  balance: null,
  txId: null,
  error: null
}

class TestMetamask extends Component {
  constructor() {
    super();
    this.state = DEFAULT_STATE;

    console.log(Metamask)
  }

  render() {
    return (
      <div>
        <h1>Metamask Test</h1>
      </div>
    );
  }
}

export default TestMetamask;