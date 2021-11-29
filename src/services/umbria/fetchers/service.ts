import { ChainId } from '@sushiswap/sdk'
import { request } from 'http'
import cookie from 'cookie-cutter'
import { BRIDGE_PAIRS, NETWORK_LABEL } from '../../../config/networks'
import { useSourceChain, useDestinationChain } from '../../../state/application/hooks'
export const getSourceChainName = function () {
  const chainId = useSourceChain()

  if (chainId) {
    return NETWORK_LABEL[chainId]
  }

  return null
}

export const getDestinationChainName = function () {
  const chainId = useDestinationChain()

  if (chainId) {
    return NETWORK_LABEL[chainId]
  }

  return null
}

export const getAssetPriceUSD = async (ticker: string) => {
  const prices = await getAssetPricesUSD()
  return prices[ticker]
}

export const getAssetPricesUSD = async () => {
  try {
    const response = await fetch(`https://bridgeapi.umbria.network/api/getAllPrices/`)
    const json = await response.json()

    let resultArray = []
    json.forEach((result) => {
      resultArray[result.ticker] = result.currentPrice
    })
    return resultArray
  } catch (ex) {
    return []
  }
}

export const getGasToTransfer = async (network: string, ticker: string) => {
  try {
    if (network.toLowerCase() == 'poygon') {
      network = 'matic'
    }
    const response = await fetch(
      `https://bridgeapi.umbria.network/api/bridge/getGasToTransfer/?network=${network.toLowerCase()}&ticker=${ticker}`
    )
    const json = await response.json()

    return json
  } catch (ex) {
    return 0
  }
}

export const getGasInNativeTokenPrice = async (network: string, ticker: string) => {
  if (ticker == 'weth' || ticker == 'WETH') {
    ticker = 'eth'
  }

  if (network.toLowerCase() == 'polygon') {
    network = 'matic'
  }

  const response = await fetch(
    `https://bridgeapi.umbria.network/api/bridge/getGasToTransfer/?network=${network.toLowerCase()}&ticker=${ticker}`
  )

  const json = await response.json()

  let costToTransferEth = parseFloat(json.costToTransfer)

  let ethPrice = await getAssetPriceUSD('ETH')

  let tokenPrice = await getAssetPriceUSD(ticker.toUpperCase())

  let ethToTokenRatio = ethPrice / tokenPrice

  let costToTransferToken = ethToTokenRatio * costToTransferEth

  let costToTransferTokenWithLiquidityProviderFee = costToTransferToken * 1.006

  return costToTransferTokenWithLiquidityProviderFee
}

export const getTransactionDetails = async (transactionHash: string) => {
  try {
    const response = await fetch(
      `https://bridgeapi.umbria.network/api/bridge/getTransactionInfo/?txhash=${transactionHash}`
    )
    const json = await response.json()

    return json
  } catch (ex) {
    return {}
  }
}

export const getMaxAssetBridge = async (destinationNetwork: string, ticker: string) => {
  try {
    if (destinationNetwork.toLowerCase() == 'polygon') {
      destinationNetwork = 'matic'
    }
    const response = await fetch(
      `https://bridgeapi.umbria.network/api/bridge/getAvailableLiquidity/?network=${destinationNetwork.toLowerCase()}&currency=${ticker}`
    )

    const json = await response.json()
    if (json && json.totalLiquidity) {
      return json.totalLiquidity * 0.2
    }
    return 0
  } catch (ex) {
    return 0
  }
}

export const getAvailability = async () => {
  const response = await fetch('https://bridgeapi.umbria.network/api/getAvailability/?')
  const json = await response.json()

  if (json && json.maintenance == 0) {
    return true
  }

  return false
}
