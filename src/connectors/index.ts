import { BscConnector } from '@binance-chain/bsc-connector'
import { ChainId } from '@sushiswap/sdk'
import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '../entities/NetworkConnector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { Web3Provider } from '@ethersproject/providers'

const RPC = {
  [ChainId.MAINNET]: 'https://public-rpc-eth.umbria.network/',
  [ChainId.MATIC]: 'https://public-rpc-matic.umbria.network/',
  [ChainId.BSC]: 'https://rpc.umbria.network/bsc',
}

export function getNetwork(defaultChainId, urls = RPC) {
  return new NetworkConnector({
    defaultChainId,
    urls,
  })
}

export const network = new NetworkConnector({
  defaultChainId: 1,
  urls: RPC,
})

let networkLibrary: Web3Provider | undefined

export function getNetworkLibrary(): Web3Provider {
  return (networkLibrary = networkLibrary ?? new Web3Provider(network.provider as any))
}

const supportedChainIds = [
  1, // mainnet
  137, // matic
  80001, // mumbai
  56, // binance smart chain
]

export const injected = new InjectedConnector({
  supportedChainIds,
})

// mainnet only
export const walletconnect = new WalletConnectConnector({
  rpc: RPC,
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  supportedChainIds,
  // pollingInterval: 15000,
})

// mainnet only
export const walletlink = new WalletLinkConnector({
  url: RPC[ChainId.MAINNET],
  appName: 'SushiSwap',
  appLogoUrl: 'https://raw.githubusercontent.com/sushiswap/art/master/sushi/logo-256x256.png',
})

// binance only
export const binance = new BscConnector({ supportedChainIds: [56] })
