const CODE = '35a3ead2848046f590ba4a244547f0c5';

// https://eips.ethereum.org/EIPS/eip-155
const RPC = {
  MAINNET: {
    id: 1,
    rpc: 'https://mainnet.infura.io/v3/' + CODE
  },
  ROPSTEN: {
    id: 3,
    rpc: 'https://ropsten.infura.io/v3/' + CODE
  },
  RINKEBY: {
    id: 4,
    rpc: 'https://rinkeby.infura.io/v3/' + CODE
  },
  GOERLI: {
    id: 5,
    rpc: 'https://goerli.infura.io/v3/' + CODE
  },
  KOVAN: {
    id: 42,
    rpc: 'https://kovan.infura.io/v3/' + CODE
  },
  DEFAULT: {
    id: 1337,
    rpc: 'http://localhost:9545'
  }
}

let getRPC = (net) => {
  switch (net) {
    case 1:
      return RPC.MAINNET.rpc;
    case 3:
      return RPC.ROPSTEN.rpc;
    case 4:
      return RPC.RINKEBY.rpc;
    case 5:
      return RPC.GOERLI.rpc;
    case 42:
      return RPC.KOVAN.rpc;
    case 'mainnet':
      return RPC.MAINNET.rpc;
    case 'ropsten':
      return RPC.ROPSTEN.rpc;
    case 'rinkeby':
      return RPC.RINKEBY.rpc;
    case 'goerli':
      return RPC.GOERLI.rpc;
    case 'kovan':
      return RPC.KOVAN.rpc;
    default:
      return RPC.DEFAULT.rpc;
  }
}

module.exports = getRPC;