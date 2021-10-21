import { ChainId } from '@sushiswap/sdk'

const rpc = {
  [ChainId.MAINNET]: 'https://rpc.umbria.network/eth/',
  [ChainId.MATIC]: 'https://rpc.umbria.network/matic/',
  [ChainId.BSC]: 'https://rpc.umbria.network/bsc/',
}

export default rpc
