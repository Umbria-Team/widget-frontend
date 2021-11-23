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
    const response = await fetch(
      `https://bridgeapi.umbria.network/api/bridge/getGasToTransfer/?network=${network}&ticker=${ticker}`
    )
    const json = await response.json()

    return json
  } catch (ex) {
    return 0
  }
}

export const getGasInNativeTokenPrice = async (network: string, ticker: string) => {
  const response = await fetch(
    `https://bridgeapi.umbria.network/api/bridge/getGasToTransfer/?network=${network}&ticker=${ticker}`
  )

  const json = await response.json()

  let costToTransferEth = parseFloat(json.costToTransfer)

  let ethPrice = await getAssetPriceUSD('ETH')

  let tokenPrice = await getAssetPriceUSD(ticker)

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
    const response = await fetch(
      `https://bridgeapi.umbria.network/api/bridge/getAvailableLiquidity/?network=${destinationNetwork}&currency=${ticker}`
    )

    console.log(destinationNetwork, ticker)

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
