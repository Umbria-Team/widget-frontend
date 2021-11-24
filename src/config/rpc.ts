import { ChainId } from '@sushiswap/sdk'

const rpc = {
  [ChainId.MAINNET]: 'https://rpc.umbria.network/eth',
  [ChainId.MATIC]: 'https://rpc.umbria.network/matic',
  [ChainId.BSC]: 'https://rpc.umbria.network/bsc',
  [ChainId.RINKEBY]: 'https://rinkeby.arbitrum.io/rpc',
  [ChainId.MATIC_TESTNET]: 'https://matic-mumbai.chainstacklabs.com',
}

export default rpc
