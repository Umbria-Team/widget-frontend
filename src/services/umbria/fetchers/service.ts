import { ChainId } from '@sushiswap/sdk'
import { request } from 'http'
import cookie from 'cookie-cutter'
import { BRIDGE_PAIRS, NETWORK_LABEL } from '../../../config/networks'

export const getSourceChainName = function () {
  const chainId = cookie.get('chainId')

  if (chainId) {
    return NETWORK_LABEL[chainId].toLowerCase()
  }

  return null
}

export const getDestinationChainName = function () {
  const chainId = cookie.get('otherChainId')

  if (chainId) {
    return NETWORK_LABEL[chainId].toLowerCase()
  }

  return null
}

export const getFee = async (chain: string) => {
  const response = await fetch(`https://bridgeapi.umbria.network/api/bridge/getGasPrice/?network=${chain}`)
  const json = await response.json()

  return json
}

export const getGasToTransfer = async (network: string, ticker: string) => {
  const response = await fetch(
    `https://bridgeapi.umbria.network/api/bridge/getGasToTransfer/?network=${network}&ticker=${ticker}`
  )
  const json = await response.json()

  return json
}

export const getTransactionDetails = async (transactionHash: string) => {
  const response = await fetch(
    `https://bridgeapi.umbria.network/api/bridge/getTransactionInfo/?txhash=${transactionHash}`
  )
  const json = await response.json()

  return json
}

export const getFeeForTransactionType = async (network: string, ticker: string) => {
  const response = await fetch(
    `https://bridgeapi.umbria.network/api/bridge/getGasToTransfer/?network=${network}&ticker=${ticker}`
  )
  const json = await response.json()
  return json
}

export const getMaxAssetBridge = async (destinationNetwork: string, ticker: string) => {
  const response = await fetch(
    `https://bridgeapi.umbria.network/api/bridge/getAvailableLiquidity/?network=${destinationNetwork}&currency=${ticker}`
  )

  console.log(destinationNetwork, ticker)

  const json = await response.json()
  return json.totalLiquidity * 0.2
}

export const getAvailability = async () => {
  const response = await fetch('https://bridgeapi.umbria.network/api/getAvailability/?')
  const json = await response.json()

  if (json && json.maintenance == 0) {
    return true
  }

  return false
}
