import { ChainId } from '@sushiswap/sdk'

const rpc = {
  [ChainId.MAINNET]: 'http://public-rpc-eth.umbria.network',
  [ChainId.MATIC]: 'http://public-rpc-matic.umbria.network',
  [ChainId.BSC]: 'https://rpc.umbria.network/bsc',
  [ChainId.RINKEBY]: 'https://rinkeby.arbitrum.io/rpc',
  [ChainId.MATIC_TESTNET]: 'https://matic-mumbai.chainstacklabs.com',
}

export default rpc
