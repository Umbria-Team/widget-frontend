import { ChainId } from '@sushiswap/sdk'
import { request } from 'http'


export const getFee = async (chain: string) => {
    const response = await fetch(`http://bridgeapi.umbria.network/api/bridge/getGasPrice/?network=${chain}`)
    const json = await response.json()
}

export const getAvailability = async () => {
    const response = await fetch('https://bridgeapi.umbria.network/api/getAvailability/?')
    const json = await response.json()

    if(json && json.maintenance == 0) {
        return true
    }

    return false
}