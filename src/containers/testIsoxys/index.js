import React, { Component } from 'react';
import { Isoxys } from 'capsule-js';

const DEFAULT_STATE = {
  visible: false,
  network: null,
  account: null,
  balance: null,
  txId: null,
  error: null
}

class TestIsoxys extends Component {
  constructor() {
    super();
    this.state = DEFAULT_STATE;

    console.log(Isoxys)
  }

  render() {
    return (
      <div>
        <h1>Isoxys Test</h1>
      </div>
    );
  }
}

export default TestIsoxys;